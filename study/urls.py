from django.urls import path
from .views import home ,upload_pdf,ask_question
from .views import get_documents
from .views import delete_document
from .views import create_chat
from .views import get_chat_history
from .views import get_chat_sessions
from .views import get_chat_messages
from .views import generate_document_flashcards, get_document_flashcards
urlpatterns=[
    
    path('',home),
    path('upload_pdf/', upload_pdf),
    path('ask/',ask_question),
    path("documents/",get_documents),
    path("documents/<int:document_id>/",delete_document),
    path("chat/new/", create_chat),
    path("chat/<int:session_id>/", get_chat_history),
    path(
    "chat-sessions/<int:document_id>/",
    get_chat_sessions),
path(
    "chat/<int:session_id>/",
    get_chat_messages
),
path(
    "documents/<int:document_id>/flashcards/generate/",
    generate_document_flashcards,
),
path(
    "documents/<int:document_id>/flashcards/",
    get_document_flashcards,
),
]