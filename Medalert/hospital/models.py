from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # Link to the User model
    is_new = models.BooleanField(default=True)  # Track if the user is new
    address = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
    

class HospitalAlert(models.Model):
    name = models.TextField(blank=True, null=True)
    hospital = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    message = models.TextField()
    file_path = models.FileField(upload_to='reports_hospital/', blank=True, null=True)  # File Uploads
    timestamp = models.DateTimeField(auto_now_add=True)
    is_confirmed = models.BooleanField(default=False)

    genders = models.CharField(max_length=50, blank=True, null=True)  # Gender details
    allergies = models.TextField(blank=True, null=True)  # Allergies information
    medical_conditions = models.TextField(blank=True, null=True)  # Medical conditions
    emergency_contact_numbers = models.TextField(blank=True, null=True)  # Store as comma-separated numbers
    emergency_contact_relationships = models.TextField(blank=True, null=True)  # Store relationships as comma-separated values

    def __str__(self):
        return f"Alert for {self.hospital.user} at {self.timestamp}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)  
