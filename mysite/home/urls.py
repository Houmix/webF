
from django.urls import path, include
from .views import Homepage, contact, house_view

from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path("", Homepage, name="Home"),
    path("contact",contact, name="Contact"),
    path("graph/<int:house_id>/",house_view, name="graph"),
    path("user/",include("user.urls"))
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)