# Generated by Django 5.1 on 2024-10-28 13:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chai', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chaivariety',
            name='desc',
            field=models.CharField(default='not avail', max_length=50),
        ),
    ]
