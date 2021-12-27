from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse

from .models import UsersNew
from .serializers import UsersNewSerializer

from django.core.files.storage import default_storage

# Create your views here.

@csrf_exempt
def usersNewApi(request,id=0):
    if request.method=='GET':
        users = UsersNew.objects.all()
        users_serializer=UsersNewSerializer(users,many=True)
        return JsonResponse(users_serializer.data,safe=False)