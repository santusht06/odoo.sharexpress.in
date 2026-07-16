# Copyright 2026 Sharexpress Contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from models.booking_model import CreateBooking, RescheduleBooking
from fastapi import HTTPException
from core.database import get_db
from datetime import datetime, timezone
from uuid import uuid4
from utils.activity_logger import log_activity
from utils.notifications import notify_user

db = get_db()

class BookingController:
    @staticmethod
    async def create_booking(booking_in: CreateBooking, actor_id: str):
        # 1. Verify resource exists and is bookable
        asset = await db.assets.find_one({"asset_id": booking_in.asset_id})
        if not asset:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        if not asset.get("is_bookable"):
            raise HTTPException(status_code=400, detail="This asset is not a shared bookable resource")

        if asset.get("status") in ["Retired", "Disposed", "Lost"]:
            raise HTTPException(status_code=400, detail=f"This resource is '{asset.get('status')}' and cannot be booked")

        try:
            start_dt = datetime.fromisoformat(booking_in.start_time)
            end_dt = datetime.fromisoformat(booking_in.end_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO-8601.")

        if start_dt.tzinfo is not None:
            start_dt = start_dt.astimezone(timezone.utc).replace(tzinfo=None)
        if end_dt.tzinfo is not None:
            end_dt = end_dt.astimezone(timezone.utc).replace(tzinfo=None)

        if start_dt >= end_dt:
            raise HTTPException(status_code=400, detail="End time must be after start time")

        if start_dt < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Cannot book slots in the past")

        # 2. Enforce overlap validation: Two bookings cannot overlap for the same resource
        # Query overlaps: existing booking start < request end AND existing booking end > request start
        overlap = await db.bookings.find_one({
            "asset_id": booking_in.asset_id,
            "status": "Upcoming",
            "start_time": {"$lt": end_dt},
            "end_time": {"$gt": start_dt}
        })
        if overlap:
            raise HTTPException(
                status_code=400,
                detail="Resource is already booked during this time-slot. Please select another slot."
            )

        # Retrieve user department
        user = await db.users.find_one({"user_id": actor_id})
        dept_id = user.get("department_id") if user else None

        booking_id = str(uuid4())
        new_booking = {
            "booking_id": booking_id,
            "asset_id": booking_in.asset_id,
            "booked_by": actor_id,
            "department_id": dept_id,
            "start_time": start_dt,
            "end_time": end_dt,
            "purpose": booking_in.purpose,
            "status": "Upcoming",
            "created_at": datetime.utcnow()
        }

        await db.bookings.insert_one(new_booking)
        new_booking.pop("_id", None)

        # Notify booking user
        await notify_user(
            actor_id,
            "BOOKING_CONFIRMED",
            "Resource Booking Confirmed",
            f"Your booking for '{asset.get('name')}' is confirmed from {booking_in.start_time} to {booking_in.end_time}."
        )

        await log_activity(actor_id, "BOOK_RESOURCE", "BOOKING", booking_id, new_value=new_booking)
        return {"success": True, "booking": new_booking}

    @staticmethod
    async def list_bookings(asset_id: str = None, employee_id: str = None):
        # Auto complete old bookings
        await BookingController.auto_complete_bookings()

        query = {}
        if asset_id:
            query["asset_id"] = asset_id
        if employee_id:
            query["booked_by"] = employee_id

        cursor = db.bookings.find(query, {"_id": 0}).sort("start_time", 1)
        bookings = []
        async for doc in cursor:
            # Join asset details
            asset = await db.assets.find_one({"asset_id": doc.get("asset_id")})
            if asset:
                doc["asset_name"] = asset.get("name")
                doc["asset_tag"] = asset.get("asset_tag")
                doc["location"] = asset.get("location")

            # Join user details
            user = await db.users.find_one({"user_id": doc.get("booked_by")})
            if user:
                doc["booked_by_name"] = user.get("name")
                doc["booked_by_email"] = user.get("email")

            bookings.append(doc)
        return {"success": True, "bookings": bookings}

    @staticmethod
    async def cancel_booking(booking_id: str, actor_id: str, actor_role: str):
        booking = await db.bookings.find_one({"booking_id": booking_id})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if booking.get("status") != "Upcoming":
            raise HTTPException(status_code=400, detail="Only upcoming bookings can be cancelled")

        # Allow cancellation if actor is the booking owner, Admin or Asset Manager
        if actor_role not in ["ADMIN", "ASSET_MANAGER"] and booking["booked_by"] != actor_id:
            raise HTTPException(status_code=403, detail="You do not have permission to cancel this booking")

        await db.bookings.update_one(
            {"booking_id": booking_id},
            {"$set": {"status": "Cancelled", "updated_at": datetime.utcnow()}}
        )

        asset = await db.assets.find_one({"asset_id": booking["asset_id"]})
        
        # Notify
        await notify_user(
            booking["booked_by"],
            "BOOKING_CANCELLED",
            "Booking Cancelled",
            f"Your booking for '{asset.get('name') if asset else 'Resource'}' has been cancelled."
        )

        await log_activity(actor_id, "CANCEL_BOOKING", "BOOKING", booking_id)
        return {"success": True, "message": "Booking cancelled successfully"}

    @staticmethod
    async def reschedule_booking(booking_id: str, resched_in: RescheduleBooking, actor_id: str, actor_role: str):
        booking = await db.bookings.find_one({"booking_id": booking_id})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if booking.get("status") != "Upcoming":
            raise HTTPException(status_code=400, detail="Only upcoming bookings can be rescheduled")

        if actor_role not in ["ADMIN", "ASSET_MANAGER"] and booking["booked_by"] != actor_id:
            raise HTTPException(status_code=403, detail="You do not have permission to reschedule this booking")

        try:
            start_dt = datetime.fromisoformat(resched_in.start_time)
            end_dt = datetime.fromisoformat(resched_in.end_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO-8601.")

        if start_dt.tzinfo is not None:
            start_dt = start_dt.astimezone(timezone.utc).replace(tzinfo=None)
        if end_dt.tzinfo is not None:
            end_dt = end_dt.astimezone(timezone.utc).replace(tzinfo=None)

        if start_dt >= end_dt:
            raise HTTPException(status_code=400, detail="End time must be after start time")

        if start_dt < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Cannot book slots in the past")

        # Overlap check (excluding the current booking being rescheduled)
        overlap = await db.bookings.find_one({
            "booking_id": {"$ne": booking_id},
            "asset_id": booking["asset_id"],
            "status": "Upcoming",
            "start_time": {"$lt": end_dt},
            "end_time": {"$gt": start_dt}
        })
        if overlap:
            raise HTTPException(
                status_code=400,
                detail="Resource is already booked during this time-slot. Please select another slot."
            )

        await db.bookings.update_one(
            {"booking_id": booking_id},
            {
                "$set": {
                    "start_time": start_dt,
                    "end_time": end_dt,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        asset = await db.assets.find_one({"asset_id": booking["asset_id"]})
        
        # Notify
        await notify_user(
            booking["booked_by"],
            "BOOKING_RESCHEDULED",
            "Booking Rescheduled",
            f"Your booking for '{asset.get('name') if asset else 'Resource'}' has been rescheduled."
        )

        await log_activity(actor_id, "RESCHEDULE_BOOKING", "BOOKING", booking_id, details=f"New slot: {resched_in.start_time} - {resched_in.end_time}")
        return {"success": True, "message": "Booking rescheduled successfully"}

    @staticmethod
    async def auto_complete_bookings():
        now = datetime.utcnow()
        await db.bookings.update_many(
            {"status": "Upcoming", "end_time": {"$lt": now}},
            {"$set": {"status": "Completed"}}
        )
