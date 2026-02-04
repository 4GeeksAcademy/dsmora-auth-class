from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, select
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }

    def register(self, email, password):
        self.email = email
        self.password = password
        self.is_active = True

        db.session.add(self)
        db.session.commit()

        return self.serialize()

    def search_user(self, email, password):
        find_user = db.session.execute(select(User).where(
            User.email == email, User.password == password)).scalar_one_or_none()

        if find_user is None:
            return None
        return find_user.serialize()
