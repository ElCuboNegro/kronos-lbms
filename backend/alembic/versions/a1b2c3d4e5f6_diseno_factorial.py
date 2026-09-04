"""diseño factorial: factores, niveles, tratamientos

Revision ID: a1b2c3d4e5f6
Revises: e1a2b3c4d5e6
Create Date: 2026-08-24 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'e1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('experimentos', sa.Column('tipo_diseno', sa.String(length=20), nullable=True))

    op.create_table(
        'factores_experimentales',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('experimento_id', sa.UUID(), nullable=False),
        sa.Column('nombre', sa.String(length=120), nullable=False),
        sa.Column('unidad', sa.String(length=40), nullable=True),
        sa.Column('tipo', sa.String(length=20), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['experimento_id'], ['experimentos.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_factores_experimentales_experimento_id'),
                    'factores_experimentales', ['experimento_id'], unique=False)

    op.create_table(
        'niveles_factor',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('factor_id', sa.UUID(), nullable=False),
        sa.Column('etiqueta', sa.String(length=120), nullable=False),
        sa.Column('valor_num', sa.Float(), nullable=True),
        sa.Column('orden', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['factor_id'], ['factores_experimentales.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_niveles_factor_factor_id'),
                    'niveles_factor', ['factor_id'], unique=False)

    op.create_table(
        'tratamientos',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('experimento_id', sa.UUID(), nullable=False),
        sa.Column('codigo', sa.String(length=40), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=True),
        sa.Column('es_control', sa.Boolean(), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['experimento_id'], ['experimentos.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_tratamientos_experimento_id'),
                    'tratamientos', ['experimento_id'], unique=False)

    op.create_table(
        'tratamiento_nivel',
        sa.Column('tratamiento_id', sa.UUID(), nullable=False),
        sa.Column('nivel_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['tratamiento_id'], ['tratamientos.id']),
        sa.ForeignKeyConstraint(['nivel_id'], ['niveles_factor.id']),
        sa.PrimaryKeyConstraint('tratamiento_id', 'nivel_id'),
    )


def downgrade() -> None:
    op.drop_table('tratamiento_nivel')
    op.drop_index(op.f('ix_tratamientos_experimento_id'), table_name='tratamientos')
    op.drop_table('tratamientos')
    op.drop_index(op.f('ix_niveles_factor_factor_id'), table_name='niveles_factor')
    op.drop_table('niveles_factor')
    op.drop_index(op.f('ix_factores_experimentales_experimento_id'), table_name='factores_experimentales')
    op.drop_table('factores_experimentales')
    op.drop_column('experimentos', 'tipo_diseno')
