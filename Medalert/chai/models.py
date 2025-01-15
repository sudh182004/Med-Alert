from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
# Create your models here.

class ChaiVariety(models.Model):
  CHAI_TYPE_CHOICES = [
    ('ML', 'MASALA'),
    ('GR', 'GINGER'),
    ('KL', 'KIWI'),
    ('PL', 'PLAIN'),
    ('EL', 'ELAICHI'),
  ]

  name = models.CharField(max_length=100)
  image = models.ImageField(upload_to='chais/')
  date_added = models.DateTimeField(default=timezone.now)
  type = models.CharField(max_length=2, choices=CHAI_TYPE_CHOICES, default='ML')
  desc = models.CharField(max_length=50,default="not avail")

  def __str__(self):
    return self.name
  
# one to many
class ChaiReview(models.Model):
  chai =  models.ForeignKey(ChaiVariety,on_delete=models.CASCADE, related_name="reviews")
  user = models.ForeignKey(User,on_delete=models.CASCADE)
  ratings = models.IntegerField()
  comments = models.TextField()
  date_added = models.DateTimeField(default=timezone.now)

  def __str__(self) :
    return f'{self.user.username} reviews {self.comments}'

class Store(models.Model):
  name = models.TextField()
  location = models.CharField(max_length=200)
  chai_varties = models.ManyToManyField(ChaiVariety,related_name='store')

  def __str__(self):
    return self.name