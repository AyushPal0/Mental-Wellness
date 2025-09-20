from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class GameSession(models.Model):
    """Model to track each user's game session"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    final_score = models.IntegerField(null=True, blank=True)
    severity_level = models.CharField(max_length=20, null=True, blank=True)
    is_high_risk = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Session {self.session_id} - Score: {self.final_score}"

class LevelResponse(models.Model):
    """Model to store user responses for each level"""
    COMFORT_CHOICES = [
        (1, 'Completely Comfortable'),
        (2, 'Slightly Uncomfortable'),
        (3, 'Moderately Uncomfortable'),
        (4, 'Quite Uncomfortable'),
        (5, 'Extremely Uncomfortable'),
    ]
    
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='responses')
    level = models.IntegerField()
    disorder_intensity = models.IntegerField()
    response = models.IntegerField(choices=COMFORT_CHOICES)
    view_time = models.IntegerField(help_text="Time spent viewing the level in seconds")
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['level']
        unique_together = ['session', 'level']
    
    def __str__(self):
        return f"Level {self.level} - Response: {self.get_response_display()}"

class Therapist(models.Model):
    """Model to store therapist information"""
    name = models.CharField(max_length=200)
    specialty = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class CrisisResource(models.Model):
    """Model to store crisis resources"""
    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=100)
    description = models.TextField()
    website = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class UserLocation(models.Model):
    """Model to store user location data for therapist recommendations"""
    session = models.OneToOneField(GameSession, on_delete=models.CASCADE, related_name='location')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    region = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Location for {self.session.session_id}"