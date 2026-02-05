"""
Coupons API - 쿠폰 CRUD
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.coupon import Coupon
from app.models.coupon_type import CouponType
from app.schemas.coupon import CouponCreate, CouponUpdate, CouponResponse

router = APIRouter()


@router.get("", response_model=List[CouponResponse])
def list_coupons(
    skip: int = 0,
    limit: int = 100,
    coupon_type_id: str = None,
    db: Session = Depends(get_db),
):
    """쿠폰 목록 조회"""
    query = db.query(Coupon)
    
    if coupon_type_id:
        query = query.filter(Coupon.coupon_type_id == coupon_type_id)
    
    coupons = query.offset(skip).limit(limit).all()
    return coupons


@router.get("/{coupon_id}", response_model=CouponResponse)
def get_coupon(coupon_id: str, db: Session = Depends(get_db)):
    """쿠폰 상세 조회"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="쿠폰을 찾을 수 없습니다")
    return coupon


@router.post("", response_model=CouponResponse)
def create_coupon(
    coupon_in: CouponCreate,
    db: Session = Depends(get_db),
):
    """쿠폰 생성"""
    # 쿠폰 타입 존재 확인
    coupon_type = db.query(CouponType).filter(
        CouponType.id == coupon_in.coupon_type_id
    ).first()
    if not coupon_type:
        raise HTTPException(status_code=404, detail="쿠폰 타입을 찾을 수 없습니다")
    
    coupon = Coupon(**coupon_in.model_dump())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: str,
    coupon_in: CouponUpdate,
    db: Session = Depends(get_db),
):
    """쿠폰 수정"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="쿠폰을 찾을 수 없습니다")
    
    update_data = coupon_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(coupon, field, value)
    
    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}")
def delete_coupon(coupon_id: str, db: Session = Depends(get_db)):
    """쿠폰 삭제"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="쿠폰을 찾을 수 없습니다")
    
    db.delete(coupon)
    db.commit()
    return {"message": "삭제되었습니다", "id": coupon_id}
