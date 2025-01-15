from django.shortcuts import render ,redirect,get_object_or_404
from django.http import JsonResponse
from django.contrib.auth import authenticate,login 
from hospital.models import UserProfile,HospitalAlert
from hospital.views import Hospital
from math import radians, sin, cos, sqrt, atan2
from django.views.decorators.csrf import csrf_exempt

# Function to calculate distance between two lat/long points using Haversine formula
def calculate_distance(lat1, lon1, lat2, lon2):
    # Radius of the Earth in kilometers
    R = 6371.0
    
    # Convert latitude and longitude from degrees to radians
    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)
    
    # Differences in coordinates
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Haversine formula
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    # Distance in kilometers
    distance = R * c
    return distance


@csrf_exempt
def Home(request):
    response = ""
    
    if request.method == "POST":
        user_latitude = float(request.POST.get('latitude'))
        user_longitude = float(request.POST.get('longitude'))
        print(user_latitude,user_longitude)
        # user_latitude = float(28.6339308)
        # user_longitude = float(77.4470412)
        username = request.POST.get('usernames')
        message = request.POST.get('message')
        genders = request.POST.get('genders')  # New field
        allergies = request.POST.get('allergies')  # New field
        medical_conditions = request.POST.get('medicalConditions')  # New field
        emergency_contact_numbers = request.POST.get('emergency_contact_numbers')  # New field
        emergency_contact_relationships = request.POST.get('emergency_contact_relationships')  # New field

        # File path to the generated file
        combined_report_path = "reports/Combined_Health_Reports.pdf"

        closest_hospital = None
        closest_distance = float('inf')


        # Find the closest hospital
        hospitals = UserProfile.objects.all()
        for hospital in hospitals:
            hospital_latitude = hospital.latitude
            hospital_longitude = hospital.longitude
            
            # Calculate the distance
            distance = calculate_distance(user_latitude, user_longitude, hospital_latitude, hospital_longitude)
            
            if distance < closest_distance:
                closest_hospital = hospital
                closest_distance = distance
        
        if closest_hospital:
            response = f"The closest hospital is {closest_hospital.user}, located {closest_distance:.2f} km away."
            message_h = f"https://www.google.com/maps?q={closest_hospital.latitude},{closest_hospital.longitude}"

            # Save the message and additional fields in the database
            hospital = get_object_or_404(UserProfile, id=closest_hospital.id)
            alert = HospitalAlert.objects.create(
                name=username,
                hospital=hospital,
                message=message,
                file_path=combined_report_path,  # Save the file path in the ORM
                genders=genders,  # Save genders
                allergies=allergies,  # Save allergies
                medical_conditions=medical_conditions,  # Save medical conditions
                emergency_contact_numbers=emergency_contact_numbers,  # Save emergency contact numbers
                emergency_contact_relationships=emergency_contact_relationships  # Save emergency contact relationships
            )
            if emergency_contact_numbers:
                # Send a message to the first contact (you could loop through all contacts if needed)
                send_twilio_message(username,hospital,message_h,message,emergency_contact_numbers.split(',')[0])
        else:
            response = "No hospitals found in the database."

    return render(request, 'home.html', {'response': response})


from twilio.rest import Client

def send_twilio_message(patient_name, hospital_name, hospital_location, accident_location, to):
    # Twilio credentials (replace with actual credentials or store them securely)
    account_sid = 'ACd517027bdd1485f3c4be99e4f72a9510'  # Replace with your Twilio Account SID
    auth_token = '59979ecf68e85823cb9634e63d16eb75'  # Replace with your Twilio Auth Token
    from_ = 'whatsapp:+14155238886'  # Replace with your Twilio WhatsApp number

    # Format the message to include all the details
    message_body = f"Hello, we are from MedAlert.\n\nThe name of the patient is {patient_name}, and they have been admitted to {hospital_name} located at {hospital_location}. \n\nPlease reach out to them as soon as possible. The accident occurred at {accident_location}."



    # Ensure that the "to" number is in the correct WhatsApp format
    to = f'whatsapp:+91{to}'   

    # Create Twilio client
    client = Client(account_sid, auth_token)

    try:
        # Send the message
        message = client.messages.create(
            body=message_body,
            from_=from_,
            to=to,
        )
        print(f"Message sent to {to}")
    except Exception as e:
        print(f"Twilio error: {e}")
