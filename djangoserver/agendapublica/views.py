from django.shortcuts import render
from restless.modelviews import ListEndpoint
from agendapublica.models import Evento

class EventoApi(ListEndpoint):
   def get_query_set(self, request):
   	data_inicio = request.GET['data_inicio']
	data_fim = request.GET['data_fim']
	return Evento.objects.filter(data_inicio__range=[data_inicio,data_fim])