from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
 
class Tag(models.Model):
    title = models.CharField(max_length=250, blank=True)

    def __unicode__(self):
        return self.title

class Orgao(models.Model):
    nome = models.TextField()

    def __unicode__(self):
        return self.nome

class Tipo(models.Model):
    tipo = models.TextField()

    def __unicode__(self):
        return self.tipo

class Responsavel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = models.CharField(max_length=100)
    orgao = models.ForeignKey(Orgao)

    def __unicode__(self):
        return self.user.username

class Evento(models.Model):
    titulo = models.TextField()
    local = models.TextField()
    orgao = models.ForeignKey(Orgao, on_delete=models.CASCADE)
    responsavel = models.ForeignKey(Responsavel, on_delete=models.CASCADE)
    tipo = models.ForeignKey(Tipo)
    local = models.TextField()
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    descricao = models.TextField()
    link = models.URLField()
    cartaz = models.ImageField()
    tags = models.ManyToManyField('Tag')

    def __unicode__(self):
        return self.titulo
