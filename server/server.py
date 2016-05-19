# -*- coding: utf-8 -*-
import os
from flask import Flask, url_for, redirect, render_template, request, abort
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin import helpers as admin_helpers
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore, \
    UserMixin, RoleMixin, login_required, current_user
from flask_security.utils import encrypt_password
import flask.ext.restless
from flask.ext.cors import CORS
from datetime import datetime
from settings import *


app = Flask(__name__)

#Config
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///" + SETTINGS['DATABASE']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = SETTINGS['SECRET_KEY']
if SETTINGS['DEBUG']:
    app.config['SQLALCHEMY_ECHO'] = True
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db = SQLAlchemy(app)

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
    name = db.Column(db.String(255), unique=True)
    description = db.Column(db.String(255))

    def __repr__(self):
        return self.name

class Orgao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255))

    def __repr__(self):
        return self.nome

class Tipo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(255))
    
    def __repr__(self):
        return self.tipo

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(255))

    def __repr__(self):
        return self.tag

class Responsavel(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255))
    orgao_id = db.Column(db.Integer, db.ForeignKey('orgao.id'))
    orgao = db.relationship('Orgao')
    email = db.Column(db.String(255), unique=True)
    tel = db.Column(db.String(255))
    data_registro = db.Column(db.DateTime)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    confirmed_at = db.Column(db.DateTime())
    roles = db.relationship('Role', secondary=rolesusers_table,
                            backref=db.backref('Responsavel', lazy='dynamic'))

    def __repr__(self):
        return self.nome

class Evento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), unique=False)
    local = db.Column(db.String(255), unique=False)
    orgao_id = db.Column(db.Integer, db.ForeignKey('orgao.id'))
    orgao = db.relationship('Orgao')
    responsavel_id = db.Column(db.Integer, db.ForeignKey('responsavel.id'))
    responsavel = db.relationship('Responsavel')
    tipo_id = db.Column(db.Integer, db.ForeignKey('tipo.id'))
    tipo = db.relationship('Tipo')
    local = db.Column(db.String(255))
    endereco = db.Column(db.String(255))
    data_inicio = db.Column(db.DateTime)
    data_fim = db.Column(db.DateTime)
    horario = db.Column(db.String(255))
    descricao = db.Column(db.Text)
    link = db.Column(db.String(255))
    cartaz = db.Column(db.String(255))
    tags = db.relationship('Tag', secondary=tagevento_table)

    def __repr__(self):
        return '<Titulo %r>' % self.titulo
    

# Setup Flask-Security
user_datastore = SQLAlchemyUserDatastore(db, Responsavel, Role)
security = Security(app, user_datastore)

# Create customized model view class
class SecureView(ModelView):

    def is_accessible(self):
        #if not current_user.is_active or not current_user.is_authenticated:
        #    return False

        if current_user.has_role('superuser'):
            return True

        return False

    def _handle_view(self, name, **kwargs):
        """
        Override builtin _handle_view in order to redirect users when a view is not accessible.
        """
        if not self.is_accessible():
            if current_user.is_authenticated:
                # permission denied
                abort(403)
            else:
                # login
                return redirect(url_for('security.login', next=request.url))

@app.route("/")
def index():
    return 'hello world'

admin = Admin(app, name='Agenda Publica', template_mode='bootstrap3')
# Add administrative views here
admin.add_view(SecureView(Evento, db.session))
admin.add_view(SecureView(Responsavel, db.session))
admin.add_view(SecureView(Orgao, db.session))
admin.add_view(SecureView(Tipo, db.session))
admin.add_view(SecureView(Tag, db.session))

# Create the Flask-Restless API manager.
manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Evento, methods=['GET'])

@security.context_processor
def security_context_processor():
    return dict(
        admin_base_template=admin.base_template,
        admin_view=admin.index_view,
        h=admin_helpers,
    )

def build_sample_db():
    """
    Populate a small db with some example entries.
    """

    db.drop_all()
    db.create_all()

    with app.app_context():
        user_role = Role(name='user')
        super_user_role = Role(name='superuser')
        db.session.add(user_role)
        db.session.add(super_user_role)
        db.session.commit()

        test_user = user_datastore.create_user(
            nome='Admin',
            email='admin',
            password=encrypt_password('admin'),
            roles=[user_role, super_user_role]
        )
        db.session.commit()
    return

if __name__ == "__main__":   
     # Build a sample db on the fly, if one does not exist yet.
    app_dir = os.path.realpath(os.path.dirname(__file__))
    database_path = os.path.join(app_dir, SETTINGS['DATABASE'])
    if not os.path.exists(database_path):
        build_sample_db()

    app.run(host='0.0.0.0', debug=True)
