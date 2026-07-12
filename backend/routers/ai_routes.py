from fastapi import APIRouter, Depends
from pydantic import BaseModel
from controllers.ai_controller import AIController
from utils.rbac import require_any_authenticated

router = APIRouter(prefix="/ai", tags=["Generative AI Chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_ai(req: ChatRequest, user=Depends(require_any_authenticated)):
    return await AIController.chat_rag(req.message, user["user_id"])
