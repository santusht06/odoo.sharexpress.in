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

from motor.motor_asyncio import AsyncIOMotorClient
from core.config import MONGO_URI, DB_NAME

if not MONGO_URI or not DB_NAME:
    raise RuntimeError("MONGO_URI or DB_NAME not set in environment")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]


def get_db():
    return db
