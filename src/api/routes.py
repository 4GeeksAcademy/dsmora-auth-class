"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Todo, TodoStatus
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

user = User()


@api.route('/register', methods=['POST'])
def register():
    body = request.get_json()

    user = User()

    find_user = user.search_user_by_email(body['email'])

    if find_user is not None:
        return jsonify({'code_error': 'USER_ALREADY_EXISTS'}), 400

    if 'email' not in body or 'password' not in body:
        return jsonify({'code_error': 'BAD_REQUEST'}), 400

    created_user = user.register(body['email'], request.get_json()['password'])

    return jsonify(created_user), 201


@api.route('/login', methods=['POST'])
def login():
    email = request.get_json()['email']
    password = request.get_json()['password']

    find_user = user.search_user(email, password)

    if find_user is None:
        return jsonify({'code_error': 'AUTH_ERROR'}), 401

    access_token = create_access_token(identity=str(find_user['id']))

    return jsonify({"token": access_token, "user": find_user})


@api.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    found_user = User.query.get(current_user_id)
    if found_user is None:
        return jsonify({'code_error': 'NOT_FOUND'}), 404
    return jsonify(found_user.serialize())


@api.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user is None:
        return jsonify({'code_error': 'NOT_FOUND', 'message': 'User not found'}), 404

    body = request.get_json()

    if 'image' in body:
        user.image = body['image']

    db.session.commit()

    return jsonify(user.serialize()), 200


@api.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    body = request.get_json()

    if 'password' not in body or 'new_password' not in body:
        return jsonify({'code_error': 'BAD_REQUEST', 'message': 'Se requiere password y new_password'}), 400

    found_user = User.query.get(current_user_id)
    if found_user is None:
        return jsonify({'code_error': 'NOT_FOUND'}), 404

    result = found_user.update_password(
        found_user.email, body['password'], body['new_password'])
    if not result:
        return jsonify({'code_error': 'AUTH_ERROR', 'message': 'Contraseña actual incorrecta'}), 401

    return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200


# Todo endpoints
@api.route('/todos', methods=['GET'])
@jwt_required()
def get_todos():
    current_user_id = get_jwt_identity()
    todos = Todo.query.filter_by(user_id=current_user_id).all()
    return jsonify([todo.serialize() for todo in todos]), 200


@api.route('/todos', methods=['POST'])
@jwt_required()
def create_todo():
    current_user_id = get_jwt_identity()
    body = request.get_json()

    if 'title' not in body:
        return jsonify({'code_error': 'BAD_REQUEST', 'message': 'Title is required'}), 400

    status_value = body.get('status', 'PENDING')
    try:
        status = TodoStatus[status_value]
    except KeyError:
        status = TodoStatus.PENDING

    new_todo = Todo(
        title=body['title'],
        description=body.get('description', ''),
        status=status,
        user_id=current_user_id
    )

    db.session.add(new_todo)
    db.session.commit()

    return jsonify(new_todo.serialize()), 201


@api.route('/todos/<int:todo_id>', methods=['GET'])
@jwt_required()
def get_todo(todo_id):
    current_user_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, user_id=current_user_id).first()

    if todo is None:
        return jsonify({'code_error': 'NOT_FOUND', 'message': 'Todo not found'}), 404

    return jsonify(todo.serialize()), 200


@api.route('/todos/<int:todo_id>', methods=['PUT'])
@jwt_required()
def update_todo(todo_id):
    current_user_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, user_id=current_user_id).first()

    if todo is None:
        return jsonify({'code_error': 'NOT_FOUND', 'message': 'Todo not found'}), 404

    body = request.get_json()

    if 'title' in body:
        todo.title = body['title']
    if 'description' in body:
        todo.description = body['description']
    if 'status' in body:
        try:
            todo.status = TodoStatus[body['status']]
        except KeyError:
            return jsonify({'code_error': 'BAD_REQUEST', 'message': 'Invalid status value'}), 400

    db.session.commit()

    return jsonify(todo.serialize()), 200


@api.route('/todos/<int:todo_id>', methods=['DELETE'])
@jwt_required()
def delete_todo(todo_id):
    current_user_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, user_id=current_user_id).first()

    if todo is None:
        return jsonify({'code_error': 'NOT_FOUND', 'message': 'Todo not found'}), 404

    db.session.delete(todo)
    db.session.commit()

    return jsonify({'message': 'Todo deleted successfully'}), 200
