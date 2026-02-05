import uuid
from datetime import datetime
from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Coupon(Base):
    """
    쿠폰 테이블
    
    coupon_type의 규칙을 기반으로 실제 할인 값을 가진 쿠폰 인스턴스
    - value는 scope별 할인 값 Dict
    - 예: { "UNLOCK": { "discount": 50, "cap": 1000 }, "RIDE": { "discount": 100 } }
    """
    __tablename__ = "coupon"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coupon_type_id = Column(String(36), ForeignKey("coupon_type.id"), nullable=False, comment="쿠폰 타입 ID")
    
    name = Column(String(255), nullable=True, comment="쿠폰명 (옵션)")
    
    # scope별 할인 값
    # { "UNLOCK": { "discount": 50, "cap": 1000 }, "RIDE": { "discount": 100, "cap": 500 } }
    value = Column(JSON, nullable=True, comment="scope별 할인 값")
    
    # 유효기간
    valid_from = Column(DateTime, nullable=True, comment="유효 시작일")
    valid_until = Column(DateTime, nullable=True, comment="유효 종료일")
    
    # 메타데이터
    created_at = Column(DateTime, default=datetime.utcnow, comment="생성일시")
    
    # Relationships
    coupon_type = relationship("CouponType", backref="coupons")
