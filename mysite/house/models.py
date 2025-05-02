from django.db import models

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
    on = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.name} - {self.house.name}"
        
"""class Zone(models.Model):
    floor = models.IntegerField()
#   room = models.IntegerField()
    name = models.CharField(max_length=255)
    house = models.ForeignKey(House, on_delete=models.CASCADE)
    def __str__(self):
        return self.name"""