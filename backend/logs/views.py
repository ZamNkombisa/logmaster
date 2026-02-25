from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import generate_log_itinerary
from .models import Trip, LogEntry
from .serializers import TripSerializer
from datetime import datetime

class CreateTripView(APIView):
    def post(self, request):
        try:
            # Use .get() with defaults to prevent crashing on missing data
            distance = request.data.get('distance', 500)
            driver = request.data.get('driver_name', 'Unknown Driver')
            pickup = request.data.get('pickup_location', 'Not Specified')
            dropoff = request.data.get('dropoff_location', 'Not Specified')
            
            # 1. Create the Trip
            trip = Trip.objects.create(
                driver_name=driver,
                current_location=pickup,
                pickup_location=pickup,
                dropoff_location=dropoff,
                cycle_hours_used=float(request.data.get('cycle_hours_used', 0))
            )

            # 2. Generate Itinerary (Ensure distance is a float)
            itinerary = generate_log_itinerary(float(distance), datetime.now())

            # 3. Save Log Entries
            for item in itinerary:
                LogEntry.objects.create(
                    trip=trip,
                    status=item['status'],
                    start_time=item['start'],
                    end_time=item['end'],
                    location=item['location'],
                    remarks=item['remarks']
                )

            # 4. Return Data
            serializer = TripSerializer(trip)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"CRITICAL ERROR: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)