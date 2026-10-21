from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ProductConfig
from app.schemas import ProductConfigResponse, ProductConfigUpdate
from app.services.product_service import get_or_create_product_config

router = APIRouter(prefix="/product", tags=["Product"])

@router.get("", response_model=ProductConfigResponse)
def get_product_config(db: Session = Depends(get_db)):
    config = get_or_create_product_config(db)
    return config

@router.put("", response_model=ProductConfigResponse)
def update_product_config(update_in: ProductConfigUpdate, db: Session = Depends(get_db)):
    config = get_or_create_product_config(db)
    
    config.product_name = update_in.product_name
    config.tagline = update_in.tagline
    config.description = update_in.description
    config.target_audience = update_in.target_audience
    config.features = update_in.features
    config.benefits = update_in.benefits
    config.pricing_information = update_in.pricing_information
    config.faqs = update_in.faqs
    config.demo_instructions = update_in.demo_instructions
    config.contact_information = update_in.contact_information
    
    db.commit()
    db.refresh(config)
    return config
