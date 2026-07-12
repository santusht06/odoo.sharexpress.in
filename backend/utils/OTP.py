import json
import uuid
import hashlib
from fastapi import HTTPException
from lib.redis import Redis_client

# In-memory backup cache for development/testing if Redis is not running
_otp_mem_cache = {}

def hashOTP(OTP: str) -> str:
    return hashlib.sha256(OTP.encode()).hexdigest()


async def sendOTP(email: str, OTP: str):
    try:
        transactionID = str(uuid.uuid4())
        otp_data = {"email": email, "hashedOTP": hashOTP(str(OTP)), "attempts": 0}

        try:
            Redis_client.setex(
                f"otp:{transactionID}",
                300,
                json.dumps(otp_data),
            )
        except Exception as redis_err:
            print(f"[Warning] Redis set error, using memory fallback: {redis_err}")
            _otp_mem_cache[transactionID] = otp_data

        print("OTP FOR TESTING =", OTP)
        print("Transaction ID =", transactionID)

        return {
            "transaction_ID": transactionID,
            "message": "OTP SENT SUCCESSFULLY",
            "success": True,
            "transactionID": transactionID,
        }

    except Exception as e:
        print(f"ERROR IN SENDING OTP: {e}")
        raise HTTPException(
            status_code=500, detail=f"ERROR IN SENDING OTP: {str(e)}"
        ) from e


async def VerifyOTPbyUtils(transactionID: str, OTP: str):
    try:
        key = f"otp:{transactionID}"
        data = None
        
        try:
            data = Redis_client.get(key)
        except Exception as redis_err:
            print(f"[Warning] Redis get error, retrieving from memory fallback: {redis_err}")
            data = _otp_mem_cache.get(transactionID)
            if data and not isinstance(data, str):
                data = json.dumps(data)

        if not data:
            return {"valid": False, "reason": "OTP expired or invalid transaction ID"}

        if isinstance(data, bytes):
            data = data.decode("utf-8")

        parsed = json.loads(data)

        email = parsed["email"]
        hashedOTP = parsed["hashedOTP"]
        attempts = parsed.get("attempts", 0)

        if attempts >= 5:
            try:
                Redis_client.delete(key)
            except Exception:
                _otp_mem_cache.pop(transactionID, None)
            return {
                "valid": False,
                "reason": "Too many failed attempts. Please request a new OTP.",
            }

        userHashedOTP = hashOTP(str(OTP))

        if userHashedOTP == hashedOTP:
            try:
                Redis_client.delete(key)
            except Exception:
                _otp_mem_cache.pop(transactionID, None)
            return {"valid": True, "reason": "Verified", "email": email}

        new_otp_data = {
            "email": email,
            "hashedOTP": hashedOTP,
            "attempts": attempts + 1,
        }
        
        try:
            Redis_client.setex(
                key,
                300,
                json.dumps(new_otp_data),
            )
        except Exception:
            _otp_mem_cache[transactionID] = new_otp_data

        remaining_attempts = 5 - (attempts + 1)
        return {
            "valid": False,
            "reason": f"Invalid OTP. {remaining_attempts} attempts remaining.",
        }

    except json.JSONDecodeError:
        return {"valid": False, "reason": "Invalid OTP data format"}
    except KeyError:
        return {"valid": False, "reason": "Corrupted OTP data"}
    except Exception:
        return {"valid": False, "reason": "An error occurred during verification"}
