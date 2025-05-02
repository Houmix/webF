# serializers.py
from user.models import House, Profile, User
from rest_framework import serializers

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['user', 'role', 'permissions', 'is_owner']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name']

class HouseWithPeopleSerializer(serializers.ModelSerializer):
    people_in_it = ProfileSerializer(source='profile_set', many=True, read_only=True)

    class Meta:
        model = House
        fields = ['id', 'photo', 'name', 'people_in_it']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['name'] = instance.address  # Assuming "name" field is equivalent to address
        return representation




"""from rest_framework import serializers
from .models import Link, FluxStat
class FluxStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = FluxStat
        fields = ['flux_type', 'value','entity']


class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = ['id', 'target', 'type','source']"""