from fastapi import APIRouter, Depends
from controllers.dashboard_controller import DashboardController
from utils.rbac import require_any_authenticated

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/kpis")
async def get_kpis(user=Depends(require_any_authenticated)):
    return await DashboardController.get_kpis(user["role"], user["user_id"])
