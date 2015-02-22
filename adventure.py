from pymongo import MongoClient
from flask import Flask, request, render_template
from wtforms import Form, BooleanField, TextField, PasswordField, validators
from werkzeug.security import generate_password_hash, check_password_hash
from flask.ext.cors import CORS, cross_origin
from bson.objectid import ObjectId
import json
import wtforms_json
import jwt
import datetime

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
          "userId": str(user['_id'])
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
  if checkInsLen > 2 and badges["level"] < 1:
    badge['level'] = 1
    db.badges.insert(badge)
    return badge
  elif checkInsLen > 5 and badges["level"] < 2:
    badge['level'] = 2
    db.badges.insert(badge)
    return badge
  elif checkInsLen > 9 and badges["level"] < 3:
    badge['level'] = 3
    db.badges.insert(badge)
    return badge
  return False

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/")
def hello():
    return render_template("index.html")
  
@app.route("/api/v1/register", methods=['POST'])
def register():
  form = RegistrationForm.from_json(request.json)
  if request.method == 'POST' and form.validate() and not user_exists(request.json['username']):
    new_user = register_the_user(request.json['username'],
                             request.json['email'],
                             request.json['password'])
    user = log_the_user_in(new_user.username, new_user.password)
    return json.dumps({"user": user})
  else:
    error = 'Invalid username/password'
    return json.dumps({"error": error})
    
@app.route("/api/v1/signin", methods=['POST'])
@cross_origin()
def signin():
  if request.method == 'POST':
    form = SignInForm.from_json(request.json)
    if form.validate():
      user = log_the_user_in(request.json['username'], request.json['password'])
      return json.dumps({"user": user})
    else:
      return json.dumps({"error": "authentication failed"})
    
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
    return json.dumps({'checkin': 'success', 'badge': False})
  return json.dumps({'error': 'Unsuccessful checkin'})

if __name__ == "__main__":
    app.run(host= '0.0.0.0', debug=True)