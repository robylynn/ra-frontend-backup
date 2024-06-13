#!/usr/bin/env python3

## Carbonator Control System
### Authentication Models
### Developed by R2 Labs for Seabound Carbon

from pydantic import BaseModel, Field, EmailStr
    
class UserLoginSchema(BaseModel):
    email: EmailStr = Field(default=None)
    username: str = Field(default=None)
    password: str = Field(default=None)