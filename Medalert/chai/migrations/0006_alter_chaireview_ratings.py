# Generated by Django 5.1 on 2024-11-22 10:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chai', '0005_alter_store_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chaireview',
            name='ratings',
            field=models.IntegerField(),
        ),
    ]
