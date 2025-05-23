# views.py
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import House, Entity
from log.models import Link, FluxStat
from user.models import User, Profile, RequestSuppression,RequestSuppressionEntity
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
    def put(self, request, user_id, house_id):
        try:
            # Vérifie que le profil existe
            profile = Profile.objects.get(user_id=user_id, house__id=house_id)
            house = profile.house

            serializer = HouseSerializer(house, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Profile.DoesNotExist:
            return Response({"detail": "Profil non trouvé."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"detail": f"Erreur lors de la mise à jour: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        
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
    def delete(self, request, house_id, user_id):
        try:
            house = get_object_or_404(House, id=house_id)
            profile = get_object_or_404(Profile,house=house,user=user_id)
            if profile.isOwner == 1 :
                # Supprimer tous les profils liés à cette maison
                profiles_deleted, _ = Profile.objects.filter(house=house).delete()

                # Supprimer ensuite la maison
                house.delete()
                return Response(
                {"detail": f"La maison et ses {profiles_deleted} profils associés ont été supprimés."},
                status=status.HTTP_204_NO_CONTENT
                )

            else :
                suppression = RequestSuppression.objects.create(house = house, user = user_id)
                return Response(
                {"detail": "Une demande de suppression à été effectuée"},
                status=status.HTTP_204_NO_CONTENT
                )
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class EntityAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, id):
        data = request.data.copy()
        # On récupère la maison liée à ce user via Profile
        
        print(id)
        print(request.user)
        profile = get_object_or_404(Profile,house__id=id, user=request.data.get("user_id"))
        data['house'] = id  # On l'ajoute aux données envoyées
        serializer = EntitySerializer(data=data, partial=True)
        if serializer.is_valid():
            entity = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, id):
        entity = get_object_or_404(Entity, id=id)  # Un seul objet, pas queryset
        previous_state = entity.active  # État avant modificatiactive
        new_state = request.data.get("active")
        user = request.data.get("user_id")
        # Vérifie si le champ "on" a changé
        if new_state is not None and str(previous_state).lower() != str(new_state).lower():
            house = entity.house
            # Tu peux utiliser `get()` ici car chaque user n'a qu'un seul profile par house
            
            profile = get_object_or_404(Profile, user__id=user, house=house)
            # Exemple de logique : +10 points si on l'active, -10 si on le désactive
            
            if new_state in [True, 'true', 'True', 1, '1']:
                profile.points += 10
                profile.save()
        serializer = EntitySerializer(entity, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, id):
        try:
            user = request.data.get("user")
            profile = get_object_or_404(Profile,house=id.house.id,user=user)
            entity = get_object_or_404(Entity, id=id)
            if profile.isOwner == 1 :
                
                # Supprimer ensuite l'objet
                entity.delete()
                return Response(
                {"detail": "L'objet a été supprimé."},
                status=status.HTTP_204_NO_CONTENT
                )

            else :
                incident = RequestSuppressionEntity.objects.create(entity = id, user=user)
                return Response(
                {"detail": "Une demande de suppression à été effectuée"},
                status=status.HTTP_204_NO_CONTENT
                )
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LinkAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LinkSerializer(data=request.data)
        if serializer.is_valid():
            link = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request):
        try:
            link = request.data.get["id"]
            
            link = get_object_or_404(Link, id=link)
            link.delete()
            return Response(
                {"detail": "Le lien a été supprimé."},
                status=status.HTTP_204_NO_CONTENT
                )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        


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
       
        #PUT: Mettre à jour la maison d'un utilisateur
     
        house = House.objects.filter(profile__user__id=user_id)
        serializer = HouseSerializer(house, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
      
        #DELETE: Supprimer la maison d'un utilisateur
    
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
        
        #PUT: Modifier une entité d'un utilisateur
        
        entity = get_object_or_404(Entity, house__profile__user__id=user_id)

        serializer = EntitySerializer(entity, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
     
        #DELETE: Supprimer une entité d'un utilisateur
        
        entity = get_object_or_404(Entity, house__profile__user__id=user_id)

        entity.delete()
        return Response({"message": "Entity deleted."}, status=status.HTTP_204_NO_CONTENT)"""