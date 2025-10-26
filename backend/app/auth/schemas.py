from pydantic import BaseModel, Field
import uuid
from datetime import datetime


class UserCreateModel(BaseModel):
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    artist_name: str = Field(max_length=20)
    email: str = Field(max_length=40)
    role: str = Field(default="regular")
    password: str = Field(min_length=6)


class UserModel(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    artist_name: str
    email: str
    role: str
    is_verified: bool = Field(default=False)
    password_hash: str = Field(exclude=True)
    created_at: datetime
    updated_at: datetime


class UserLoginModel(BaseModel):
    email: str = Field(max_length=40)
    password: str = Field(min_length=6)
