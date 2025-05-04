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
    display_value = models.CharField(max_length=50, default="0")

    def __str__(self):
        return f"{self.entity.name} {self.entity.house.name} {self.flux_type}"
    @property
    def effective_value(self):
        return self.value if self.entity.active else "0"
    def update_flux_value(self):
        """Met à jour la consommation du flux et met à jour display_value + historique."""
        if self.entity.active:
            # L'entité est active → la consommation réelle s'affiche
            self.display_value = self.value
        else:
            # L'entité est désactivée → l'affichage doit être 0, mais on garde self.value intact
            self.display_value = "0"

        self.save()

        # Enregistrer l'historique avec la valeur affichée
        FluxStatHistory.objects.create(
            entity=self.entity,
            flux_type=self.flux_type,
            value=self.display_value
        )


class FluxStatHistory(models.Model):
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="flux_history")
    flux_type = models.CharField(max_length=50, choices=FluxStat.FLUX_TYPES)
    value = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)  # Enregistrement de la date du changement

    def __str__(self):
        return f"{self.entity.name} {self.flux_type} - {self.value} at {self.timestamp}"