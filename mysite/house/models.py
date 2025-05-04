from django.db import models
from django.utils import timezone
# Create your models here.
class City(models.Model):
    name = models.CharField(max_length=255)
    coordX = models.FloatField()
    coordY = models.FloatField()
    def __str__(self):
        return self.name

    
class House(models.Model):
    type = models.CharField(
        max_length=20,
        choices=[
            ('Maison','Maison'),
            ('Entreprise', 'Entreprise'),
            ('Ecole', 'Ecole'),
            ('Mairie', 'Mairie'),
            ('Gare','Gare')
        ],
        default='Maison'
    )
    name = models.CharField(max_length=128)
    photo = models.ImageField(upload_to="house/")
    address = models.CharField(max_length=255)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="houses")
    coordX = models.FloatField()
    coordY = models.FloatField()
    def __str__(self):
        return self.name
    



class Entity(models.Model):
    ENTITY_TYPES = [
        ('electricity', 'Électricité'),
        ('water', 'Eau'),
        ('internet', 'Internet'),
        # tu peux en ajouter d'autres si besoin
    ]
    name = models.CharField(max_length=128)
    photo = models.ImageField(upload_to="entity/")
    type = models.CharField(max_length=255, choices=ENTITY_TYPES)
    house = models.ForeignKey(House, on_delete=models.CASCADE,related_name='entities')
    active = models.BooleanField(default=True)
    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)
    def __str__(self):
        return f"{self.name} - {self.house.name}"
    def save(self, *args, **kwargs):
        # On vérifie si l'objet existe déjà
        print("lalalla")
        if self.pk:
            old = Entity.objects.get(pk=self.pk)
            if old.active != self.active:
                # Enregistre dans l'historique
                EntityHistory.objects.create(entity=self, active=self.active)

                if self.active:
                    for flux_stat in self.flux_stats.all():
                        flux_stat.update_flux_value()
                else:
                    for flux_stat in self.flux_stats.all():
                        flux_stat.update_flux_value()  # gère display_value sans toucher à value
        
        super().save(*args, **kwargs)

                
class EntityHistory(models.Model):
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="history")
    timestamp = models.DateTimeField(auto_now_add=True)
    on = models.BooleanField(default=False)  # L'état 'active' au moment de l'enregistrement

    def __str__(self):
        return f"{self.entity.name} - {'ON' if self.on else 'OFF'} - {self.timestamp}"
    
class News(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name="news")
    title = models.CharField(max_length=128)
    date = models.DateField(default=timezone.now)
    photo = models.ImageField(upload_to="news/")
    content = models.CharField(max_length=256)