# -*- coding: utf-8 -*-
from flask import Flask
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_sqlalchemy import SQLAlchemy
import flask.ext.restless
from flask.ext.cors import CORS
from datetime import datetime


app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
app.config['SQLALCHEMY_ECHO'] = True
app.config['SECRET_KEY'] = '123456790'


db = SQLAlchemy(app)

tagevento_table = db.Table('tag_evento',
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id')),
    db.Column('evento_id', db.Integer, db.ForeignKey('evento.id'))
)

class Orgao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80))

    def __repr__(self):
        return self.nome

class Tipo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(80))
    
    def __repr__(self):
        return self.tipo

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(80))

    def __repr__(self):
        return self.tag

class Responsavel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80))
    orgao_id = db.Column(db.Integer, db.ForeignKey('orgao.id'))
    orgao = db.relationship('Orgao')
    email = db.Column(db.String(80), unique=True)
    tel = db.Column(db.String(80))
    data_registro = db.Column(db.DateTime)
    role = db.Column(db.Integer)

    def __repr__(self):
        return self.nome

class Evento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(80), unique=False)
    local = db.Column(db.String(120), unique=False)
    orgao_id = db.Column(db.Integer, db.ForeignKey('orgao.id'))
    orgao = db.relationship('Orgao')
    responsavel_id = db.Column(db.Integer, db.ForeignKey('responsavel.id'))
    responsavel = db.relationship('Responsavel')
    tipo_id = db.Column(db.Integer, db.ForeignKey('tipo.id'))
    tipo = db.relationship('Tipo')
    local = db.Column(db.String(120))
    endereco = db.Column(db.String(120))
    data_inicio = db.Column(db.DateTime)
    data_fim = db.Column(db.DateTime)
    horario = db.Column(db.String(80))
    descricao = db.Column(db.Text)
    link = db.Column(db.String(120))
    cartaz = db.Column(db.String(120))
    tags = db.relationship('Tag', secondary=tagevento_table)

    def __repr__(self):
        return '<Titulo %r>' % self.titulo
    

def reiniciar():
    db.drop_all()
    db.create_all()
    db.session.commit()

if __name__ == "__main__":   
    admin = Admin(app, name='Agenda Publica', template_mode='bootstrap3')
    # Add administrative views here
    admin.add_view(ModelView(Evento, db.session))
    admin.add_view(ModelView(Responsavel, db.session))
    admin.add_view(ModelView(Orgao, db.session))
    admin.add_view(ModelView(Tipo, db.session))
    admin.add_view(ModelView(Tag, db.session))

    # Create the Flask-Restless API manager.
    manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

    # Create API endpoints, which will be available at /api/<tablename> by
    # default. Allowed HTTP methods can be specified as well.
    manager.create_api(Evento, methods=['GET'])

    app.run(debug=True)
