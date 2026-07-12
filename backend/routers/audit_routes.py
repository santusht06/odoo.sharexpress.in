from fastapi import APIRouter, Depends
from models.audit_model import CreateAuditCycle, CreateAuditEntry
from controllers.audit_controller import AuditController
from utils.rbac import require_admin, require_any_authenticated

router = APIRouter(prefix="/audits", tags=["Audits"])

@router.post("")
async def create_audit_cycle(cycle_in: CreateAuditCycle, user=Depends(require_admin)):
    return await AuditController.create_audit_cycle(cycle_in, user["user_id"])


@router.get("")
async def list_audit_cycles(user=Depends(require_any_authenticated)):
    return await AuditController.list_audit_cycles()


@router.get("/{cycle_id}")
async def get_audit_cycle(cycle_id: str, user=Depends(require_any_authenticated)):
    return await AuditController.get_audit_cycle(cycle_id)


@router.post("/{cycle_id}/entries")
async def record_audit_entry(cycle_id: str, entry_in: CreateAuditEntry, user=Depends(require_any_authenticated)):
    return await AuditController.record_audit_entry(cycle_id, entry_in, user["user_id"])


@router.get("/{cycle_id}/report")
async def get_discrepancy_report(cycle_id: str, user=Depends(require_any_authenticated)):
    return await AuditController.get_discrepancy_report(cycle_id)


@router.post("/{cycle_id}/close")
async def close_audit_cycle(cycle_id: str, user=Depends(require_admin)):
    return await AuditController.close_audit_cycle(cycle_id, user["user_id"])
 Amin only endpoints are strictly protected by guards.
