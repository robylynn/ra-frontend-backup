from pydantic import BaseModel
from typing import Dict, List, Optional, Any


class HostServicesError(BaseModel):
    description: str
    details: str | None = None
    stderr: str | None = None


# class APIResponse(BaseModel):
#     error: bool
#     data: str | Dict | List | None = None
#     error_details: HostServicesError | None = None

class ApiResponse(BaseModel):
    """Standardized API response model."""

    success: bool
    message: str
    data: Optional[Any] = None