from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(str(settings.database_url))
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'requests'
        ORDER BY ordinal_position
    """))
    columns = [row[0] for row in result]
    print("Current columns in requests table:")
    for col in columns:
        print(f"  - {col}")
