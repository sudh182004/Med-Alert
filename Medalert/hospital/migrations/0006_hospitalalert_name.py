# Generated by Django 5.1 on 2025-01-11 14:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hospital', '0005_alter_hospitalalert_file_path'),
    ]

    operations = [
        migrations.AddField(
            model_name='hospitalalert',
            name='name',
            field=models.TextField(blank=True, null=True),
        ),
    ]
