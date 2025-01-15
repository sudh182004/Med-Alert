from django.shortcuts import render ,redirect,get_object_or_404
from django.contrib.auth import authenticate,login ,logout
from django.http import JsonResponse
from .models import UserProfile , HospitalAlert
def Hospital(request):
    # print(username)
    if request.user.is_authenticated:
        profiles = UserProfile.objects.filter(user =request.user)
        return render(request, 'hospital-home.html' , {'profiles':profiles})
    else:
        return render(request, 'login.html')

def logout_view(request):
    logout(request)  # This logs out the user
    return redirect('login')  # Redirect to login page after logout



def get_alerts(request, hospital_id):
    try:
        if request.method == "POST":
            alert = get_object_or_404(HospitalAlert, id=hospital_id)
            alert.is_confirmed = True
            alert.save()
            return JsonResponse({'message': 'Alert confirmed successfully'})

        # Get the hospital profile by ID
        hospital_profile = get_object_or_404(UserProfile, id=hospital_id)

        # Fetch alerts for this hospital
        alerts = HospitalAlert.objects.filter(hospital=hospital_profile, is_confirmed=False).order_by('-is_confirmed')

        # Return alerts as a JSON response
        return JsonResponse(list(alerts.values()), safe=False)

    except Exception as e:
        # Return a JSON error message
        return JsonResponse({'error': 'An error occurred: ' + str(e)}, status=400)
