from django.contrib import admin
from django.urls import path ,include
from . import views

urlpatterns = [
    path('',views.Hospital,name="hospital"),
    path('logout/',views.logout_view,name="logout"),
    path('api/alerts/', views.get_alerts_api, name="get-alerts"),
    path('api/alerts/confirmed/', views.get_confirmed_alerts_api, name='get_confirmed_alerts_api'),
    path('history/', views.hospital_history, name='hospital_history'),
    path('confirm_alert/<int:alert_id>/', views.confirm_alert, name='confirm_alert'),
    path('send_history_message/', views.send_history_message, name='send_history_message'),



  

    
]