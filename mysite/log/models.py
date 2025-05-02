from django.db import models
from house.models import Entity

class Link(models.Model):
    LINK_TYPES = [
        ('electricity', 'Électricité'),
        ('water', 'Eau'),
        ('internet', 'Internet'),
    ]
    source = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="outgoing_links")
    target = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="incoming_links")
    type = models.CharField(max_length=50, choices=LINK_TYPES)
    value = models.IntegerField(default=0)
    def __str__(self):
        return f"De {self.source.name} vers {self.target.name} - {self.source.house.name} {self.type}"
class FluxStat(models.Model):
    FLUX_TYPES = [
        ('electricity', 'Électricité'),
        ('water', 'Eau'),
        ('internet', 'Internet'),
    ]
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="flux_stats")
    flux_type = models.CharField(max_length=50, choices=FLUX_TYPES)
    value = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.entity.name} {self.entity.house.name} {self.flux_type}"
