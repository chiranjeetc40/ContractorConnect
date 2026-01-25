from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(str(settings.database_url))
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT e.enumlabel 
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'requestcategory'
        ORDER BY e.enumsortorder
    """))
    enum_values = [row[0] for row in result]
    print("Current enum values:", enum_values)
