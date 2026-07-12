from fastapi import APIRouter, Depends, Query
from models.transfer_model import CreateTransfer, ApproveTransfer
from controllers.transfer_controller import TransferController
from utils.rbac import require_department_head, require_any_authenticated

router = APIRouter(prefix="/transfers", tags=["Transfers"])

@router.post("")
async def request_transfer(transfer_in: CreateTransfer, user=Depends(require_any_authenticated)):
    return await TransferController.request_transfer(transfer_in, user["user_id"])


@router.get("")
async def list_transfers(user=Depends(require_any_authenticated)):
    return await TransferController.list_transfers(user["role"], user["user_id"])


@router.post("/{transfer_id}/approve")
async def approve_transfer(transfer_id: str, approve_in: ApproveTransfer, user=Depends(require_department_head)):
    return await TransferController.resolve_transfer(transfer_id, approve_in, True, user["user_id"])


@router.post("/{transfer_id}/reject")
async def reject_transfer(transfer_id: str, reject_in: ApproveTransfer, user=Depends(require_department_head)):
    return await TransferController.resolve_transfer(transfer_id, reject_in, False, user["user_id"])
