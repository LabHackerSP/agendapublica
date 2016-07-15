from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData, Table
from datetime import datetime
from flask_security import Security, SQLAlchemyUserDatastore, RoleMixin, UserMixin
from flask_security.utils import encrypt_password
from flask_login import (LoginManager, current_user, login_required,
                         login_user, logout_user, AnonymousUserMixin,
                         confirm_login, fresh_login_required)

app = Flask(__name__)
app.config.from_pyfile('settings.py')
db = SQLAlchemy(app)
metadata = MetaData(bind=db.engine)
s = db.session
login_manager = LoginManager()
login_manager.init_app(app)

tagevento_table = db.Table('tag_evento',
  db.Column('tag_id', db.Integer, db.ForeignKey('tag.id')),
  db.Column('evento_id', db.Integer, db.ForeignKey('evento.id'))
)

rolesusers_table = db.Table(
  'roles_users',
  db.Column('responsavel_id', db.Integer(), db.ForeignKey('responsavel.id')),
  db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
)

class Role(db.Model, RoleMixin):
  id = db.Column(db.Integer(), primary_key=True)
  name = db.Column(db.String(50), unique=True)
  description = db.Column(db.String(140))

  def __repr__(self):
    return self.name

class Orgao(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  nome = db.Column(db.String(140))
  local = db.Column(db.String(140))
  endereco = db.Column(db.String(140))

  def __repr__(self):
    return self.nome

class Tipo(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  tipo = db.Column(db.String(140))
  
  def __repr__(self):
    return self.tipo

class Tag(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  tag = db.Column(db.String(50))

  def __repr__(self):
    return self.tag

class Responsavel(db.Model, UserMixin):
  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(120), unique=True)
  nome = db.Column(db.String(120))
  orgao_id = db.Column(db.Integer, db.ForeignKey('orgao.id'))
  orgao = db.relationship('Orgao')
  tel = db.Column(db.String(25))
  data_registro = db.Column(db.DateTime)
  password = db.Column(db.String(256))
  active = db.Column(db.Boolean())
  confirmed_at = db.Column(db.DateTime())
  roles = db.relationship('Role', secondary=rolesusers_table,
              backref=db.backref('Responsavel', lazy='dynamic'))

  def is_active(self):
    return self.active

  def is_anonymous(self):
    return False

  def is_authenticated(self):
    return self.active
    
  def get_id(self):
    return self.id
    
  def __repr__(self):
    return self.nome

class Evento(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  titulo = db.Column(db.String(140), unique=False)
  orgao_id = db.Column(db.Integer, db.ForeignKey('orgao.id'))
  orgao = db.relationship('Orgao')
  responsavel_id = db.Column(db.Integer, db.ForeignKey('responsavel.id'))
  responsavel = db.relationship('Responsavel')
  tipo_id = db.Column(db.Integer, db.ForeignKey('tipo.id'))
  tipo = db.relationship('Tipo')
  local = db.Column(db.String(140))
  endereco = db.Column(db.String(140))
  data_inicio = db.Column(db.DateTime)
  data_fim = db.Column(db.DateTime)
  #horario = db.Column(db.String(255))
  descricao = db.Column(db.Text)
  link = db.Column(db.Text)
  cartaz = db.Column(db.String(255))
  tags = db.relationship('Tag', secondary=tagevento_table,
              backref=db.backref('Evento', lazy='dynamic'))

  def __repr__(self):
    return '<Titulo %r>' % self.titulo
    
class User(UserMixin):
  def __init__(self, name, email, active=True, admin=False):
    self.name = name
    self.email = email
    self.active = active
    self.auth = True
    self.admin = admi
    
class Anonymous(AnonymousUserMixin):
  name = u"Anonymous"
  id = None
  auth = False
    
login_manager.anonymous_user = Anonymous
login_manager.login_view = "login"
login_manager.login_message = u"Você precisa estar logado para acessar esta página."
login_manager.refresh_view = "reauth"

#Setup Flask-Security
user_datastore = SQLAlchemyUserDatastore(db, Responsavel, Role)
security = Security(app, user_datastore)

@login_manager.user_loader
def load_user(email):
  usr = Responsavel.query.filter_by(email=email).first()
  if usr:
    return usr
  else:
    return None
    
@app.route("/")
def index():
  return "null"
  
@app.route("/login", methods=["GET", "POST"])
def login():
  if request.method == "POST" and "email" in request.form:
    email = request.form["email"]
    password = request.form["password"]
    # check password
    usr = Responsavel.query.filter_by(email=email).first()
    if usr != None and verify_password(password, usr.password):
      login_user(usr)
      return redirect(request.args.get("next") or url_for("index"))
    else:
      flash("Nome de usuário ou senha inválidos.")
  return render_template("login.html", user=current_user)
  
if __name__ == "__main__":
  app.run()
