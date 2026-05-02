"""add genealogy indexes

Revision ID: 999999999999
Revises: 585bcfb4a2fb
Create Date: 2026-05-02 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '999999999999'
down_revision = '585bcfb4a2fb'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_index(op.f('ix_especimenes_madre_id'), 'especimenes', ['madre_id'], unique=False)
    op.create_index(op.f('ix_especimenes_padre_id'), 'especimenes', ['padre_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_especimenes_padre_id'), table_name='especimenes')
    op.drop_index(op.f('ix_especimenes_madre_id'), table_name='especimenes')
