"""add_email_and_delivery_method_to_otp

Revision ID: c0cebb35f006
Revises: f58c95790ff8
Create Date: 2026-01-11 20:52:07.730035

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c0cebb35f006'
down_revision: Union[str, None] = 'f58c95790ff8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns
    op.add_column('otps', sa.Column('email', sa.String(length=255), nullable=True))
    op.add_column('otps', sa.Column('delivery_method', sa.String(length=10), nullable=False, server_default='sms'))
    
    # Create index on email column
    op.create_index(op.f('ix_otps_email'), 'otps', ['email'], unique=False)
    
    # Make phone_number nullable (since we now support email-only OTPs)
    op.alter_column('otps', 'phone_number',
                    existing_type=sa.String(length=15),
                    nullable=True)


def downgrade() -> None:
    # Remove index
    op.drop_index(op.f('ix_otps_email'), table_name='otps')
    
    # Remove new columns
    op.drop_column('otps', 'delivery_method')
    op.drop_column('otps', 'email')
    
    # Make phone_number not nullable again
    op.alter_column('otps', 'phone_number',
                    existing_type=sa.String(length=15),
                    nullable=False)
