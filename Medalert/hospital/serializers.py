from rest_framework import serializers
from .models import HospitalAlert

class HospitalAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalAlert
        fields = '__all__'
