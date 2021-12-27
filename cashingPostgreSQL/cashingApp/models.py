from django.db import models

class UsersNew(models.Model):
    userId = models.AutoField(primary_key=True)
    userScore = models.IntegerField()
    firstName = models.CharField(max_length=100)
    secondName = models.CharField(max_length=100)
    rang = models.CharField(max_length=15)

# Create your models here.
