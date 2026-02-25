from django.urls import path
from .views import CreateTripView

urlpatterns = [
    path('create-trip/', CreateTripView.as_view(), name='create-trip'),
]