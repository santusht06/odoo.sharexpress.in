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

# Utility to generate base64 QR code data urls
def generate_qr_code(asset_id, asset_tag):
    qr_img = qrcode.make(f"asset_id:{asset_id},tag:{asset_tag}")
    buffered = io.BytesIO()
    qr_img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{qr_base64}"

async def seed_dummy_data():
    print("Initializing Database Seeding for AssetFlow...")
    
    # 1. Clear Existing Test Collections
    await db.departments.delete_many({})
    await db.categories.delete_many({})
    await db.assets.delete_many({})
    await db.allocations.delete_many({})
    await db.transfers.delete_many({})
    await db.bookings.delete_many({})
    await db.maintenance.delete_many({})
    await db.audits.delete_many({})
    
    # 2. Seed Departments
    dept_eng_id = str(uuid4())
    dept_prd_id = str(uuid4())
    dept_ops_id = str(uuid4())
    
    departments = [
      {
        "department_id": dept_eng_id,
        "name": "Engineering",
        "description": "Software development, server infrastructure, and developer setups",
        "status": "Active",
        "parent_id": None,
        "head_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
      },
      {
        "department_id": dept_prd_id,
        "name": "Product & Design",
        "description": "UX design, UI mockup, and product requirements",
        "status": "Active",
        "parent_id": None,
        "head_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
      },
      {
        "department_id": dept_ops_id,
        "name": "Corporate Operations",
        "description": "Office logistics, finance, and support workflows",
        "status": "Active",
        "parent_id": None,
        "head_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
      }
    ]
    await db.departments.insert_many(departments)
    print("Seeded 3 Departments.")

    # 3. Seed Categories
    cat_lap_id = str(uuid4())
    cat_mon_id = str(uuid4())
    cat_srv_id = str(uuid4())
    cat_rm_id = str(uuid4())
    cat_veh_id = str(uuid4())

    categories = [
      {
        "category_id": cat_lap_id,
        "name": "Laptops & Desktops",
        "description": "Company workstations, developer laptops, and iMac setups",
        "custom_fields": [
          {"field_name": "RAM (GB)", "field_type": "number", "required": True},
          {"field_name": "Storage (GB)", "field_type": "number", "required": True},
          {"field_name": "Processor", "field_type": "text", "required": False}
        ]
      },
      {
        "category_id": cat_mon_id,
        "name": "Display Monitors",
        "description": "High resolution external monitors and screens",
        "custom_fields": [
          {"field_name": "Resolution", "field_type": "text", "required": True},
          {"field_name": "Size (Inches)", "field_type": "number", "required": True}
        ]
      },
      {
        "category_id": cat_srv_id,
        "name": "Dev & Test Servers",
        "description": "Database server setups, web hosts, and testing clusters",
        "custom_fields": [
          {"field_name": "Cloud Provider", "field_type": "text", "required": False},
          {"field_name": "VCPU Count", "field_type": "number", "required": False}
        ]
      },
      {
        "category_id": cat_rm_id,
        "name": "Meeting Rooms",
        "description": "Shared physical conference rooms and lab spaces",
        "custom_fields": [
          {"field_name": "Capacity (Seats)", "field_type": "number", "required": True},
          {"field_name": "TV Setup", "field_type": "text", "required": False}
        ]
      },
      {
        "category_id": cat_veh_id,
        "name": "Company Vehicles",
        "description": "Electric cars, delivery trucks, and shuttle vehicles",
        "custom_fields": [
          {"field_name": "Battery Range (Miles)", "field_type": "number", "required": True},
          {"field_name": "Plate Number", "field_type": "text", "required": True}
        ]
      }
    ]
    await db.categories.insert_many(categories)
    print("Seeded 5 Categories.")

    # 4. Seed Users (Employees)
    admin_email = os.getenv("ADMIN_EMAIL", "santushtkotai1221@gmail.com").strip().lower()
    
    # We clean users list but preserve the admin user if they exist to prevent locking
    existing_admin = await db.users.find_one({"email": admin_email})
    admin_id = existing_admin["user_id"] if existing_admin else str(uuid4())
    
    await db.users.delete_many({"email": {"$ne": admin_email}})
    
    manager_id = str(uuid4())
    head_id = str(uuid4())
    emp_charlie_id = str(uuid4())
    emp_diana_id = str(uuid4())

    users = [
      {
        "user_id": manager_id,
        "name": "Alice Smith",
        "email": "manager@sharexpress.in",
        "auth_provider": "OTP",
        "role": RoleEnum.ASSET_MANAGER,
        "department_id": dept_ops_id,
        "is_verified": True,
        "is_active": True,
        "is_locked": False,
        "google_sub": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "deleted_at": None
      },
      {
        "user_id": head_id,
        "name": "Bob Jones",
        "email": "head@sharexpress.in",
        "auth_provider": "OTP",
        "role": RoleEnum.DEPARTMENT_HEAD,
        "department_id": dept_eng_id,
        "is_verified": True,
        "is_active": True,
        "is_locked": False,
        "google_sub": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "deleted_at": None
      },
      {
        "user_id": emp_charlie_id,
        "name": "Charlie Brown",
        "email": "engineer1@sharexpress.in",
        "auth_provider": "OTP",
        "role": RoleEnum.EMPLOYEE,
        "department_id": dept_eng_id,
        "is_verified": True,
        "is_active": True,
        "is_locked": False,
        "google_sub": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "deleted_at": None
      },
      {
        "user_id": emp_diana_id,
        "name": "Diana Prince",
        "email": "designer1@sharexpress.in",
        "auth_provider": "OTP",
        "role": RoleEnum.EMPLOYEE,
        "department_id": dept_prd_id,
        "is_verified": True,
        "is_active": True,
        "is_locked": False,
        "google_sub": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "deleted_at": None
      }
    ]

    # Insert or update Admin
    admin_user = {
      "user_id": admin_id,
      "name": "System Admin",
      "email": admin_email,
      "auth_provider": "OTP",
      "role": RoleEnum.ADMIN,
      "department_id": dept_ops_id,
      "is_verified": True,
      "is_active": True,
      "is_locked": False,
      "google_sub": None,
      "created_at": datetime.utcnow(),
      "updated_at": datetime.utcnow(),
      "deleted_at": None
    }
    
    if existing_admin:
        await db.users.update_one({"email": admin_email}, {"$set": admin_user})
    else:
        await db.users.insert_one(admin_user)
        
    await db.users.insert_many(users)
    print("Seeded 5 Users (Admin, Asset Manager, Dept Head, and 2 Employees).")

    # Link Department heads
    await db.departments.update_one({"department_id": dept_eng_id}, {"$set": {"head_id": head_id}})

    # 5. Seed Assets
    assets_to_seed = []
    
    asset_mac_id = str(uuid4())
    asset_mon_id = str(uuid4())
    asset_srv_id = str(uuid4())
    asset_lap2_id = str(uuid4())
    asset_mon2_id = str(uuid4())
    asset_rm_yos_id = str(uuid4())
    asset_tes_id = str(uuid4())
    asset_ipad_id = str(uuid4())

    asset_mac = {
      "asset_id": asset_mac_id,
      "asset_tag": "AF-1001",
      "name": "MacBook Pro 16\" (M3 Max)",
      "serial_number": "C02G23LKMDG2",
      "category_id": cat_lap_id,
      "cost": 3499.0,
      "purchase_date": "2026-01-10",
      "condition": AssetCondition.NEW,
      "location": "Main Lab Desk 4",
      "department_id": dept_eng_id,
      "is_bookable": False,
      "description": "Developer setup, 64GB Unified RAM, 1TB SSD",
      "status": AssetStatus.ALLOCATED,
      "qr_code_data_url": generate_qr_code(asset_mac_id, "AF-1001"),
      "photos": [],
      "documents": [],
      "created_at": datetime.utcnow() - timedelta(days=60),
      "updated_at": datetime.utcnow()
    }

    asset_mon = {
      "asset_id": asset_mon_id,
      "asset_tag": "AF-1002",
      "name": "Dell UltraSharp 32\" (U3223QE)",
      "serial_number": "CN08Y642G13",
      "category_id": cat_mon_id,
      "cost": 749.0,
      "purchase_date": "2026-01-12",
      "condition": AssetCondition.GOOD,
      "location": "Main Lab Desk 4",
      "department_id": dept_eng_id,
      "is_bookable": False,
      "description": "4K hub monitor with USB-C charging",
      "status": AssetStatus.ALLOCATED,
      "qr_code_data_url": generate_qr_code(asset_mon_id, "AF-1002"),
      "photos": [],
      "documents": [],
      "created_at": datetime.utcnow() - timedelta(days=60),
      "updated_at": datetime.utcnow()
    }

    asset_srv = {
      "asset_id": asset_srv_id,
      "asset_tag": "AF-1003",
      "name": "Local AWS EC2 Test Host",
      "serial_number": "AWS-MOCK-99",
      "category_id": cat_srv_id,
      "cost": 2100.0,
      "purchase_date": "2025-05-20",
      "condition": AssetCondition.FAIR,
      "location": "Infra server rack C3",
      "department_id": dept_eng_id,
      "is_bookable": False,
      "description": "Staging compute server, 16 vCPU, 32GB RAM",
      "status": AssetStatus.UNDER_MAINTENANCE,
      "qr_code_data_url": generate_qr_code(asset_srv_id, "AF-1003"),
      "photos": [],
      "documents": [],
      "created_at": datetime.utcnow() - timedelta(days=200),
      "updated_at": datetime.utcnow()
    }

    asset_lap2 = {
      "asset_id": asset_lap2_id,
      "asset_tag": "AF-1004",
      "name": "Lenovo ThinkPad P1 Gen 6",
      "serial_number": "PF52GK11",
      "category_id": cat_lap_id,
      "cost": 2299.0,
      "purchase_date": "2025-11-05",
      "condition": AssetCondition.GOOD,
      "location": "Central Storage",
      "department_id": None,
      "is_bookable": False,
      "description": "Mobile Workstation, 32GB RAM, RTX 4060",
      "status": AssetStatus.AVAILABLE,
      "qr_code_data_url": generate_qr_code(asset_lap2_id, "AF-1004"),
      "photos": [],
      "documents": [],
      "created_at": datetime.utcnow() - timedelta(days=45),
      "updated_at": datetime.utcnow() - timedelta(days=45) # Keep updated_at old for reporting "idle assets"
    }

    asset_mon2 = {
      "asset_id": asset_mon2_id,
      "asset_tag": "AF-1005",
      "name": "Apple Studio Display 27\"",
      "serial_number": "APSD-7890",
      "category_id": cat_mon_id,
      "cost": 1599.0,
      "purchase_date": "2025-08-14",
      "condition": AssetCondition.GOOD,
      "location": "Central Storage",
      "department_id": None,
      "is_bookable": False,
      "description": "5K screen display with integrated webcam",
      "status": AssetStatus.AVAILABLE,
      "qr_code_data_url": generate_qr_code(asset_mon2_id, "AF-1005"),
      "photos": [],
      "documents": [],
      "created_at": datetime.utcnow() - timedelta(days=120),
      "updated_at": datetime.utcnow() - timedelta(days=45) # Keep updated_at old for reporting "idle assets"
    }

    asset_rm_yos = {
      "asset_id": asset_rm_yos_id,
      "asset_tag": "AF-1006",
      "name": "Conference Room Yosemite",
      "serial_number": "ROOM-YOSEMITE",
      "category_id": cat_rm_id,
      "cost": 0.0,
      "purchase_date": None,
      "condition": AssetCondition.GOOD,
      "location": "Office Floor 2, Block A",
      "department_id": None,
      "is_bookable": True,
      "description": "Shared board meeting room with TV, whiteboard, and microphones",
      "status": AssetStatus.AVAILABLE,
      "qr_code_data_url": generate_qr_code(asset_rm_yos_id, "AF-1006"),
      "photos": [],
      "documents": [],
      "created_at": datetime.utcnow() - timedelta(days=180),
      "updated_at": datetime.utcnow()
    }

    asset_tes = {
      "asset_id": asset_tes_id,
      "asset_tag": "AF-1007",
      "name": "Tesla Model Y (Office Shuttle)",
      "serial_number": "5YJYGD21",
      "category_id": cat_veh_id,
      "cost": 45000.0,
      "purchase_date": "2025-03-01",
      "condition": AssetCondition.GOOD,
      "location": "Basement Parking B2",
      "department_id": None,
      "is_bookable": True,
      "description": "Corporate shuttle car, Dual Motor Long Range",
      "status": AssetStatus.AVAILABLE,
      "qr_code_data_url": generate_qr_code(asset_tes_id, "AF-1007"),
      "photos": [],
      "documents": [],
      "created_at": datetime.utcnow() - timedelta(days=360),
      "updated_at": datetime.utcnow()
    }

    asset_ipad = {
      "asset_id": asset_ipad_id,
      "asset_tag": "AF-1008",
      "name": "iPad Pro 12.9\" (6th Gen)",
      "serial_number": "DLXG134KM",
      "category_id": cat_lap_id,
      "cost": 1099.0,
      "purchase_date": "2026-02-15",
      "condition": AssetCondition.NEW,
      "location": "Central Storage",
      "department_id": None,
      "is_bookable": True,
      "description": "Liquid Retina display, M2 Chip, 256GB WiFi",
      "status": AssetStatus.AVAILABLE,
      "qr_code_data_url": generate_qr_code(asset_ipad_id, "AF-1008"),
      "photos": [],
      "documents": [],
      "created_at": datetime.utcnow() - timedelta(days=25),
      "updated_at": datetime.utcnow()
    }

    assets_to_seed = [asset_mac, asset_mon, asset_srv, asset_lap2, asset_mon2, asset_rm_yos, asset_tes, asset_ipad]
    await db.assets.insert_many(assets_to_seed)
    print("Seeded 8 Assets.")

    # 6. Seed Allocations
    alloc_mac_id = str(uuid4())
    alloc_mon_id = str(uuid4())
    
    allocations_list = [
      {
        "allocation_id": alloc_mac_id,
        "asset_id": asset_mac_id,
        "asset_name": "MacBook Pro 16\" (M3 Max)",
        "asset_tag": "AF-1001",
        "allocated_to": emp_charlie_id,
        "allocated_to_name": "Charlie Brown",
        "allocated_at": datetime.utcnow() - timedelta(days=45),
        "expected_return_date": (datetime.utcnow() + timedelta(days=300)).strftime("%Y-%m-%d"),
        "notes": "Developer workstation setup",
        "status": "Active",
        "returned_at": None,
        "return_condition": None,
        "return_notes": None
      },
      {
        "allocation_id": alloc_mon_id,
        "asset_id": asset_mon_id,
        "asset_name": "Dell UltraSharp 32\" (U3223QE)",
        "asset_tag": "AF-1002",
        "allocated_to": emp_charlie_id,
        "allocated_to_name": "Charlie Brown",
        "allocated_at": datetime.utcnow() - timedelta(days=40),
        "expected_return_date": (datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d"), # Expired/Overdue return
        "notes": "External desktop display",
        "status": "Overdue",
        "returned_at": None,
        "return_condition": None,
        "return_notes": None
      }
    ]
    await db.allocations.insert_many(allocations_list)
    print("Seeded 2 active allocations.")

    # 7. Seed Bookings
    bookings_list = [
      {
        "booking_id": str(uuid4()),
        "asset_id": asset_rm_yos_id,
        "asset_name": "Conference Room Yosemite",
        "location": "Office Floor 2, Block A",
        "booked_by": emp_charlie_id,
        "booked_by_name": "Charlie Brown",
        "start_time": datetime.utcnow() + timedelta(hours=2),
        "end_time": datetime.utcnow() + timedelta(hours=3),
        "purpose": "Sprint Review Sync-up Meeting",
        "status": "Upcoming",
        "created_at": datetime.utcnow()
      },
      {
        "booking_id": str(uuid4()),
        "asset_id": asset_tes_id,
        "asset_name": "Tesla Model Y (Office Shuttle)",
        "location": "Basement Parking B2",
        "booked_by": emp_diana_id,
        "booked_by_name": "Diana Prince",
        "start_time": datetime.utcnow() + timedelta(days=1, hours=4),
        "end_time": datetime.utcnow() + timedelta(days=1, hours=8),
        "purpose": "Client dispatch offsite meeting",
        "status": "Upcoming",
        "created_at": datetime.utcnow()
      },
      {
        "booking_id": str(uuid4()),
        "asset_id": asset_rm_yos_id,
        "asset_name": "Conference Room Yosemite",
        "location": "Office Floor 2, Block A",
        "booked_by": head_id,
        "booked_by_name": "Bob Jones",
        "start_time": datetime.utcnow() - timedelta(days=2, hours=4),
        "end_time": datetime.utcnow() - timedelta(days=2, hours=2),
        "purpose": "Department Architecture Alignment",
        "status": "Completed",
        "created_at": datetime.utcnow() - timedelta(days=3)
      }
    ]
    await db.bookings.insert_many(bookings_list)
    print("Seeded 3 bookings (2 upcoming, 1 completed).")

    # 8. Seed Maintenance Requests
    req_srv_id = str(uuid4())
    req_lap2_id = str(uuid4())
    req_mon2_id = str(uuid4())

    maintenance_list = [
      {
        "request_id": req_srv_id,
        "asset_id": asset_srv_id,
        "asset_tag": "AF-1003",
        "asset_name": "Local AWS EC2 Test Host",
        "issue_description": "Motherboard heating issue, server automatically restarts when CPU exceeds 75% load.",
        "priority": "High",
        "status": "Under Repair",
        "technician_name": "John Specialist",
        "resolution_notes": None,
        "created_by": head_id,
        "created_at": datetime.utcnow() - timedelta(days=5),
        "updated_at": datetime.utcnow()
      },
      {
        "request_id": req_lap2_id,
        "asset_id": asset_lap2_id,
        "asset_tag": "AF-1004",
        "asset_name": "Lenovo ThinkPad P1 Gen 6",
        "issue_description": "Battery replacement request, backup drops below 40 minutes under normal load.",
        "priority": "Medium",
        "status": "Resolved",
        "technician_name": "Alex Admin",
        "resolution_notes": "Successfully replaced battery unit with original spare component, fully tested backup range.",
        "created_by": emp_charlie_id,
        "created_at": datetime.utcnow() - timedelta(days=12),
        "updated_at": datetime.utcnow() - timedelta(days=8)
      },
      {
        "request_id": req_mon2_id,
        "asset_id": asset_mon2_id,
        "asset_tag": "AF-1005",
        "asset_name": "Apple Studio Display 27\"",
        "issue_description": "Visual flickering reported when screen wakes from power saving mode.",
        "priority": "Low",
        "status": "Pending Approval",
        "technician_name": None,
        "resolution_notes": None,
        "created_by": emp_diana_id,
        "created_at": datetime.utcnow() - timedelta(days=1),
        "updated_at": datetime.utcnow()
      }
    ]
    await db.maintenance.insert_many(maintenance_list)
    print("Seeded 3 maintenance requests.")

    # 9. Seed Audits
    cycle_closed_id = str(uuid4())
    cycle_open_id = str(uuid4())

    audits_cycles = [
      {
        "cycle_id": cycle_closed_id,
        "name": "Q2 Engineering Suite Audit",
        "scope_department": dept_eng_id,
        "scope_location": "Main Lab Desk 4",
        "status": "Closed",
        "auditors": [manager_id],
        "created_at": datetime.utcnow() - timedelta(days=90),
        "closed_at": datetime.utcnow() - timedelta(days=89)
      },
      {
        "cycle_id": cycle_open_id,
        "name": "Q3 Global Inventory Audit",
        "scope_department": None,
        "scope_location": None,
        "status": "Open",
        "auditors": [manager_id, head_id],
        "created_at": datetime.utcnow() - timedelta(days=2),
        "closed_at": None
      }
    ]
    await db.audits.insert_many(audits_cycles)
    
    # Audit entries (for closed cycle check)
    # This will demonstrate discrepancy stats (total: 2, verified: 1, damaged: 1)
    await db.audit_entries.insert_many([
      {
        "cycle_id": cycle_closed_id,
        "asset_id": asset_mac_id,
        "result": "Verified",
        "notes": "Checked Macbook Pro M3 screen and components, working fine.",
        "audited_by": manager_id,
        "audited_at": datetime.utcnow() - timedelta(days=89)
      },
      {
        "cycle_id": cycle_closed_id,
        "asset_id": asset_mon_id,
        "result": "Damaged",
        "notes": "Found line flicker on Dell monitor. Logged maintenance ticket.",
        "audited_by": manager_id,
        "audited_at": datetime.utcnow() - timedelta(days=89)
      }
    ])
    
    print("Seeded 2 Audit Cycles (1 closed, 1 open) and check entries.")
    
    print("\nDatabase Seeding Completed Successfully! You are ready to log in.")

if __name__ == "__main__":
    asyncio.run(seed_dummy_data())
