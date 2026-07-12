import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()


# JWT
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "RS256")
JWT_EXPIRES = int(os.getenv("JWT_EXPIRES", 7))

# Try loading RSA keys, fall back to HS256 if not found
try:
    PRIVATE_KEY = Path("private.pem").read_text()
    PUBLIC_KEY = Path("public.pem").read_text()
except FileNotFoundError:
    PRIVATE_KEY = None
    PUBLIC_KEY = None
    JWT_ALGORITHM = "HS256"

# DATABASE
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# EMAILS
MAIL_CONFIG = None
try:
    from fastapi_mail import ConnectionConfig
    if os.getenv("MAIL_USERNAME") and os.getenv("MAIL_PASSWORD"):
        MAIL_CONFIG = ConnectionConfig(
            MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
            MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
            MAIL_FROM=os.getenv("MAIL_FROM") or os.getenv("MAIL_USERNAME"),
            MAIL_PORT=int(os.getenv("MAIL_PORT", 465)),
            MAIL_SERVER=os.getenv("MAIL_SERVER"),
            MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "False") == "True",
            MAIL_SSL_TLS=os.getenv("MAIL_SSL", "True") == "True",
            USE_CREDENTIALS=True,
        )
except Exception:
    MAIL_CONFIG = None

# GOOGLE AUTH CONFIG
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

# FRONTEND CONFIG
FRONTEND_URI = os.getenv("FRONTEND_URI", "http://localhost:5173")

# REDIS CONFIG
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")

# PROJECT ENVIRONMENT
PROJECT_ENVIRONMENT = os.getenv("PROJECT_ENVIRONMENT", "DEVELOPMENT")

# SESSION SECRET
SESSION_SECRET = os.getenv("SESSION_SECRET", "DEV_SECRET_CHANGE_IN_PRODUCTION")

# ADMIN SEED
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@assetflow.com")

# CLOUDINARY
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")
