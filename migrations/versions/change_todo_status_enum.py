"""Change Todo is_completed to status enum

Revision ID: change_todo_status_enum
Revises: 514eb28bb4f9
Create Date: 2026-02-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'change_todo_status_enum'
down_revision = '514eb28bb4f9'
branch_labels = None
depends_on = None

todostatus_enum = sa.Enum('PENDING', 'ON_GOING',
                          'COMPLETED', name='todostatus')


def upgrade():
    # Create the enum type first (for PostgreSQL)
    todostatus_enum.create(op.get_bind(), checkfirst=True)

    # Add new status column with default PENDING
    op.add_column('todo', sa.Column('status', todostatus_enum, nullable=True))

    # Migrate existing data: is_completed=True -> COMPLETED, False -> PENDING
    op.execute(
        "UPDATE todo SET status = CASE WHEN is_completed = TRUE THEN 'COMPLETED'::todostatus ELSE 'PENDING'::todostatus END"
    )

    # Make status not nullable
    op.alter_column('todo', 'status', nullable=False)

    # Drop the old is_completed column
    op.drop_column('todo', 'is_completed')


def downgrade():
    # Add back is_completed column
    op.add_column('todo', sa.Column(
        'is_completed', sa.Boolean(), nullable=True))

    # Migrate data back
    op.execute(
        "UPDATE todo SET is_completed = CASE WHEN status = 'COMPLETED' THEN TRUE ELSE FALSE END"
    )

    op.alter_column('todo', 'is_completed', nullable=False)

    # Drop status column
    op.drop_column('todo', 'status')

    # Drop enum type
    todostatus_enum.drop(op.get_bind(), checkfirst=True)
