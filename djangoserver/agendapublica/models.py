from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
 
class Tag(models.Model):
    title = models.CharField()

    def __unicode__(self):
        return self.title

class Orgao(models.Model):
    nome = models.CharField()

    def __unicode__(self):
        return self.nome

class Tipo(models.Model):
    tipo = models.CharField()

    def __unicode__(self):
        return self.tipo

class Responsavel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # onde isso é usado??
    department = models.CharField(max_length=100)
    orgao = models.ForeignKey(Orgao)

    def __unicode__(self):
        return self.user.username

class Evento(models.Model):
    titulo = models.CharField()
    orgao = models.ForeignKey(Orgao, on_delete=models.CASCADE)
    responsavel = models.ForeignKey(Responsavel, on_delete=models.CASCADE)
    tipo = models.ForeignKey(Tipo)
    local = models.CharField()
    endereco = models.CharField()
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    descricao = models.TextField()
    link = models.URLField(blank=True)
    cartaz = models.ImageField(blank=True)
    tags = models.ManyToManyField('Tag')

    def __unicode__(self):
        return self.titulo
