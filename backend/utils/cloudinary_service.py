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

import io
import logging
import cloudinary
import cloudinary.uploader
from core.config import (
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
)

logger = logging.getLogger(__name__)

# Configure Cloudinary SDK
if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )


async def upload_file_to_cloudinary(
    file_bytes: bytes,
    original_filename: str,
    folder: str = "assetflow",
) -> dict:
    """
    Upload a general file/image/document to Cloudinary under the specified folder.
    
    Returns a dict with:
        - secure_url : str  — HTTPS URL to the uploaded file
        - public_id  : str  — Cloudinary asset identifier
        - bytes      : int  — File size
        - format     : str  — File extension
    """
    try:
        # Determine resource type: images/videos are uploaded as their respective type, documents/others as raw
        ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
        resource_type = "image" if ext in ["jpg", "jpeg", "png", "gif", "webp"] else "raw"

        result = cloudinary.uploader.upload(
            io.BytesIO(file_bytes),
            resource_type=resource_type,
            folder=folder,
            public_id=original_filename.rsplit(".", 1)[0] if "." in original_filename else original_filename,
            overwrite=True,
            use_filename=True,
            unique_filename=True,
        )
        
        logger.info(f"Cloudinary upload success: {result.get('public_id')}")
        return {
            "secure_url": result["secure_url"],
            "public_id": result["public_id"],
            "bytes": result.get("bytes", 0),
            "format": result.get("format", ext),
        }
    except Exception as exc:
        logger.error(f"Cloudinary upload failed: {exc}")
        raise RuntimeError(f"Cloudinary upload error: {exc}") from exc
