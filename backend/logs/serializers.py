from rest_framework import serializers
from .models import Trip, LogEntry

class LogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEntry
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    # Change 'entries' to match the 'related_name' in models.py
    entries = LogEntrySerializer(many=True, read_only=True) 

    class Meta:
        model = Trip
        fields = ['id', 'driver_name', 'current_location', 'pickup_location', 'dropoff_location', 'cycle_hours_used', 'entries']