"""vincular sustratos con formulaciones y lotes

Revision ID: f3a8b2c1d0e9
Revises: e9e4b7c1b454
Create Date: 2026-05-01 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3a8b2c1d0e9'
down_revision: Union[str, Sequence[str], None] = 'e9e4b7c1b454'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('sustratos', sa.Column('formulacion_id', sa.UUID(), nullable=True))
    op.add_column('sustratos', sa.Column('lote_id', sa.UUID(), nullable=True))
    op.create_foreign_key(None, 'sustratos', 'formulaciones', ['formulacion_id'], ['id'])
    op.create_foreign_key(None, 'sustratos', 'lotes_preparados', ['lote_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint(None, 'sustratos', type_='foreignkey')
    op.drop_constraint(None, 'sustratos', type_='foreignkey')
    op.drop_column('sustratos', 'lote_id')
    op.drop_column('sustratos', 'formulacion_id')
