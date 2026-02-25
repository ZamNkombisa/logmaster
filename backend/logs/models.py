from django.db import models

class Trip(models.Model):
    driver_name = models.CharField(max_length=100, default="Driver 1")
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    cycle_hours_used = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

class LogEntry(models.Model):
    STATUS_CHOICES = [
        ('OFF', 'Off Duty'),
        ('SB', 'Sleeper Berth'),
        ('D', 'Driving'),
        ('ON', 'On Duty (Not Driving)'),
    ]
    trip = models.ForeignKey(Trip, related_name='entries', on_delete=models.CASCADE)
    status = models.CharField(max_length=3, choices=STATUS_CHOICES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255)
    remarks = models.TextField(blank=True)