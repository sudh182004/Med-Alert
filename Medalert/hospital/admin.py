from django.contrib import admin
from hospital.models import UserProfile ,HospitalAlert
# Register your models here.
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_new', 'address', 'latitude', 'longitude')
    # search_fields = ('user__username', 'address')

admin.site.register(UserProfile, UserProfileAdmin)

class HospitalAlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'hospital', 'message', 'timestamp', 'is_confirmed')
    list_filter = ('is_confirmed',)
admin.site.register(HospitalAlert,HospitalAlertAdmin)