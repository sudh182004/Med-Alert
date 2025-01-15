from django.contrib import admin
from django.urls import path ,include
from . import views

urlpatterns = [
    path('',views.Hospital,name="hospital"),
    path('logout/',views.logout_view,name="logout"),
    path('get_alerts/<int:hospital_id>/', views.get_alerts, name='get_alerts'),
  

    
]