from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from ...core.database import get_db
from ...models.models import User, BillingHistory, PaymentMethod
from ..deps import get_current_user
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

router = APIRouter(tags=["billing"])

class PlanUpdate(BaseModel):
    plan: str # free, pro, executive
    billing_cycle: str # monthly, yearly

class PaymentMethodCreate(BaseModel):
    card_number: str
    expiry_month: int
    expiry_year: int
    cvc: str

@router.get("/billing/plan")
async def get_plan(
    current_user: User = Depends(get_current_user)
):
    amount = 0
    if current_user.plan == "pro":
        amount = 29 if current_user.billing_cycle == "monthly" else 290
    elif current_user.plan == "executive":
        amount = 99 if current_user.billing_cycle == "monthly" else 990
        
    return {
        "plan": current_user.plan,
        "billing_cycle": current_user.billing_cycle,
        "next_billing_date": current_user.next_billing_date,
        "amount": amount
    }

@router.post("/billing/update")
async def update_plan(
    plan_in: PlanUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Calculate amount based on plan
    amount = 0
    if plan_in.plan == "pro":
        amount = 29 if plan_in.billing_cycle == "monthly" else 290
    elif plan_in.plan == "executive":
        amount = 99 if plan_in.billing_cycle == "monthly" else 990

    # Create billing history record if paid plan
    if amount > 0:
        history = BillingHistory(
            user_id=current_user.id,
            amount=f"${amount}.00 USD",
            status="Paid",
            invoice_url="#"
        )
        db.add(history)
    
    update_data = {
        "plan": plan_in.plan,
        "billing_cycle": plan_in.billing_cycle,
        "next_billing_date": datetime.utcnow() + timedelta(days=30 if plan_in.billing_cycle == 'monthly' else 365)
    }
    
    await db.execute(update(User).where(User.id == current_user.id).values(**update_data))
    await db.commit()
    
    return {"status": "success", "user": {
        "plan": update_data["plan"],
        "billing_cycle": update_data["billing_cycle"]
    }}

@router.get("/billing/history")
async def get_billing_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(BillingHistory)
        .where(BillingHistory.user_id == current_user.id)
        .order_by(BillingHistory.date.desc())
    )
    history = result.scalars().all()
    return history

@router.get("/billing/methods")
async def get_payment_methods(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PaymentMethod)
        .where(PaymentMethod.user_id == current_user.id)
    )
    methods = result.scalars().all()
    return methods

@router.post("/billing/methods")
async def add_payment_method(
    method_in: PaymentMethodCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Mock validation and adding logic
    # In a real app, you'd integrate Stripe/etc here
    
    new_method = PaymentMethod(
        user_id=current_user.id,
        card_brand="Visa", # Mocked
        card_last4=method_in.card_number[-4:],
        expiry_month=method_in.expiry_month,
        expiry_year=method_in.expiry_year,
        is_default=True
    )
    
    # If there are other default methods, unset them (optional logic)
    
    db.add(new_method)
    await db.commit()
    await db.refresh(new_method)
    
    return new_method
