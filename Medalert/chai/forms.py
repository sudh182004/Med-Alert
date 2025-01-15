from django import forms
from django.utils import timezone
from .models import ChaiVariety 

# class ChaiVarityForm(forms.Form):
#     # chai_variety = forms.ModelChoiceField(queryset=ChaiVariety.objects.all(), label = "Select Chai Variety ",initial=ChaiVariety.objects.first())
    
#     # chai_variety = forms.CharField(max_length=50, label="Enter The location")

class UploadChai(forms.Form):
    name = forms.CharField(max_length=30 ,required=True,label="Enter the name of the chai")
    image = forms.FileField()
    desc = forms.CharField(max_length=50)