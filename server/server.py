from flask import Flask
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
app.config['SECRET_KEY'] = '123456790'


db = SQLAlchemy(app)

class Evento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(80), unique=False)
    local = db.Column(db.String(120), unique=False)

    def __init__(self, titulo = "", local = ""): #O __init__ precisa ser sempre autopopulado para o Flask-Admin nao dar pau
        self.titulo = titulo
        self.local = local

    def __repr__(self):
        return '<Titulo %r>' % self.titulo

admin = Admin(app, name='Agenda Publica', template_mode='bootstrap3')
# Add administrative views here
admin.add_view(ModelView(Evento, db.session))

app.run(debug=True)