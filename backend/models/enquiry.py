from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from database.database import Base


class Enquiry(Base):

    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String)

    email = Column(String)

    phone = Column(String(20))

    company = Column(String)

    message = Column(String)

    status = Column(String, default="New")

    created_at = Column(DateTime, default=datetime.utcnow)