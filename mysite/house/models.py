from django.db import models
# Create your models here.
from django.utils import timezone

    
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
    name = models.CharField(max_length=128, blank=True, null=True)
    photo = models.ImageField(upload_to="entity/", blank=True, null=True)
    type = models.CharField(max_length=255, choices=ENTITY_TYPES, blank=True, null=True )
    house = models.ForeignKey(House, on_delete=models.CASCADE,related_name='entities')
    active = models.BooleanField(default=True)
    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)
    def __str__(self):
        return f"{self.name} - {self.house.name}"
    def save(self, *args, **kwargs):
        # On vérifie si l'objet existe déjà
        if self.pk:
            old = Entity.objects.get(pk=self.pk)
            if old.active != self.active:
                # Enregistre dans l'historique
                EntityHistory.objects.create(entity=self, on=self.active)

                if self.active:
                    for flux_stat in self.flux_stats.all():
                        flux_stat.update_flux_value()
                else:
                    for flux_stat in self.flux_stats.all():
                        flux_stat.update_flux_value()  # gère display_value sans toucher à value
                
                #profiles = Profile.objects.filter(house=self.house)
        
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
    photo = models.ImageField(upload_to="newsHouse/")
    content = models.CharField(max_length=256)
    def __str__(self):
        return f"{self.title} de {self.house.name}"


class Incident(models.Model):
    INCIDENTS_TYPES = [
        ('technique', 'Technique'),
        ('budgétaire', 'Budgétaire'),
        ('internet', 'Internet'),
        ('pièce','Pièce')
        # tu peux en ajouter d'autres si besoin
    ]
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="incident")
    description = models.CharField(max_length=256)
    type =  models.CharField(max_length=255, choices=INCIDENTS_TYPES)
    date = models.DateField(default=timezone.now())
    resolved = models.BooleanField(default=False)
    response = models.CharField(max_length=256, null=True,blank=True)
    def __str__(self):
        return f"{self.entity.name} - résolu : {self.resolved} - réponse {self.response}"