"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

user = User()


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/register', methods=['POST'])
def register():
    email = request.get_json()['email']
    password = request.get_json()['password']

    user = User()

    find_user = user.search_user_by_email(email)

    if find_user is not None:
        return jsonify({'msg': 'user already exists'}), 400

    if email is None or password is None:
        return jsonify({'msg': 'bad request'}), 400

    created_user = user.register(email, password)

    return jsonify(created_user), 201


@api.route('/login', methods=['POST'])
def login():
    email = request.get_json()['email']
    password = request.get_json()['password']

    find_user = user.search_user(email, password)

    if find_user is None:
        return jsonify({'msg': 'auth err'}), 401

    access_token = create_access_token(identity=str(find_user['id']))

    return jsonify({"token": access_token})


@api.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    # Accede a la identidad del usuario actual con get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    return jsonify({"id": user.id, "email": user.email}), 200
