from pydantic import BaseModel

class ContactRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    company: str | None = None
    message: str