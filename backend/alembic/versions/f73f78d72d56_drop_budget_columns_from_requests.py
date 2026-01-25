"""drop_budget_columns_from_requests

Revision ID: f73f78d72d56
Revises: 6b9ef96dd745
Create Date: 2026-01-25 19:10:43.769935

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f73f78d72d56'
down_revision: Union[str, None] = '6b9ef96dd745'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop budget_min and budget_max columns from requests table
    op.drop_column('requests', 'budget_min')
    op.drop_column('requests', 'budget_max')


def downgrade() -> None:
    # Re-add the columns if we need to rollback
    op.add_column('requests', sa.Column('budget_min', sa.Float(), nullable=True))
    op.add_column('requests', sa.Column('budget_max', sa.Float(), nullable=True))
