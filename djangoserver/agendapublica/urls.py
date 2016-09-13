from django.conf.urls import url, include
from tastypie.api import Api

from agendapublica.api.resources import EventoResource, TagResource

api = Api(api_name='v1')
api.register(EventoResource())
api.register(TagResource())

urlpatterns = [
    url(r'^api/', include(api.urls))
]