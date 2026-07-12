import httpx
from core.database import get_db
from core.config import GEMINI_API_KEY, GROQ_API_KEY, DEFAULT_LLM_PROVIDER
from fastapi import HTTPException
from datetime import datetime

db = get_db()

class AIController:
    @staticmethod
    async def chat_rag(question: str, user_id: str) -> dict:
        try:
            # 1. RETRIEVAL (Gathering live DB context)
            query_lower = question.lower()
            context_parts = []
            
            # Decide what collections to search based on prompt intent
            search_all = True
            
            # Query Users / Staff Directory
            if search_all or any(k in query_lower for k in ["user", "employee", "staff", "member", "person", "people", "name", "en23cs301927"]):
                users_cursor = db.users.find({"deleted_at": None}, {"_id": 0}).limit(50)
                users = await users_cursor.to_list(length=50)
                if users:
                    users_str = "\n".join([
                        f"- Name: {u.get('name')} | Email: {u.get('email')} | Role: {u.get('role')} | Active: {u.get('is_active')}"
                        for u in users
                    ])
                    context_parts.append(f"### Live Employees / Users / Staff Directory:\n{users_str}")

            # Query Assets
            if search_all or any(k in query_lower for k in ["asset", "device", "laptop", "monitor", "host", "keyboard", "mouse", "tag", "hardware", "spec"]):
                assets_cursor = db.assets.find({"deleted_at": None}, {"_id": 0}).limit(30)
                assets = await assets_cursor.to_list(length=30)
                if assets:
                    assets_str = "\n".join([
                        f"- {a.get('name')} (Tag: {a.get('asset_tag')}, Status: {a.get('status')}, Type: {a.get('category_name')}, Location: {a.get('location')})"
                        for a in assets
                    ])
                    context_parts.append(f"### Live Assets:\n{assets_str}")

            # Query Active Allocations (checkouts)
            if search_all or any(k in query_lower for k in ["allocation", "assigned", "holder", "return", "overdue", "checkout", "employee"]):
                allocs_cursor = db.allocations.find({"status": {"$ne": "Returned"}}, {"_id": 0}).limit(20)
                allocations = await allocs_cursor.to_list(length=20)
                if allocations:
                    alloc_lines = []
                    for al in allocations:
                        # Fetch asset details for tag/name context
                        asset = await db.assets.find_one({"asset_id": al.get("asset_id")})
                        tag = asset.get("asset_tag", "N/A") if asset else "N/A"
                        alloc_lines.append(
                            f"- Asset: {al.get('asset_name')} (Tag: {tag}) | Holder: {al.get('holder_name')} ({al.get('holder_email')}) | Due: {al.get('due_date')} | Status: {al.get('status')}"
                        )
                    context_parts.append(f"### Active Allocations:\n" + "\n".join(alloc_lines))

            # Query Maintenance Requests
            if search_all or any(k in query_lower for k in ["maintenance", "repair", "ticket", "broken", "flicker", "malfunction", "approve", "reject", "technician"]):
                maint_cursor = db.maintenance.find({}, {"_id": 0}).limit(20)
                maint_requests = await maint_cursor.to_list(length=20)
                if maint_requests:
                    maint_str = "\n".join([
                        f"- Request: {m.get('issue_description')} | Asset: {m.get('asset_name')} ({m.get('asset_tag')}) | Priority: {m.get('priority')} | Status: {m.get('status')} | Tech: {m.get('technician_name') or 'Unassigned'}"
                        for m in maint_requests
                    ])
                    context_parts.append(f"### Repairs & Maintenance:\n{maint_str}")

            # Query Bookings
            if search_all or any(k in query_lower for k in ["booking", "reserve", "calendar", "schedule", "meeting", "lab"]):
                bookings_cursor = db.bookings.find({"status": "Confirmed"}, {"_id": 0}).limit(20)
                bookings = await bookings_cursor.to_list(length=20)
                if bookings:
                    bookings_str = "\n".join([
                        f"- Asset: {b.get('asset_name')} | Booked by: {b.get('booked_by_name')} | Date: {b.get('date')} | Time: {b.get('start_time')} - {b.get('end_time')}"
                        for b in bookings
                    ])
                    context_parts.append(f"### Active Bookings:\n{bookings_str}")

            # Query Recent Activity Logs
            if search_all or any(k in query_lower for k in ["log", "activity", "audit", "recent", "history"]):
                logs_cursor = db.activity_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(15)
                logs = await logs_cursor.to_list(length=15)
                if logs:
                    logs_str = "\n".join([
                        f"- [{l.get('timestamp')}] User: {l.get('actor_name') or l.get('actor_id')} | Action: {l.get('action')} | Type: {l.get('entity_type')}"
                        for l in logs
                    ])
                    context_parts.append(f"### Recent Activity Audit Logs:\n{logs_str}")

            # Join all context snippets
            context_str = "\n\n".join(context_parts) if context_parts else "No matching record context retrieved from database."

            # 2. PROMPT CONSTRUCTION
            system_instruction = (
                "You are AssetFlow AI, a premium virtual assistant for the AssetFlow ERP physical asset management system.\n"
                "Your goal is to help users manage, search, and troubleshoot assets, checkouts, maintenance tickets, and calendars.\n"
                "Strictly answer the user's question using the live database context provided below.\n"
                "If calculations are required (e.g. count of assets or active items), perform them based on the context data.\n"
                "Make your response highly professional, structured, concise, and structured with clean markdown bullet points. Do not mention that you got context or documents; act as a native system integration."
            )

            prompt = (
                f"LIVE DATABASE CONTEXT:\n"
                f"{context_str}\n\n"
                f"USER QUESTION: {question}\n"
            )

            # 3. LLM INVOCATION VIA HTTPX
            answer = ""
            provider_used = "offline"

            # Try Groq
            if GROQ_API_KEY and (DEFAULT_LLM_PROVIDER == "groq" or not GEMINI_API_KEY):
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers={
                                "Authorization": f"Bearer {GROQ_API_KEY}",
                                "Content-Type": "application/json"
                            },
                            json={
                                "model": "llama-3.3-70b-versatile",
                                "messages": [
                                    {"role": "system", "content": system_instruction},
                                    {"role": "user", "content": prompt}
                                ],
                                "temperature": 0.2
                            }
                        )
                        if response.status_code == 200:
                            res_json = response.json()
                            answer = res_json["choices"][0]["message"]["content"]
                            provider_used = "groq"
                except Exception as ex:
                    print(f"Groq API connection error: {ex}")

            # Fallback to Gemini
            if not answer and GEMINI_API_KEY:
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(
                            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}",
                            headers={"Content-Type": "application/json"},
                            json={
                                "contents": [{
                                    "parts": [{"text": prompt}]
                                }],
                                "systemInstruction": {
                                    "parts": [{"text": system_instruction}]
                                },
                                "generationConfig": {
                                    "temperature": 0.2
                                }
                            }
                        )
                        if response.status_code == 200:
                            res_json = response.json()
                            answer = res_json["candidates"][0]["content"]["parts"][0]["text"]
                            provider_used = "gemini"
                except Exception as ex:
                    print(f"Gemini API connection error: {ex}")

            if not answer:
                answer = "I'm sorry, I was unable to reach the AI models at this moment. Please check your credentials and connection."

            return {
                "success": True,
                "answer": answer,
                "provider": provider_used,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            print(f"Error in RAG pipeline: {e}")
            raise HTTPException(status_code=500, detail=str(e))
