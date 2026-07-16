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

from fastapi import APIRouter, Depends, Query, Request
from models.asset_model import CreateAsset, UpdateAsset, UpdateAssetStatus
from controllers.asset_controller import AssetController
from utils.rbac import require_asset_manager, require_any_authenticated
from typing import Optional
from core.limiter import limiter

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("")
async def create_asset(asset_in: CreateAsset, user=Depends(require_asset_manager)):
    return await AssetController.create_asset(asset_in, user["user_id"])


@router.get("")
async def list_assets(
    category_id: Optional[str] = None,
    department_id: Optional[str] = None,
    status: Optional[str] = None,
    is_bookable: Optional[bool] = None,
    search: Optional[str] = None,
    user=Depends(require_any_authenticated)
):
    return await AssetController.list_assets(category_id, department_id, status, is_bookable, search)


@router.get("/{asset_id}")
async def get_asset(asset_id: str, user=Depends(require_any_authenticated)):
    return await AssetController.get_asset_detail(asset_id)


@router.patch("/{asset_id}")
async def update_asset(asset_id: str, asset_in: UpdateAsset, user=Depends(require_asset_manager)):
    return await AssetController.update_asset(asset_id, asset_in, user["user_id"])


@router.patch("/{asset_id}/status")
async def update_status(asset_id: str, status_in: UpdateAssetStatus, user=Depends(require_asset_manager)):
    return await AssetController.update_status(asset_id, status_in, user["user_id"])


from fastapi import UploadFile, File
from utils.cloudinary_service import upload_file_to_cloudinary

@router.post("/upload")
@limiter.limit("10/minute")
async def upload_asset_file(
    request: Request,
    file: UploadFile = File(...),
    user=Depends(require_any_authenticated)
):
    contents = await file.read()
    cloudinary_result = await upload_file_to_cloudinary(contents, file.filename)
    return {"success": True, "url": cloudinary_result["secure_url"], "public_id": cloudinary_result["public_id"]}

