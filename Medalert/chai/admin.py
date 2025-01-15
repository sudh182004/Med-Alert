from django.contrib import admin
from .models import ChaiVariety, ChaiReview, Store

# Register your models here.

class ChaiReviewInline(admin.StackedInline ):
    model = ChaiReview           
    extra=2

class ChaiVarietyAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'desc')
    inlines = [ChaiReviewInline]

class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'location')
    filter_horizontal = ('chai_varties',)


admin.site.register(ChaiVariety, ChaiVarietyAdmin)
admin.site.register(Store,StoreAdmin)  # Register Store if it's needed
