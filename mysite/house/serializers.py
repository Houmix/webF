# serializers.py
from rest_framework import serializers
from .models import House, Entity, City
from log.models import  Link, FluxStat
from user.models import Profile

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['name', 'coordX', 'coordY']


class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = ['id', 'source', 'target', 'type', 'value']


class FluxStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = FluxStat
        fields = ['flux_type', 'value', 'entity']

class EntitySerializer(serializers.ModelSerializer):
    flux_stats = FluxStatSerializer(many=True, read_only=True)
    links = LinkSerializer(source='outgoing_links', many=True, read_only=True)

    class Meta:
        model = Entity
        fields = ['id', 'type','name', 'photo','active','x','y' 'flux_stats', 'links']


"""class HouseSerializer(serializers.ModelSerializer):
    entities = EntitySerializer(many=True, read_only=True)

    class Meta:
        model = House
        fields = ['id', 'name','photo',"type", 'address', 'city', 'coordX', 'coordY', 'entities']
"""
# serializers.py
class ProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id')
    user_name = serializers.CharField(source='user.username')
    role = serializers.CharField()

    class Meta:
        model = Profile
        fields = ['user_id', 'user_name', 'role','access',"points","lvl"]

class HouseSerializer(serializers.ModelSerializer):
    entities = EntitySerializer(many=True, read_only=True)
    profiles = ProfileSerializer(source='profile_set', many=True, read_only=True)

    class Meta:
        model = House
        fields = ['id', 'name', 'photo', 'type', 'address', 'city', 'coordX', 'coordY', 'entities', 'profiles']


