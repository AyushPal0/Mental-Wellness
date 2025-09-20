from django.contrib import admin
from backend.models.game import GameSession, LevelResponse, Therapist, CrisisResource, UserLocation

@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'created_at', 'final_score', 'severity_level', 'is_high_risk']
    list_filter = ['is_high_risk', 'severity_level']
    search_fields = ['session_id']

@admin.register(LevelResponse)
class LevelResponseAdmin(admin.ModelAdmin):
    list_display = ['session', 'level', 'response', 'view_time']
    list_filter = ['level', 'response']

@admin.register(Therapist)
class TherapistAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialty', 'location', 'rating', 'is_active']
    list_filter = ['is_active', 'specialty']
    search_fields = ['name', 'location']

@admin.register(CrisisResource)
class CrisisResourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact', 'is_active']
    list_filter = ['is_active']

@admin.register(UserLocation)
class UserLocationAdmin(admin.ModelAdmin):
    list_display = ['session', 'city', 'region', 'country']
    search_fields = ['session__session_id', 'city', 'country']