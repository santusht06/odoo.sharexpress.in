from fastapi import APIRouter, Depends, Query
from models.asset_model import CreateAsset, UpdateAsset, UpdateAssetStatus
from controllers.asset_controller import AssetController
from utils.rbac import require_asset_manager, require_any_authenticated
from typing import Optional

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
