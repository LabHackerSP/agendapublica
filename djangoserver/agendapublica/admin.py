from django.contrib import admin

from agendapublica.models import Evento, Orgao, Responsavel, Tipo, Tag

admin.site.register(Evento)
admin.site.register(Orgao)
admin.site.register(Responsavel)
admin.site.register(Tipo)
admin.site.register(Tag)
