from tastypie import fields
from tastypie.resources import ModelResource, Resource
from agendapublica.models import Evento


class EventoResource(ModelResource):
	limit = 0
    orgao = fields.CharField(attribute="orgao")
    tipo = fields.CharField(attribute="tipo")

    class Meta:
        resource_name = 'evento'
        queryset = Evento.objects.all()
        allowed_methods = ['get']

        filtering = {
        	'data_inicio' : ['gte'],
        	'data_fim' : ['lte']
        }

    def determine_format(self, request):
        return 'application/json'