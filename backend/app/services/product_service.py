import json
from sqlalchemy.orm import Session
from app.models import ProductConfig, SystemSettings

def get_or_create_product_config(db: Session) -> ProductConfig:
    config = db.query(ProductConfig).filter(ProductConfig.id == 1).first()
    if not config:
        config = ProductConfig(id=1)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

def get_or_create_system_settings(db: Session) -> SystemSettings:
    settings_obj = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    if not settings_obj:
        settings_obj = SystemSettings(id=1)
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj
