from django.db import models
from django.shortcuts import render
# Create your models here.
from django.utils import timezone

class FAQ(models.Model):
    title = models.CharField(max_length=128)
    question = models.CharField(max_length=128)
    answer = models.CharField(max_length=256)

class News(models.Model):
    title = models.CharField(max_length=128)
    date = models.DateField(default=timezone.now)
    photo = models.ImageField(upload_to="news/")
    content = models.CharField(max_length=256)