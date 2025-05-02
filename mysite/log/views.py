# views.py
from rest_framework import viewsets
from rest_framework.response import Response
from .models import House
from .serializers import HouseWithPeopleSerializer

class HouseWithPeopleViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    serializer_class = HouseWithPeopleSerializer

    def get(self, request, pk=None):
        house = self.get_object()
        serializer = self.get_serializer(house)
        return Response(serializer.data)


"""from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import FluxStat, Entity
from user.models import Profile
from .serializers import FluxStatSerializer, LinkSerializer

class FluxStatAPIView(APIView):
    def get(self, request, user_id):
    
        #GET: Récupérer tous les flux stats des entités liées à un utilisateur via Profile
    
        profiles = Profile.objects.filter(user_id=user_id)  # Récupérer tous les profils de l'utilisateur
        entities = Entity.objects.filter(house__in=[profile.house for profile in profiles])  # Entités liées aux maisons du user
        flux_stats = FluxStat.objects.filter(entity__in=entities)  # Flux stats des entités
        serializer = FluxStatSerializer(flux_stats, many=True)
        return Response(serializer.data)

    def post(self, request, user_id):
       
        #POST: Créer une flux stat pour une entité liée à un utilisateur
  
        serializer = FluxStatSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, user_id):
      
        #PUT: Mettre à jour une flux stat d'un utilisateur (id dans body)
       
        flux_stat_id = request.data.get("id")
        flux_stat = get_object_or_404(FluxStat, id=flux_stat_id, entity__house__in=[profile.house for profile in Profile.objects.filter(user_id=user_id)])
        serializer = FluxStatSerializer(flux_stat, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
      
        #DELETE: Supprimer une flux stat pour un utilisateur
     
        flux_stat_id = request.data.get("id")
        flux_stat = get_object_or_404(FluxStat, id=flux_stat_id, entity__house__in=[profile.house for profile in Profile.objects.filter(user_id=user_id)])
        flux_stat.delete()
        return Response({"message": "FluxStat deleted"}, status=status.HTTP_204_NO_CONTENT)


class LinkAPIView(APIView):
    def get(self, request, user_id):
   
        #GET: Récupérer tous les liens des entités liées à un utilisateur via Profile
   
        profiles = Profile.objects.filter(user_id=user_id)  # Récupérer tous les profils de l'utilisateur
        entities = Entity.objects.filter(house__in=[profile.house for profile in profiles])  # Entités liées aux maisons du user
        links = Link.objects.filter(source__in=entities)  # Lien sortant des entités
        serializer = LinkSerializer(links, many=True)
        return Response(serializer.data)

    def post(self, request, user_id):
      
        #POST: Créer un lien pour une entité d'un utilisateur
     
        serializer = LinkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, user_id):
     
        #PUT: Mettre à jour un lien pour un utilisateur (id dans body)
       
        link_id = request.data.get("id")
        link = get_object_or_404(Link, id=link_id, source__house__in=[profile.house for profile in Profile.objects.filter(user_id=user_id)])
        serializer = LinkSerializer(link, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
    
        #DELETE: Supprimer un lien pour un utilisateur
      
        link_id = request.data.get("id")
        link = get_object_or_404(Link, id=link_id, source__house__in=[profile.house for profile in Profile.objects.filter(user_id=user_id)])
        link.delete()
        return Response({"message": "Link deleted"}, status=status.HTTP_204_NO_CONTENT)"""