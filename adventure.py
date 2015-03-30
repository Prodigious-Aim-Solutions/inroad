from pymongo import MongoClient
from flask import Flask, request, render_template, url_for
from wtforms import Form, BooleanField, TextField, PasswordField, validators
from werkzeug.security import generate_password_hash, check_password_hash
from flask.ext.cors import CORS, cross_origin
from bson.objectid import ObjectId
import json
from bson.json_util import dumps
import wtforms_json
import jwt
import datetime
import os

JWT_SECRET = "SP0CKTHEC@T"

wtforms_json.init()

class RegistrationForm(Form):
  username = TextField('Username', [validators.Length(min=4, max=50)])
  email = TextField('Email', [validators.Length(min=6, max=50)])
  password = PasswordField('Password', [
      validators.Required(),
      validators.EqualTo('confirm', message='Passwords must match'),
    ])
  confirm = PasswordField('Confirm Password')
  
class SignInForm(Form):
  username = TextField('Username', [validators.Length(min=4, max=50)])
  password = PasswordField('Password', [validators.Required()])

client = MongoClient('localhost', 27017)
db = client.nova_scotia_adventures

def user_exists(username):
  user = db.users.find_one({"username": username})
  if not user:
    user = db.users.find_one({"email": username})
    if not user:
      return False
  return user

def log_the_user_in(username, password):
  user = user_exists(username)
  if not user:
      return {"error": "No User Found"}
  if check_password_hash(user['password'], password):
    return {"token": jwt.encode({
          "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1 ),
          "iss": "admin",
          "aud": "all",
          "userId": str(user['_id']),
          "username": str(user['username'])
        }, JWT_SECRET)}

def register_the_user(username, email, password):
  user = {
    "username": username,
    "email": email,
    "password": generate_password_hash(password)
  }
  return_user = {
    "username": username,
    "email": email
  }
  db.users.insert(user)
  return return_user

def check_badge(userId, locType):
  badge = {
    'userId': str(userId),
    'locType': locType,
    'level': 0
  }
  badges = db.badges.find_one({"userId": userId, "locType": locType})
  if not badges:
    db.badges.insert(badge)
    return False
  checkIns = db.checkin.find({"userId": userId, "locType": locType})
  checkInsLen = checkIns.count()
  if badges["level"] == 3:
    return False
  if checkInsLen == 3 and badges["level"] < 1:
    badge['level'] = 1
    db.badges.insert(badge)
    return badge
  elif checkInsLen == 6 and badges["level"] < 2:
    badge['level'] = 2
    db.badges.insert(badge)
    return badge
  elif checkInsLen == 10 and badges["level"] < 3:
    badge['level'] = 3
    db.badges.insert(badge)
    return badge
  return False

def create_dest_list(dest_list):
  new_dest_list = db.destinationlists.insert(dest_list)
  return new_dest_list

def get_user_lists(user):
  lists = db.destinationlists.find({'user': user['userId']})
  return lists


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.after_request
def add_header(response):
    response.cache_control.max_age = 300
    return response
  
@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)

@app.route("/")
def hello():
    return render_template("index.html"), 200
  
@app.route("/api/v1/register", methods=['POST'])
def register():
  form = RegistrationForm.from_json(request.json)
  if user_exists(request.json['username']):
    return json.dumps({"error": "Username or email is already used"})
  if request.method == 'POST' and form.validate():
    new_user = register_the_user(request.json['username'],
                             request.json['email'],
                             request.json['password'])
    user = log_the_user_in(request.json['username'], request.json['password'])
    return json.dumps({"user": user}), 200
  else:
    error = 'Invalid username/password'
    return json.dumps({"Error": error}), 401
    
@app.route("/api/v1/signin", methods=['POST'])
@cross_origin()
def signin():
  if request.method == 'POST':
    form = SignInForm.from_json(request.json)
    if form.validate():
      user = log_the_user_in(request.json['username'], request.json['password'])
      if not 'error' in user.keys():
        return json.dumps({"user": user}), 200
      else:
        return json.dumps({"Error": "Authentication failed"}), 401
    else:
      return json.dumps({"Error": "Authentication failed"}), 401
    
@app.route("/api/v1/checkin", methods=['POST'])
@cross_origin()
def checkin():
  token = request.json['token']
  locId = request.json['locId']
  locType = request.json['locType']
  if token and locId and locType:
    user = jwt.decode(token, JWT_SECRET, audience="all")
    checkin = {
      "userId": user['userId'],
      "locId": locId,
      "locType": locType
    }
    db.checkin.insert(checkin)
    badge = check_badge(user['userId'], locType)
    badge_out = False
    if badge:
      badge_out = {'locType': badge['locType'], 'level': badge['level']}
    return json.dumps({'checkin': 'success', 'badge': badge_out}), 200
  return json.dumps({'Error': 'Unsuccessful checkin'}), 401

@app.route("/api/v1/destinationlist", methods=['GET'])
@cross_origin()
def get_dest_lists():
  token = request.args.get('token')
  if token:
    user = jwt.decode(token, JWT_SECRET, audience="all")
    lists = get_user_lists(user)
    return dumps(lists), 200
  else:
    return dumps({'Error': 'Not Authorized For Action'}), 401

@app.route("/api/v1/destinationlist", methods=['POST'])
@cross_origin()
def add_dest_list():
  token = request.json['token']
  if token:
    destIds = request.json['destIds']
    name = request.json['name']
    user = jwt.decode(token, JWT_SECRET, audience="all")
    dest_list = create_dest_list({'user': user['userId'], 'data': destIds, 'name': name, 'updated': datetime.datetime.now()})
    saved_list = {
      'id': str(dest_list),
      'name': name,
      'updated': str(datetime.datetime.now())
    }
    return dumps(saved_list), 200
  else: 
    return dumps({'Error': 'Not Authorized For Action'}), 401

@app.route("/api/v1/session", methods=['POST'])
@cross_origin()
def check_session():
  token = request.json['token']
  try:
    valid_token = jwt.decode(token, JWT_SECRET, audience="all")
    user = {
      "username": valid_token['username']
    }
    return json.dumps({"user": user}), 200
  except jwt.ExpiredSignatureError:
    return json.dumps({"user": False}), 401
  

if __name__ == "__main__":
    app.run(host= '0.0.0.0', debug=True)