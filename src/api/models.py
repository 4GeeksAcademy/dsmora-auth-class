from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, ForeignKey, Text, select
from sqlalchemy.orm import Mapped, mapped_column, relationship
from flask_bcrypt import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    image: Mapped[str] = mapped_column(String(500), nullable=True)

    todos = relationship('Todo', back_populates='user',
                         cascade='all, delete-orphan')

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "image": self.image,
            # do not serialize the password, its a security breach
        }

    def register(self, email, password):
        self.email = email
        self.password = generate_password_hash(password).decode('utf-8')
        self.is_active = True

        db.session.add(self)
        db.session.commit()

        return self.serialize()

    def update_password(self, email, password, new_password):
        find_user = db.session.execute(select(User).where(
            User.email == email)).scalar_one_or_none()

        if find_user is not None and check_password_hash(find_user.password, password):
            hash_new_password = generate_password_hash(
                new_password).decode('utf-8')
            find_user.password = hash_new_password
            db.session.commit()
            return True
        return False

    def search_user(self, email, password):
        find_user = db.session.execute(select(User).where(
            User.email == email)).scalar_one_or_none()

        if find_user is None or not check_password_hash(find_user.password, password):
            return None
        return find_user.serialize()

    def search_user_by_email(self, email):
        find_user = db.session.execute(select(User).where(
            User.email == email)).scalar_one_or_none()

        if find_user is None:
            return None
        return find_user.serialize()


class Todo(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_completed: Mapped[bool] = mapped_column(
        Boolean(), default=False, nullable=False)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey('user.id'), nullable=False)

    user = relationship('User', back_populates='todos')

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "is_completed": self.is_completed,
            "user_id": self.user_id
        }
