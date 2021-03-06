from django.contrib import admin

from agendapublica.models import Evento, Orgao, Responsavel, Tipo, Tag

from django.forms import ModelForm, Textarea, TextInput, RadioSelect,CheckboxSelectMultiple

class EventoForm(ModelForm):
    class Meta:
        model = Evento
        fields = ('titulo', 'orgao', 'responsavel', 'tipo','local','endereco',
         'data_inicio', 'data_fim','descricao','link','cartaz','tags')
        widgets = {
            'titulo': TextInput(),
            'tipo' : RadioSelect(),
            'local' : TextInput(),
            'endereco' : TextInput(),
            'tags' : CheckboxSelectMultiple()
        }

class EventoAdmin(admin.ModelAdmin):
    form = EventoForm
    save_as = True
    list_display = ('titulo', 'data_inicio')

admin.site.register(Evento, EventoAdmin)
admin.site.register(Orgao)
admin.site.register(Responsavel)
admin.site.register(Tipo)
admin.site.register(Tag)
