from sqlalchemy import Column, Integer, String

from database.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String)

    email = Column(String, unique=True)

    password = Column(String)

    role = Column(String, default="Admin")