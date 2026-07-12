from fastapi import APIRouter, Depends, Query
from models.booking_model import CreateBooking, RescheduleBooking
from controllers.booking_controller import BookingController
from utils.rbac import require_any_authenticated
from typing import Optional

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("")
async def create_booking(booking_in: CreateBooking, user=Depends(require_any_authenticated)):
    return await BookingController.create_booking(booking_in, user["user_id"])


@router.get("")
async def list_bookings(
    asset_id: Optional[str] = None,
    employee_id: Optional[str] = None,
    user=Depends(require_any_authenticated)
):
    # Employees can only query their own bookings directly, unless searching resource schedule
    if user["role"] == "EMPLOYEE" and not asset_id:
        employee_id = user["user_id"]
    return await BookingController.list_bookings(asset_id, employee_id)


@router.patch("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, user=Depends(require_any_authenticated)):
    return await BookingController.cancel_booking(booking_id, user["user_id"], user["role"])


@router.patch("/{booking_id}/reschedule")
async def reschedule_booking(booking_id: str, resched_in: RescheduleBooking, user=Depends(require_any_authenticated)):
    return await BookingController.reschedule_booking(booking_id, resched_in, user["user_id"], user["role"])
