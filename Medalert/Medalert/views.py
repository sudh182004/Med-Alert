from django.shortcuts import render ,redirect
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm,AuthenticationForm
from hospital.models import UserProfile
from django.http import HttpResponse
from django.http import HttpResponseRedirect
import os
import re
import logging
from collections import defaultdict
import matplotlib
matplotlib.use('Agg')  # Use Agg backend for non-GUI operation
import matplotlib.pyplot as plt
from fpdf import FPDF
import pdfplumber
from django.shortcuts import render

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()
user = None

# Important medical history field extraction patterns
FIELD_PATTERNS = {
    "BP": r'BP[:\- ]?(\d{2,3})[\/\-](\d{2,3})',  # Blood Pressure (Systolic/Diastolic)
    "Sugar_Fasting": r'Fasting[:\- ]?(\d{2,3})',  # Fasting Sugar
    "Sugar_PP": r'PP[:\- ]?(\d{2,3})',  # Postprandial Sugar
    "HbA1c": r'HbA1c[:\- ]?(\d{1,2}\.\d{1,2})',  # HbA1c
    "LDL": r'LDL[:\- ]?(\d{2,3})',  # LDL Cholesterol
    "HDL": r'HDL[:\- ]?(\d{2,3})',  # HDL Cholesterol
    "Triglycerides": r'Triglycerides[:\- ]?(\d{2,3})',  # Triglycerides
    "Cholesterol": r'Cholesterol[:\- ]?(\d{2,3})',  # Total Cholesterol
    "BMI": r'BMI[:\- ]?(\d{2,3}\.\d{1,2})',  # Body Mass Index
    "Blood_Glucose": r'Blood Glucose[:\- ]?(\d{2,3})'  # Blood Glucose
}

# PDF report generator class
class PDFReport(FPDF):
    def header(self):
        self.set_fill_color(220, 220, 220)  # Light grey background
        self.rect(0, 0, 210, 20, 'F')  # Full-width rectangle for the header
        self.set_font('Arial', 'B', 14)
        self.set_y(5)
        self.set_text_color(0, 102, 204)  # Blue text
        self.cell(0, 10, 'Health Report Summary', align='C', ln=1)
        self.set_y(20)

    def add_section(self, title, content):
        if self.get_y() > 250:  # Page-break threshold
            self.add_page()
        self.set_font('Arial', 'B', 12)
        self.set_text_color(34, 34, 34)
        self.cell(0, 10, title, ln=1)
        self.set_font('Arial', '', 10)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 8, content)
        self.ln(5)  # Add spacing

    def add_table(self, data):
        self.set_fill_color(240, 240, 240)  # Light grey row background
        self.set_font('Arial', 'B', 10)
        self.cell(40, 8, "Metric", 1, 0, 'C', 1)
        self.cell(50, 8, "Value", 1, 1, 'C', 1)

        self.set_font('Arial', '', 10)
        for key, value in data.items():
            self.cell(40, 8, key, 1)
            self.cell(50, 8, str(value), 1, 1)
        self.ln(5)

    def add_image(self, image_path, w=90):
        if self.get_y() > 230:
            self.add_page()
        self.image(image_path, x=(210 - w) / 2, y=self.get_y(), w=w)
        self.ln(60)


# Helper functions
def extract_text_from_pdf(pdf_path):
    try:
        logger.info(f"Extracting text from {pdf_path}")
        with pdfplumber.open(pdf_path) as pdf:
            return "".join(page.extract_text() for page in pdf.pages if page.extract_text())
    except Exception as e:
        logger.error(f"Error extracting text from {pdf_path}: {e}")
        return ""

def extract_field_data(text, field):
    pattern = FIELD_PATTERNS.get(field)
    if not pattern:
        return []
    matches = re.findall(pattern, text, re.IGNORECASE)
    if field == "BP":
        return [{"systolic": int(match[0]), "diastolic": int(match[1])} for match in matches]
    elif field == "HbA1c":
        return [float(match) for match in matches]
    elif field == "BMI":
        return [float(match) for match in matches]
    return [int(match) for match in matches]

def summarize_data(data):
    if not data:
        return {"avg": None, "min": None, "max": None, "trend": []}
    return {
        "avg": sum(data) / len(data),
        "min": min(data),
        "max": max(data),
        "trend": data
    }

def summarize_bp_data(bp_data):
    systolic = [d["systolic"] for d in bp_data]
    diastolic = [d["diastolic"] for d in bp_data]
    return {
        "BP_Systolic": summarize_data(systolic),
        "BP_Diastolic": summarize_data(diastolic)
    }

def generate_graph(data, title, output_path, avg=None, min_val=None, max_val=None):
    plt.figure(figsize=(4, 3))
    plt.plot(data, marker='o', color='blue', label="Trend")
    if avg is not None:
        plt.axhline(avg, color='green', linestyle='--', label='Average')
    if min_val is not None:
        plt.axhline(min_val, color='red', linestyle='--', label='Min')
    if max_val is not None:
        plt.axhline(max_val, color='orange', linestyle='--', label='Max')
    plt.title(title)
    plt.xlabel("Time")
    plt.ylabel(title)
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(output_path)  # Save the figure as a PNG file
    plt.close()  # Close the plot to release memory

def process_pdf(pdf_path, data_summary):
    text = extract_text_from_pdf(pdf_path)
    for field in FIELD_PATTERNS.keys():
        field_data = extract_field_data(text, field)
        if field == "BP" and field_data:
            data_summary["BP_Systolic"]["trend"].extend(d["systolic"] for d in field_data)
            data_summary["BP_Diastolic"]["trend"].extend(d["diastolic"] for d in field_data)
        elif field_data:
            data_summary[field]["trend"].extend(field_data)
    return data_summary

def generate_combined_report(data_summary, output_file):
    pdf = PDFReport()
    pdf.add_page()
    pdf.add_section("Overall Health Report Summary", "")

    for field, summary in data_summary.items():
        if summary.get("trend"):
            avg_text = f"Average: {summary['avg']:.2f}" if summary['avg'] is not None else "Average: N/A"
            min_text = f"Minimum: {summary['min']}" if summary['min'] is not None else "Minimum: N/A"
            max_text = f"Maximum: {summary['max']}" if summary['max'] is not None else "Maximum: N/A"

            content = f"{avg_text}\n{min_text}\n{max_text}"
            pdf.add_section(f"{field} Summary", content)

            graph_path = f"{field}_trend.png"
            generate_graph(
                summary["trend"],
                f"{field} Trend",
                graph_path,
                avg=summary.get("avg"),
                min_val=summary.get("min"),
                max_val=summary.get("max")
            )
            pdf.add_image(graph_path, w=90)  # Smaller width for compact graphs
            os.remove(graph_path)

    pdf.output(output_file)
    logger.info(f"Generated report: {output_file}")

# PDF processing function
def process_multiple_pdfs(pdf_paths, output_dir="media/reports"):
    os.makedirs(output_dir, exist_ok=True)
    data_summary = defaultdict(lambda: {"trend": []})
    
    # Process each PDF file
    for pdf_path in pdf_paths:
        data_summary = process_pdf(pdf_path, data_summary)

    # Summarize data for each field
    for field in data_summary.keys():
        if field.startswith("BP"):
            continue
        data_summary[field] = summarize_data(data_summary[field]["trend"])

    # Process BP data separately
    bp_data = summarize_bp_data(
        [{"systolic": s, "diastolic": d} for s, d in zip(data_summary["BP_Systolic"]["trend"], data_summary["BP_Diastolic"]["trend"])])
    data_summary.update(bp_data)

    # Generate the combined health report
    combined_report_path = f"{output_dir}/Combined_Health_Reports.pdf"
    generate_combined_report(data_summary, combined_report_path)
    logger.info(f"Report generated: {combined_report_path}")

# Django view function
def upload_view(request):
    if request.method == 'POST' and request.FILES.getlist('pdf_files'):
        # Retrieve files from the request
        files = request.FILES.getlist('pdf_files')
        
        # Call the function to process the PDFs
        process_multiple_pdfs(files)
        
        # After processing the files, return an HttpResponse indicating success
        return render(request, 'home.html')
        user = request.user

    # If the request is GET, render the upload form
    return render(request, 'home.html')






def Home(request):
    if request.user.is_authenticated:
    # Do something for authenticated users.
        return render(request,'hospital-home.html')
    else:
    # Do something for anonymous users.
        return render(request,'login.html')
    


def register_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()  # Create the User object
            login(request, user)  # Log the user in
            
            # Redirect new users to onboarding
            user_profile = UserProfile.objects.get(user=user)
            if user_profile.is_new:
                return redirect('onboarding')  # Replace 'onboarding' with your URL name
    else:
        initialdata = {'username':'','password1':'','password2':''}
        form = UserCreationForm(initial = initialdata)
    return render(request, 'auth/register.html', {"form": form})

def login_view(request):
    if request.user.is_authenticated:
        return render(request, 'hospital-home.html')
    else:
        if request.method == "POST":
            form = AuthenticationForm(request,data = request.POST)
            if form.is_valid():
                user = form.get_user()
                login(request, user)

                # Check if the user is new
                profile = UserProfile.objects.get(user=user)
                if profile.is_new:
                    return redirect('onboarding')  # Redirect first-time users
                
                return redirect('hospital')  # Redirect returning users
        else:
            initial_data = {'username': '', 'password': ''}
            form = AuthenticationForm(initial=initial_data)
        return render(request, 'auth/login.html', {"form": form})


def onboarding_view(request):
    if request.method == "POST":
        address = request.POST.get('address')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        # Ensure the profile exists
        user_profile, created = UserProfile.objects.get_or_create(user=request.user)

        # Save the data
        user_profile.address = address
        user_profile.latitude = latitude
        user_profile.longitude = longitude
        user_profile.is_new = False
        user_profile.save()

        return redirect('hospital')  # Redirect to the dashboard

    return render(request, 'onboarding.html')
 