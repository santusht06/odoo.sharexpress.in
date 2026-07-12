from fastapi import APIRouter, Depends
from models.category_model import CreateCategory, UpdateCategory
from controllers.category_controller import CategoryController
from utils.rbac import require_admin, require_any_authenticated

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.post("")
async def create_category(cat_in: CreateCategory, user=Depends(require_admin)):
    return await CategoryController.create_category(cat_in, user["user_id"])


@router.get("")
async def list_categories(user=Depends(require_any_authenticated)):
    return await CategoryController.list_categories()


@router.patch("/{cat_id}")
async def update_category(cat_id: str, cat_in: UpdateCategory, user=Depends(require_admin)):
    return await CategoryController.update_category(cat_id, cat_in, user["user_id"])
