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

from models.category_model import CreateCategory, UpdateCategory
from fastapi import HTTPException
from core.database import get_db
from datetime import datetime
from uuid import uuid4
from utils.activity_logger import log_activity

db = get_db()

class CategoryController:
    @staticmethod
    async def create_category(cat_in: CreateCategory, actor_id: str):
        existing = await db.categories.find_one({"name": {"$regex": f"^{cat_in.name}$", "$options": "i"}})
        if existing:
            raise HTTPException(status_code=400, detail="Category with this name already exists")

        cat_id = str(uuid4())
        new_cat = {
            "category_id": cat_id,
            "name": cat_in.name,
            "description": cat_in.description,
            "custom_fields": [field.dict() for field in cat_in.custom_fields] if cat_in.custom_fields else [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        await db.categories.insert_one(new_cat)
        new_cat.pop("_id", None)
        await log_activity(actor_id, "CREATE", "CATEGORY", cat_id, new_value=new_cat)
        return {"success": True, "category": new_cat}

    @staticmethod
    async def list_categories():
        cursor = db.categories.find({}, {"_id": 0})
        cats = []
        async for doc in cursor:
            cats.append(doc)
        return {"success": True, "categories": cats}

    @staticmethod
    async def update_category(cat_id: str, cat_in: UpdateCategory, actor_id: str):
        cat = await db.categories.find_one({"category_id": cat_id})
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")

        updates = {}
        if cat_in.name is not None:
            existing = await db.categories.find_one({"name": {"$regex": f"^{cat_in.name}$", "$options": "i"}, "category_id": {"$ne": cat_id}})
            if existing:
                raise HTTPException(status_code=400, detail="Category with this name already exists")
            updates["name"] = cat_in.name
            
        if cat_in.description is not None:
            updates["description"] = cat_in.description
            
        if cat_in.custom_fields is not None:
            updates["custom_fields"] = [field.dict() for field in cat_in.custom_fields]

        if updates:
            updates["updated_at"] = datetime.utcnow()
            await db.categories.update_one({"category_id": cat_id}, {"$set": updates})
            await log_activity(actor_id, "UPDATE", "CATEGORY", cat_id, previous_value=cat, new_value=updates)

        return {"success": True, "message": "Category updated successfully"}
