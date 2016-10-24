from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from django.utils.encoding import python_2_unicode_compatible
 
class Tag(models.Model):
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class Orgao(models.Model):
    nome = models.CharField(max_length=255)

    def __str__(self):
        return self.nome

class Tipo(models.Model):
    tipo = models.CharField(max_length=255)

    def __str__(self):
        return self.tipo

class Responsavel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # onde isso é usado??
    department = models.CharField(max_length=100)
    orgao = models.ForeignKey(Orgao)

    def __str__(self):
        return self.user.username

class Evento(models.Model):
    titulo = models.CharField(max_length=255)
    orgao = models.ForeignKey(Orgao, on_delete=models.CASCADE)
    responsavel = models.ForeignKey(Responsavel, on_delete=models.CASCADE)
    tipo = models.ForeignKey(Tipo)
    local = models.TextField()
    endereco = models.TextField()
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    descricao = models.TextField()
    link = models.URLField(blank=True)
    cartaz = models.ImageField(blank=True)
    tags = models.ManyToManyField('Tag', blank=True)

    def __str__(self):
        return self.titulo
