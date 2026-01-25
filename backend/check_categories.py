from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(str(settings.database_url))
with engine.connect() as conn:
    result = conn.execute(text('SELECT DISTINCT category FROM requests'))
    categories = [row[0] for row in result]
    print("Existing categories:", categories)
