"""Add lote_id to especimen

Revision ID: e1a2b3c4d5e6
Revises: 6463e1cdd6c6
Create Date: 2026-05-07 23:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = '6463e1cdd6c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('especimenes', sa.Column('lote_id', sa.UUID(), nullable=True))
    op.create_index(op.f('ix_especimenes_lote_id'), 'especimenes', ['lote_id'], unique=False)
    op.create_foreign_key(None, 'especimenes', 'lotes_preparados', ['lote_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint(None, 'especimenes', type_='foreignkey')
    op.drop_index(op.f('ix_especimenes_lote_id'), table_name='especimenes')
    op.drop_column('especimenes', 'lote_id')
