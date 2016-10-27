from django.conf.urls import *
from tastypie.api import Api

from django.conf import settings
from django.conf.urls.static import static

from agendapublica.api.resources import EventoResource, TagResource

api = Api(api_name='v1')
api.register(EventoResource())
api.register(TagResource())

urlpatterns = [
    url(r'^api/', include(api.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
