from tastypie import fields
from tastypie.resources import ModelResource, Resource, ALL_WITH_RELATIONS
from agendapublica.models import Evento, Tag

class TagResource(ModelResource):
    eventos = fields.ToManyField('agendapublica.api.resources.EventoResource', 'evento_set')

    class Meta:
        limit = 0
        resource_name = 'tag'
        queryset = Tag.objects.all()
    def determine_format(self, request):
        return 'application/json'

class EventoResource(ModelResource):
    orgao = fields.CharField(attribute="orgao")
    tipo = fields.CharField(attribute="tipo")
    tags = fields.ToManyField('agendapublica.api.resources.TagResource', 'tags', full=True)

    class Meta:
        limit = 0
        max_limit = 0
        resource_name = 'evento'
        queryset = Evento.objects.all()
        allowed_methods = ['get']
        ordering = ['-descricao']

        filtering = {
            'data_inicio' : ['gte','lte'],
            'data_fim' : ['lte','gte'],
            'tags' : ALL_WITH_RELATIONS
        }

    def determine_format(self, request):
        return 'application/json'
