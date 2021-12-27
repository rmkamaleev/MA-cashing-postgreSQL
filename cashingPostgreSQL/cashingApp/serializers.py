from rest_framework import serializers
from .models import UsersNew

class UsersNewSerializer(serializers.ModelSerializer):
    class Meta:
        model=UsersNew 
        fields=('userId','userScore','firstName','secondName','rang')