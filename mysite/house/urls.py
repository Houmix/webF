from django.urls import path
from .views import HouseDetailsAPIView, PeopleInHouseAPIView, HousesAPIView, EntityAPIView,LinkAPIView, ProfileAPIView,DeleteHouseAPIView

urlpatterns = [
    
    path('house/<int:user_id>/', HousesAPIView.as_view(), name='house-get_create'), #Toutes les maisons d'un utilisateurs  Donne maison, entité et les liens detoutes les maisons d'un utilisateur
    path('deleteHouse/<int:house_id>/', DeleteHouseAPIView.as_view(), name='house-delete'), #Suppriemr le maison avec l'id en parametre
    path('houseDetails/<int:user_id>/<int:house_id>/', HouseDetailsAPIView.as_view(), name='house-details'),#Le details d'une maison cad entité et liens


    path('peopleInHouse/<int:house_id>/', PeopleInHouseAPIView.as_view(), name='house-people'),#Les gens qui ont un profile avec cette maison (access ou non)
    
    path('entity/<int:house_id>/', EntityAPIView.as_view(), name='entity-create'),#créer une entité
    path('entity/<int:entity_id>/', EntityAPIView.as_view(), name='entity-put'),#mettre a jour les infos d'une entité
    path('link/', LinkAPIView.as_view(), name='link-create'),#créer un lien entre 2 entité
    path('profile/<int:user_id>/<int:house_id>/',ProfileAPIView.as_view(),name='profile-put')#supprimer ou accepter l'acces d'un utilisateur à une maison
]