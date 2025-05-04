from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(Link)
admin.site.register(FluxStat)
admin.site.register(FluxStatHistory)