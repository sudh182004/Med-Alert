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

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import HospitalAlert
from .serializers import HospitalAlertSerializer

@api_view(['GET'])
def get_alerts_api(request):
    alerts = HospitalAlert.objects.all()
    serializer = HospitalAlertSerializer(alerts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_confirmed_alerts_api(request):
    # Get hospital_id from query params (optional)
    hospital_id = request.GET.get("hospital_id")

    if hospital_id:
        confirmed_alerts = HospitalAlert.objects.filter(
            is_confirmed=True, hospital_id=hospital_id
        ).order_by('-timestamp')
    else:
        confirmed_alerts = HospitalAlert.objects.filter(
            is_confirmed=True
        ).order_by('-timestamp')

    serializer = HospitalAlertSerializer(confirmed_alerts, many=True)
    return Response(serializer.data)


from django.shortcuts import render, get_object_or_404
from .models import UserProfile

def hospital_history(request):
    if not request.user.is_authenticated:
        return render(request, 'login.html')

    profiles = UserProfile.objects.filter(user=request.user)
    return render(request, 'hospital-history.html', {'profiles': profiles})


def confirm_alert(request, alert_id):
    """
    Confirms a single alert by alert_id
    """
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    try:
        alert = get_object_or_404(HospitalAlert, id=alert_id)
        alert.is_confirmed = True
        alert.save()
        return JsonResponse({'message': f'Alert {alert_id} confirmed successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from twilio.rest import Client

@csrf_exempt
def send_history_message(request):
    if request.method == "POST":
        bed_no = request.POST.get("bed_no")
        room_no = request.POST.get("room_no")
        floor_no = request.POST.get("floor_no")
        to_number = request.POST.get("to_number")

        try:
            client = Client("TWILIO_SID", "TWILIO_AUTH_TOKEN")
            message = client.messages.create(
                body=f"🚨 Patient admitted.\nBed: {bed_no}\nRoom: {room_no}\nFloor: {floor_no}",
                from_="+1XXXXXXXXXX",  # your Twilio number
                to=to_number
            )
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})

    return JsonResponse({"success": False, "error": "Invalid request"})
