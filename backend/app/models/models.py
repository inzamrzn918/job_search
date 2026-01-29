import datetime
from typing import List, Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Float, DateTime, ForeignKey, JSON
from ..core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    totp_secret: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Profile Fields
    phone_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    profile_photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_open_to_work: Mapped[bool] = mapped_column(default=True)
    is_remote: Mapped[bool] = mapped_column(default=True)
    min_salary: Mapped[Optional[int]] = mapped_column(nullable=True)
    max_salary: Mapped[Optional[int]] = mapped_column(nullable=True)
    industries: Mapped[list] = mapped_column(JSON, default=list)

    # Billing Fields
    plan: Mapped[str] = mapped_column(String(50), default="free") # free, pro, executive
    billing_cycle: Mapped[str] = mapped_column(String(20), default="monthly")
    next_billing_date: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    
    preferences: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    
    resumes: Mapped[List["Resume"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    jobs: Mapped[List["Job"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    billing_history: Mapped[List["BillingHistory"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    payment_methods: Mapped[List["PaymentMethod"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    filename: Mapped[str] = mapped_column(String(255))
    raw_text: Mapped[str] = mapped_column(Text)
    parsed_data: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="resumes")
    matches: Mapped[List["MatchResult"]] = relationship(back_populates="resume", cascade="all, delete-orphan")

class Job(Base):
    __tablename__ = "jobs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    title: Mapped[str] = mapped_column(String(255))
    company: Mapped[str] = mapped_column(String(255))
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="wishlist") # wishlist, applied, interviewing, offer, rejected
    parsed_data: Mapped[dict] = mapped_column(JSON)
    interview_date: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    interview_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="jobs")
    matches: Mapped[List["MatchResult"]] = relationship(back_populates="job", cascade="all, delete-orphan")

class MatchResult(Base):
    __tablename__ = "match_results"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    resume_id: Mapped[int] = mapped_column(ForeignKey("resumes.id"))
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"))
    score: Mapped[float] = mapped_column(Float)
    justification: Mapped[str] = mapped_column(Text)
    missing_skills: Mapped[List[str]] = mapped_column(JSON)
    matching_skills: Mapped[List[str]] = mapped_column(JSON)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    
    resume: Mapped["Resume"] = relationship(back_populates="matches")
    job: Mapped["Job"] = relationship(back_populates="matches")

class BillingHistory(Base):
    __tablename__ = "billing_history"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    date: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    amount: Mapped[str] = mapped_column(String(50)) # e.g. "$29.00 USD"
    status: Mapped[str] = mapped_column(String(50)) # Paid, Failed, Pending
    invoice_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    user: Mapped["User"] = relationship(back_populates="billing_history")

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    card_brand: Mapped[str] = mapped_column(String(50)) # Visa, Mastercard
    card_last4: Mapped[str] = mapped_column(String(4))
    expiry_month: Mapped[int] = mapped_column()
    expiry_year: Mapped[int] = mapped_column()
    is_default: Mapped[bool] = mapped_column(default=False)
    
    user: Mapped["User"] = relationship(back_populates="payment_methods")

class Notification(Base):
    __tablename__ = "notifications"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(default=False)
    type: Mapped[str] = mapped_column(String(50), default="info") # info, success, warning, error
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="notifications")
