# views.py
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import House, Entity 
from log.models import Link, FluxStat
from user.models import User, Profile
from .serializers import HouseSerializer, EntitySerializer, LinkSerializer, FluxStatSerializer,ProfileSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny

class HouseDetailsAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, user_id, house_id):
        try:
            # Récupérer le profil de l'utilisateur
            profile = Profile.objects.get(user_id=user_id, house__id=house_id)
            house = profile.house  # Maison associée au profil

            # Récupérer les entités et les liens associés à la maison
            entities = Entity.objects.filter(house=house)
            links = Link.objects.filter(source__house=house) | Link.objects.filter(target__house=house)
            flux_stats = FluxStat.objects.filter(entity__house=house)

            # Sérialiser la maison, entités, liens, et flux
            house_data = HouseSerializer(house, context={'request': request}).data
            house_data['entities'] = EntitySerializer(entities, many=True).data
            #house_data['links'] = LinkSerializer(links, many=True).data
            #house_data['flux_stats'] = FluxStatSerializer(flux_stats, many=True).data

            return Response(house_data)

        except Profile.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)


class PeopleInHouseAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, house_id):
        # Vérifie si la maison existe
        house = get_object_or_404(House, id=house_id)

        # Récupère tous les profils liés à cette maison
        profiles = Profile.objects.filter(house=house).select_related('user')

        # Format personnalisé de la réponse
        occupants = []
        for profile in profiles:
            user = profile.user
            occupants.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "role": profile.role,
                "access":profile.access,
                "permissions": {
                    "view": True,
                    "edit": profile.role in ["admin", "expert"]
                },
                "isOwner": profile.isOwner,#profile.role == "admin"
                "points":profile.points,
                "lvl":profile.lvl
            })

        return Response(occupants, status=status.HTTP_200_OK)

class HousesAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, user_id):
        data = request.data.copy()
        user = get_object_or_404(User, id=user_id)
        serializer = HouseSerializer(data=data, partial=True)
        if serializer.is_valid():
            # Création de la maison
            house = serializer.save()
            # Création du profil pour lier l'utilisateur à la maison
            Profile.objects.create(
                user=user,
                house=house,
                role='admin',  # ou 'propriétaire' selon ta logique
                has_paid=True  # ou False si par défaut il n'a pas payé
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self, request, user_id):
        # Récupérer l'utilisateur
        user = get_object_or_404(User, id=user_id)

        # Récupérer toutes les maisons liées à cet utilisateur via Profile
        profiles = Profile.objects.filter(user=user).select_related('house')
        houses = [profile.house for profile in profiles]

        # Sérialisation des maisons
        serializer = HouseSerializer(houses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
class DeleteHouseAPIView(APIView):
    permission_classes = [AllowAny]
    def delete(self, request, house_id):
        try:
            house = get_object_or_404(House, id=house_id)

            # Supprimer tous les profils liés à cette maison
            profiles_deleted, _ = Profile.objects.filter(house=house).delete()

            # Supprimer ensuite la maison
            house.delete()

            return Response(
                {"detail": f"La maison et ses {profiles_deleted} profils associés ont été supprimés."},
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class EntityAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, house_id):
        data = request.data.copy()
        # On récupère la maison liée à ce user via Profile
        profile = get_object_or_404(Profile,house__id=house_id)
        data['house'] = profile.house.id  # On l'ajoute aux données envoyées
        serializer = EntitySerializer(data=data)
        if serializer.is_valid():
            entity = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, entity_id):
        entity = get_object_or_404(Entity, id=entity_id)  # Un seul objet, pas queryset
        previous_state = entity.on  # État avant modification
        new_state = request.data.get("on")
        # Vérifie si le champ "on" a changé
        if new_state is not None and str(previous_state).lower() != str(new_state).lower():
            house = entity.house
            # Tu peux utiliser `get()` ici car chaque user n'a qu'un seul profile par house
            profile = get_object_or_404(Profile, user=request.user, house=house)
            # Exemple de logique : +10 points si on l'active, -10 si on le désactive
            if new_state in [True, 'true', 'True', 1, '1']:
                profile.points += 10
                profile.save()
        serializer = EntitySerializer(entity, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LinkAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LinkSerializer(data=request.data)
        if serializer.is_valid():
            link = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileAPIView(APIView):
    permission_classes = [AllowAny]
    def put(self, request, user_id, house_id):
        profile = get_object_or_404(Profile, user=user_id, house=house_id)  # Get the profile or 404
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, user_id, house_id):
        profile = get_object_or_404(Profile, user=user_id, house=house_id)  # Get the profile or 404
        try:
            profile.delete()
            return Response({"detail": "Suppression effectuée"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": f"Erreur lors de la suppression: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
"""
    def get(self, request, user_id):
   
        #GET: Récupérer la maison d'un utilisateur

        house = House.objects.filter(profile__user__id=user_id)
        serializer = HouseSerializer(house)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, user_id):
       
        #PUT: Mettre à jour la maison d’un utilisateur
     
        house = House.objects.filter(profile__user__id=user_id)
        serializer = HouseSerializer(house, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
      
        #DELETE: Supprimer la maison d’un utilisateur
    
        house = House.objects.filter(profile__user__id=user_id)
        house.delete()
        return Response({"message": "House deleted."}, status=status.HTTP_204_NO_CONTENT)
    

class EntityDetailAPIView(APIView):
    def get(self, request, user_id):
   
        #GET: Récupérer une entité liée à un utilisateur spécifique

        entity = get_object_or_404(Entity, house__profile__user__id=user_id)

        serializer = EntitySerializer(entity)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, user_id):
      
        #POST: Créer une entité pour un utilisateur
   
        data = request.data.copy()
        user = get_object_or_404(User, id=user_id)
        data['user'] = user.id
        serializer = EntitySerializer(data=data)
        if serializer.is_valid():
            serializer.save(house=user.house)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, user_id):
        
        #PUT: Modifier une entité d’un utilisateur
        
        entity = get_object_or_404(Entity, house__profile__user__id=user_id)

        serializer = EntitySerializer(entity, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
     
        #DELETE: Supprimer une entité d’un utilisateur
        
        entity = get_object_or_404(Entity, house__profile__user__id=user_id)

        entity.delete()
        return Response({"message": "Entity deleted."}, status=status.HTTP_204_NO_CONTENT)"""