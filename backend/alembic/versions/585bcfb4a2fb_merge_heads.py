"""merge heads

Revision ID: 585bcfb4a2fb
Revises: f3a8b2c1d0e9, fd1e1e670e91
Create Date: 2026-05-02 21:00:59.425400

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '585bcfb4a2fb'
down_revision: Union[str, Sequence[str], None] = ('f3a8b2c1d0e9', 'fd1e1e670e91')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
