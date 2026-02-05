import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, Boolean, DateTime
from app.core.database import Base


class CouponType(Base):
    """
    쿠폰 타입 테이블
    
    Low-code 방식으로 할인 규칙을 JSON으로 저장
    """
    __tablename__ = "coupon_type"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, comment="쿠폰 타입명")
    description = Column(Text, nullable=True, comment="설명")
    
    # 적용 조건 (JSON)
    # {
    #   "conditions": [
    #     {"field": "ride_distance", "operator": "gte", "value": 1.0},
    #     {"field": "pricing_order_amount", "operator": "gte", "value": 5000}
    #   ],
    #   "logic": "AND"
    # }
    eligibility_rules = Column(JSON, nullable=True, comment="적용 조건 규칙")
    
    # 할인 규칙 (JSON)
    # {
    #   "scopes": [
    #     {
    #       "scope": "UNLOCK",
    #       "enabled": true,
    #       "target_field": "unlock_fee",
    #       "discount_axis": "NONE",
    #       "discount_unit": "PERCENT",
    #       "default_value": 100,
    #       "cap_rule": {"type": "SCOPE_DISCOUNT", "value": 500}
    #     },
    #     ...
    #   ]
    # }
    discount_rules = Column(JSON, nullable=True, comment="할인 규칙")
    
    # 메타데이터
    is_active = Column(Boolean, default=True, comment="활성화 여부")
    created_at = Column(DateTime, default=datetime.utcnow, comment="생성일시")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="수정일시")
