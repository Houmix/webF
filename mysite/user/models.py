from django.db import models
from django.contrib.auth.hashers import make_password
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import AbstractUser
from house.models import House
from house.models import Entity
class User(AbstractUser):
    photo = models.ImageField(upload_to='profile_photo/', blank=True, null=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    password = models.CharField(max_length=255)  # Stockage sécurisé
    sexe = models.CharField(
        max_length=20,
        choices=[
            ('Homme', 'Homme'),
            ('Femme', 'Femme')
        ]
    )
    birth_date = models.DateField(null=True, blank=True)
    
    
    def save(self, *args, **kwargs):
        """ Hash automatiquement le mot de passe avant de sauvegarder. """
        if not self.password.startswith("pbkdf2_sha256$"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    house = models.ForeignKey(House, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)
    lvl = models.IntegerField(default=1)
    has_paid = models.BooleanField(default=False)
    isOwner = models.BooleanField(default=False)
    access = models.BooleanField(default=False)
    role = models.CharField(
        max_length=20,
        choices=[
            #("visiteur","Visiteur")
            ('simple', 'Simple'),
            ('complexe', 'Complexe'),
            ('admin', 'Admin'),
        ],
        default='simple'
    )

    def __str__(self):
        return f"{self.user.username} - {self.role} - {self.house.name} - {self.access}"
    def update_role(self):
        if self.point<100 :
            self.role = 'simple'
        elif self.point>=100 and self.point<250:
            self.role = 'complexe'
        else:
            self.role = 'admin'

class RequestSuppression(models.Model):
    house = models.ForeignKey(House,on_delete=models.CASCADE, related_name="house_suppression")
    user = models.ForeignKey(User,on_delete=models.CASCADE, related_name="user")
    response = models.BooleanField(default=False)
    def str(self):
        return f"{self.user.username} - {self.house.name}"
class RequestSuppressionEntity(models.Model):
    entity = models.ForeignKey(Entity,on_delete=models.CASCADE)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    response = models.BooleanField(default=False)
    def str(self):
        return f"{self.user.username} - {self.entity.name} -{self.entity.house.name}"