from django.contrib import admin
from django.urls import path, include # Make sure 'include' is imported!

urlpatterns = [
    path('admin/', admin.site.urls),
    # This line connects the two files
    path('api/', include('logs.urls')), 
]