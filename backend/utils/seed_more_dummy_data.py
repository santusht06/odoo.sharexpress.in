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

import asyncio
import os
import sys
import random
from uuid import uuid4
from datetime import datetime, timedelta
import qrcode
import io
import base64

# Adjust Python path to load parent modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.database import get_db
from models.user_model import RoleEnum
from models.asset_model import AssetStatus, AssetCondition

db = get_db()

def generate_qr_code(asset_id, asset_tag):
    qr_img = qrcode.make(f"asset_id:{asset_id},tag:{asset_tag}")
    buffered = io.BytesIO()
    qr_img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{qr_base64}"

async def seed_more_dummy_data():
    print("Fetching existing database records...")
    
    # 1. Fetch existing categories and departments
    categories = await db.categories.find().to_list(length=10)
    departments = await db.departments.find().to_list(length=10)
    users = await db.users.find({"deleted_at": None}).to_list(length=20)
    
    if not categories or not departments or not users:
        print("Error: Base seed data not found. Please run seed_dummy_data.py first.")
        return
        
    category_map = {c["name"]: c["category_id"] for c in categories}
    department_map = {d["name"]: d["department_id"] for d in departments}
    
    # Map users by role
    employees = [u for u in users if u["role"] == RoleEnum.EMPLOYEE]
    managers = [u for u in users if u["role"] == RoleEnum.ASSET_MANAGER]
    heads = [u for u in users if u["role"] == RoleEnum.DEPARTMENT_HEAD]
    
    # 2. Define extra assets to seed
    extra_assets_info = [
        # Laptops & Desktops
        {"name": "MacBook Pro 14\" (M3 Pro, 18GB RAM)", "category": "Laptops & Desktops", "cost": 1999.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.NEW, "loc": "Central Storage"},
        {"name": "Dell XPS 15 9530", "category": "Laptops & Desktops", "cost": 1849.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Central Storage"},
        {"name": "MacBook Air 13\" (M2, 16GB RAM)", "category": "Laptops & Desktops", "cost": 1299.0, "status": AssetStatus.ALLOCATED, "condition": AssetCondition.GOOD, "loc": "Design Bay Desk 2"},
        {"name": "Lenovo ThinkPad X1 Carbon Gen 11", "category": "Laptops & Desktops", "cost": 2049.0, "status": AssetStatus.ALLOCATED, "condition": AssetCondition.GOOD, "loc": "Executive Suite A"},
        {"name": "HP EliteBook 840 G10", "category": "Laptops & Desktops", "cost": 1399.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Central Storage"},
        {"name": "iMac 24\" (M3, 8-Core GPU)", "category": "Laptops & Desktops", "cost": 1499.0, "status": AssetStatus.ALLOCATED, "condition": AssetCondition.NEW, "loc": "Marketing Studio Desk 1"},
        
        # Display Monitors
        {"name": "LG UltraFine 27\" 5K Monitor", "category": "Display Monitors", "cost": 1299.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Central Storage"},
        {"name": "Samsung Odyssey G9 49\" Curved", "category": "Display Monitors", "cost": 1499.0, "status": AssetStatus.UNDER_MAINTENANCE, "condition": AssetCondition.FAIR, "loc": "Hardware Lab C"},
        {"name": "ASUS ProArt 32\" 4K HDR Monitor", "category": "Display Monitors", "cost": 999.0, "status": AssetStatus.ALLOCATED, "condition": AssetCondition.NEW, "loc": "Design Bay Desk 1"},
        {"name": "Dell 27\" Video Conferencing Monitor", "category": "Display Monitors", "cost": 499.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Meeting Room Tahoe"},
        
        # Dev & Test Servers
        {"name": "HPE ProLiant DL360 Gen11", "category": "Dev & Test Servers", "cost": 4500.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Server Room Rack A1"},
        {"name": "Dell PowerEdge R760 Server", "category": "Dev & Test Servers", "cost": 5200.0, "status": AssetStatus.ALLOCATED, "condition": AssetCondition.NEW, "loc": "Server Room Rack A2"},
        {"name": "Synology DiskStation DS1821+ NAS", "category": "Dev & Test Servers", "cost": 999.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "IT Admin Office"},
        
        # Meeting Rooms
        {"name": "Conference Room Tahoe (8 Seats)", "category": "Meeting Rooms", "cost": 0.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Office Floor 1, Block B"},
        {"name": "Conference Room Denali (12 Seats)", "category": "Meeting Rooms", "cost": 0.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Office Floor 3, Block A"},
        {"name": "Huddle Space Zion (4 Seats)", "category": "Meeting Rooms", "cost": 0.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Office Floor 2, Block C"},
        
        # Company Vehicles
        {"name": "Tesla Model 3 (Sales Unit 1)", "category": "Company Vehicles", "cost": 38990.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Basement Parking B2"},
        {"name": "Ford F-150 Lightning (Ops Utility)", "category": "Company Vehicles", "cost": 55900.0, "status": AssetStatus.AVAILABLE, "condition": AssetCondition.GOOD, "loc": "Loading Bay Yard"},
    ]
    
    print(f"Seeding {len(extra_assets_info)} additional enterprise assets...")
    
    seeded_assets = []
    current_tag_num = 1009
    
    for info in extra_assets_info:
        asset_id = str(uuid4())
        tag = f"AF-{current_tag_num}"
        current_tag_num += 1
        
        cat_id = category_map.get(info["category"])
        if not cat_id:
            continue
            
        # Assign department randomly if allocated
        dept_id = None
        if info["status"] == AssetStatus.ALLOCATED:
            dept_id = random.choice([d["department_id"] for d in departments])
            
        asset = {
            "asset_id": asset_id,
            "asset_tag": tag,
            "name": info["name"],
            "serial_number": f"SN-{random.randint(100000, 999999)}-AF",
            "category_id": cat_id,
            "cost": info["cost"],
            "purchase_date": (datetime.utcnow() - timedelta(days=random.randint(30, 360))).strftime("%Y-%m-%d"),
            "condition": info["condition"],
            "location": info["loc"],
            "department_id": dept_id,
            "is_bookable": info["category"] in ["Meeting Rooms", "Company Vehicles"],
            "description": f"Seeded additional inventory record for {info['name']}.",
            "status": info["status"],
            "qr_code_data_url": generate_qr_code(asset_id, tag),
            "photos": [],
            "documents": [],
            "created_at": datetime.utcnow() - timedelta(days=90),
            "updated_at": datetime.utcnow()
        }
        
        seeded_assets.append(asset)
        
    await db.assets.insert_many(seeded_assets)
    print(f"Successfully seeded {len(seeded_assets)} new assets.")
    
    # 3. Create extra allocations
    extra_allocs = []
    allocated_assets = [a for a in seeded_assets if a["status"] == AssetStatus.ALLOCATED]
    
    print(f"Creating allocations for {len(allocated_assets)} assets...")
    for idx, asset in enumerate(allocated_assets):
        user = users[idx % len(users)]
        
        # Make one allocation overdue, one active, one returned
        status = "Active"
        expected_days = 90
        allocated_days_ago = 10
        
        if idx == 0:
            status = "Overdue"
            expected_days = -3  # Due 3 days ago
            allocated_days_ago = 45
        elif idx == 1:
            status = "Returned"
            expected_days = 30
            allocated_days_ago = 20
            
        expected_return = (datetime.utcnow() + timedelta(days=expected_days)).strftime("%Y-%m-%d")
        
        alloc = {
            "allocation_id": str(uuid4()),
            "asset_id": asset["asset_id"],
            "asset_name": asset["name"],
            "asset_tag": asset["asset_tag"],
            "allocated_to": user["user_id"],
            "allocated_to_name": user["name"],
            "allocated_at": datetime.utcnow() - timedelta(days=allocated_days_ago),
            "expected_return_date": expected_return,
            "notes": "Standard department issue.",
            "status": status,
            "returned_at": datetime.utcnow() - timedelta(days=2) if status == "Returned" else None,
            "return_condition": AssetCondition.GOOD if status == "Returned" else None,
            "return_notes": "Returned on time, normal wear." if status == "Returned" else None
        }
        extra_allocs.append(alloc)
        
        # If returned, flip asset status back to Available
        if status == "Returned":
            await db.assets.update_one({"asset_id": asset["asset_id"]}, {"$set": {"status": AssetStatus.AVAILABLE}})
        elif status == "Overdue":
            await db.assets.update_one({"asset_id": asset["asset_id"]}, {"$set": {"status": AssetStatus.ALLOCATED}})
            
    if extra_allocs:
        await db.allocations.insert_many(extra_allocs)
        print(f"Successfully seeded {len(extra_allocs)} allocations.")
        
    # 4. Create extra bookings
    bookable_assets = [a for a in seeded_assets if a["is_bookable"]]
    extra_bookings = []
    
    print(f"Creating bookings for {len(bookable_assets)} bookable assets...")
    for idx, asset in enumerate(bookable_assets):
        user = random.choice(users)
        
        # Create an upcoming booking
        start = datetime.utcnow() + timedelta(days=random.randint(1, 5), hours=random.randint(1, 8))
        end = start + timedelta(hours=random.randint(1, 3))
        
        booking = {
            "booking_id": str(uuid4()),
            "asset_id": asset["asset_id"],
            "asset_name": asset["name"],
            "location": asset["location"],
            "booked_by": user["user_id"],
            "booked_by_name": user["name"],
            "start_time": start,
            "end_time": end,
            "purpose": f"Seeded demo booking for {asset['name']}.",
            "status": "Upcoming",
            "created_at": datetime.utcnow() - timedelta(days=1)
        }
        extra_bookings.append(booking)
        
    if extra_bookings:
        await db.bookings.insert_many(extra_bookings)
        print(f"Successfully seeded {len(extra_bookings)} bookings.")
        
    # 5. Create extra maintenance requests
    maintenance_assets = [a for a in seeded_assets if a["status"] == AssetStatus.UNDER_MAINTENANCE]
    extra_maint = []
    
    print(f"Creating maintenance records...")
    for asset in maintenance_assets:
        user = random.choice(users)
        maint = {
            "request_id": str(uuid4()),
            "asset_id": asset["asset_id"],
            "asset_tag": asset["asset_tag"],
            "asset_name": asset["name"],
            "issue_description": "Flickers when connected to M3 Max MacBook via DisplayPort cable.",
            "priority": "High",
            "status": "Under Repair",
            "technician_name": "Sarah Maintenance Team",
            "resolution_notes": None,
            "created_by": user["user_id"],
            "created_at": datetime.utcnow() - timedelta(days=2),
            "updated_at": datetime.utcnow()
        }
        extra_maint.append(maint)
        
    if extra_maint:
        await db.maintenance.insert_many(extra_maint)
        print(f"Successfully seeded {len(extra_maint)} maintenance requests.")
        
    # 6. Add some recent activity logs
    activity_logs = []
    for _ in range(15):
        user = random.choice(users)
        actions_list = ["UPDATE", "ALLOCATE", "REPAIR_REQUEST", "BOOKING_CREATE"]
        action = random.choice(actions_list)
        entity = "ASSET"
        if action == "BOOKING_CREATE":
            entity = "BOOKING"
        elif action == "REPAIR_REQUEST":
            entity = "MAINTENANCE"
            
        log = {
            "log_id": str(uuid4()),
            "user_id": user["user_id"],
            "actor_name": user["name"],
            "action": action,
            "entity_type": entity,
            "entity_id": str(uuid4()),
            "details": f"Dynamic simulation log for {action.lower()} action.",
            "timestamp": datetime.utcnow() - timedelta(minutes=random.randint(10, 1440))
        }
        activity_logs.append(log)
        
    await db.activity_logs.insert_many(activity_logs)
    print("Successfully seeded 15 new activity logs.")
    
    print("\nMore dynamic dummy data successfully loaded into the database!")

if __name__ == "__main__":
    asyncio.run(seed_more_dummy_data())
