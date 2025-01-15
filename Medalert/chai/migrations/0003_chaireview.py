# Generated by Django 5.1 on 2024-10-28 13:50

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chai', '0002_chaivariety_desc'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ChaiReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ratings', models.IntegerField(max_length=5)),
                ('comments', models.TextField()),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now)),
                ('chai', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='chai.chaivariety')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
