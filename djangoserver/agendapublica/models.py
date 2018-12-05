from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from django.utils.encoding import python_2_unicode_compatible
from django.utils.safestring import mark_safe
 
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
    orgao = models.ForeignKey(Orgao, on_delete=models.PROTECT)

    def __str__(self):
        return self.user.username

CONTENT_HELP_TEXT = ' '.join(['Here is some multi-line help',
                              'which is a long string so put',
                              'into a list which is then joined',
                              'with spaces. I can do fun things',
                              'like have <strong>bold</strong>',
                              'and some line breaks.<br/>',
                              'which is a long string so put',
                              'into a list which is then joined',
                              'with spaces. I can do fun things',
                              'like have <strong>bold</strong>'])

class Evento(models.Model):
    titulo = models.CharField(max_length=255, 
                              help_text="Nome do evento")
    orgao = models.ForeignKey(Orgao, 
                              on_delete=models.CASCADE, 
                              help_text="Orgão governamental organizador")
    responsavel = models.ForeignKey(Responsavel,
                                    on_delete=models.CASCADE, 
                                    help_text=" Pessoa responsável por adicionar o evento")
    tipo = models.ForeignKey(Tipo,
												     on_delete=models.PROTECT,
    												 help_text="<strong>Trabalho Legislativo:</strong>  Atividades do dia a dia da \
                                            Câmara Municipal que permitem a participação cidadã para fiscalização dos vereadores.\
                                            <i><strong>Exemplos:</strong> Reunião da Comissão, Sessão Plenária, CPI, Frente Parlamentar.</i><br/>\
                                            <strong>Conselhos / Fórum:</strong> São reuniões temáticas que visam garantir a participação \
                                            e o controle social das políticas públicas. \
                                            <i><strong>Exemplos:</strong> Plenária, Reunião.</i><br/>\
                                            <strong>Audiência Pública:</strong> É uma reunião, chamada pelo órgão competente ou em conjunto\
                                             com entidades da sociedade civil, que tem por objetivo apresentar um tema \
                                             e dar a palavra aos cidadãos presentes para se manifestarem sobre o assunto.<br/>\
                                            <strong>Consulta Pública:</strong>  E uma consulta online para colher contribuições \
                                            da sociedade civil sobre as políticas e instrumentos legais que orientam as ações públicas de cada órgão.<br/>\
                                            <strong>Diálogos Sociais: </strong>São reuniões informais e não institucionalizadas  entre o poder público,\
                                            os movimentos sociais, as organizações da sociedade civil e demais cidadãos interessados.\
                                            <i><strong>Exemplos: </strong>Café Hacker, Reunião com Sindicato.</i><br/>\
                                            <strong>Pregão / Licitação: </strong> Processo de escolha de contratos públicos que \
                                            qualquer cidadão pode acompanhar.\
                                            <i><strong>Exemplos: </strong> Sessão Pública do Pregão Eletrônico</i><br/>")
                             
    local = models.TextField( help_text="Nome do local onde o evento será realizado")
    endereco = models.TextField(help_text="Endereço do local")
    data_inicio = models.DateTimeField(help_text="Data e horário de início do evento")
    data_fim = models.DateTimeField(help_text="Data e horário de final do evento.<b> Se inexistente, colocar data de horário de início</b>")
    descricao = models.TextField(help_text="Breve descrição do evento")
    link = models.URLField(blank=True, help_text="Link para o site do evento ou para a agenda oficial em qual ele aparece")
    cartaz = models.ImageField(blank=True, help_text="Arquivo da imagem oficial do evento")
    tags = models.ManyToManyField('Tag', blank=True, help_text="Assuntos relacionados com o evento")

    def __str__(self):
        return self.titulo
