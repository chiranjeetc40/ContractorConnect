"""update_request_category_enum_values

Revision ID: 6b9ef96dd745
Revises: c0cebb35f006
Create Date: 2026-01-25 18:45:35.838799

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b9ef96dd745'
down_revision: Union[str, None] = 'c0cebb35f006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new enum values to the requestcategory enum type
    # PostgreSQL requires using ALTER TYPE to add enum values
    
    # Add STRUCTURAL_FIX
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = 'requestcategory' AND e.enumlabel = 'STRUCTURAL_FIX'
            ) THEN
                ALTER TYPE requestcategory ADD VALUE 'STRUCTURAL_FIX';
            END IF;
        END $$;
    """)
    
    # Add CARPENTRY
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = 'requestcategory' AND e.enumlabel = 'CARPENTRY'
            ) THEN
                ALTER TYPE requestcategory ADD VALUE 'CARPENTRY';
            END IF;
        END $$;
    """)
    
    # Add CLEANING
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = 'requestcategory' AND e.enumlabel = 'CLEANING'
            ) THEN
                ALTER TYPE requestcategory ADD VALUE 'CLEANING';
            END IF;
        END $$;
    """)



def downgrade() -> None:
    # Note: PostgreSQL doesn't support removing enum values easily
    # This is a destructive operation that would require recreating the enum
    # For now, we'll leave the new values in place
    pass

