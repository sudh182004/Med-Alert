# Generated by Django 5.1 on 2025-01-11 14:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hospital', '0006_hospitalalert_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='hospitalalert',
            name='allergies',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hospitalalert',
            name='emergency_contact_numbers',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hospitalalert',
            name='emergency_contact_relationships',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hospitalalert',
            name='genders',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='hospitalalert',
            name='medical_conditions',
            field=models.TextField(blank=True, null=True),
        ),
    ]
