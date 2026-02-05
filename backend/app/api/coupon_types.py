"""
Coupon Types API - 쿠폰 타입 CRUD
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.coupon_type import CouponType
from app.schemas.coupon_type import (
    CouponTypeCreate,
    CouponTypeUpdate,
    CouponTypeResponse,
)

router = APIRouter()


@router.get("", response_model=List[CouponTypeResponse])
def list_coupon_types(
    skip: int = 0,
    limit: int = 100,
    is_active: bool = None,
    db: Session = Depends(get_db),
):
    """쿠폰 타입 목록 조회"""
    query = db.query(CouponType)
    
    if is_active is not None:
        query = query.filter(CouponType.is_active == is_active)
    
    coupon_types = query.offset(skip).limit(limit).all()
    return coupon_types


@router.get("/{coupon_type_id}", response_model=CouponTypeResponse)
def get_coupon_type(coupon_type_id: str, db: Session = Depends(get_db)):
    """쿠폰 타입 상세 조회"""
    coupon_type = db.query(CouponType).filter(CouponType.id == coupon_type_id).first()
    if not coupon_type:
        raise HTTPException(status_code=404, detail="쿠폰 타입을 찾을 수 없습니다")
    return coupon_type


@router.post("", response_model=CouponTypeResponse)
def create_coupon_type(
    coupon_type_in: CouponTypeCreate,
    db: Session = Depends(get_db),
):
    """쿠폰 타입 생성"""
    # Pydantic 모델을 dict로 변환
    data = coupon_type_in.model_dump()
    
    # JSON 필드 처리
    if data.get("eligibility_rules"):
        data["eligibility_rules"] = data["eligibility_rules"]
    if data.get("discount_rules"):
        data["discount_rules"] = data["discount_rules"]
    if data.get("value_schema"):
        data["value_schema"] = data["value_schema"]
    
    coupon_type = CouponType(**data)
    db.add(coupon_type)
    db.commit()
    db.refresh(coupon_type)
    return coupon_type


@router.put("/{coupon_type_id}", response_model=CouponTypeResponse)
def update_coupon_type(
    coupon_type_id: str,
    coupon_type_in: CouponTypeUpdate,
    db: Session = Depends(get_db),
):
    """쿠폰 타입 수정"""
    coupon_type = db.query(CouponType).filter(CouponType.id == coupon_type_id).first()
    if not coupon_type:
        raise HTTPException(status_code=404, detail="쿠폰 타입을 찾을 수 없습니다")
    
    # None이 아닌 필드만 업데이트
    update_data = coupon_type_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(coupon_type, field, value)
    
    db.commit()
    db.refresh(coupon_type)
    return coupon_type


@router.delete("/{coupon_type_id}")
def delete_coupon_type(coupon_type_id: str, db: Session = Depends(get_db)):
    """쿠폰 타입 삭제"""
    coupon_type = db.query(CouponType).filter(CouponType.id == coupon_type_id).first()
    if not coupon_type:
        raise HTTPException(status_code=404, detail="쿠폰 타입을 찾을 수 없습니다")
    
    db.delete(coupon_type)
    db.commit()
    return {"message": "삭제되었습니다", "id": coupon_type_id}
