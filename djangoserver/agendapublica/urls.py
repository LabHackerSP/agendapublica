from django.conf.urls import url, include
from tastypie.api import Api

from agendapublica.api.resources import EventoResource

evento = EventoResource()

urlpatterns = [
    url(r'^api/', include(evento.urls))
]