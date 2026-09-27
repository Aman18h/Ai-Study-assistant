from rest_framework import serializers

from .models import Flashcard


class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = [
            "id",
            "document",
            "question",
            "answer",
            "difficulty",
            "review_count",
            "correct_count",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "review_count",
            "correct_count",
        ]
