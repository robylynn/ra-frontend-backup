from pydantic import BaseModel
from typing import Dict, List


class HostServicesError(BaseModel):
    description: str
    details: str | None = None
    stderr: str | None = None


class APIResponse(BaseModel):
    error: bool
    data: str | Dict | List | None = None
    error_details: HostServicesError | None = None
