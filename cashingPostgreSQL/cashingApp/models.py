from django.db import models

class users(models.Model):
    userId = models.CharField(max_length=20)
    userScore = models.IntegerField()
    firstName = models.CharField(max_length=100)
    secondName = models.CharField(max_length=100)
    rang = models.CharField(max_length=15)

# Create your models here.
