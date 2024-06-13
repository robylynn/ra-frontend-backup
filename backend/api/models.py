from pydantic import BaseModel
from typing import List

class AuthenticationResponse(BaseModel):
    authenticated: bool
    signed_token: str

class APIResponse(BaseModel):
    error: bool
    data: str | List