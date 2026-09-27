from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pypdf import PdfReader
from dotenv import load_dotenv
from google import genai
from .utils import chunk_text
from .chroma_db import collection
import os
import json
import uuid
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import PDFDocument,ChatSession ,ChatMessage
from django.shortcuts import get_object_or_404
from rest_framework import status

from .models import PDFDocument,Flashcard
from .serializers import FlashcardSerializer
from .flashcard_service import generate_flashcards
# Load environment variables
load_dotenv()


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured in the environment."
        )

    return genai.Client(api_key=api_key)


client = None

def home(request):
    return JsonResponse({
        "message": "Django API working!"
    })


@csrf_exempt
def ask_question(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST request required"},
            status=400
        )
    try:
        client = get_gemini_client()
        body = json.loads(request.body)
        question = body.get("question")
        document_id = body.get("document_id")
        session_id = body.get("session_id")
        results = collection.query(
            query_texts=[question],
            n_results=3,
            where={
        "document_id": str(document_id)
        }
        )
        context = "\n".join(results["documents"][0])
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"""
            Answer the question using only the context below.
            Context:
            {context}

            Question:
            {question}
            """
        )
        session = get_object_or_404(
             ChatSession,
                id=session_id
            )

        ChatMessage.objects.create(
        session=session,
        question=question,
        answer=response.text
        )
        if session.title == "New Chat":
            session.title = question[:40]
            session.save()

        return JsonResponse({
            "answer": response.text
        })

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )



@api_view(["POST"])
@permission_classes([IsAuthenticated])
@csrf_exempt
def upload_pdf(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST request required"},
            status=400
        )

    pdf_file = request.FILES.get("pdf")
    if not pdf_file:
        return JsonResponse(
            {"error": "No PDF uploaded"},
            status=400
        )
    pdf_document = PDFDocument.objects.create(
    title=pdf_file.name,
    pdf_file=pdf_file
)
    try:

        # Extract PDF text
        reader = PdfReader(pdf_file)

        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""

        # Split into chunks
        chunks = chunk_text(text)
        print(f"stored {len(chunks)} chunks")
        # Store in ChromaDB
        for i, chunk in enumerate(chunks):
            collection.add(
    documents=[chunk],
    ids=[str(uuid.uuid4())],
    metadatas=[
        {
            "document_id": str(pdf_document.id)
        }
    ]
)

        # Generate summary
        response = client.models.generate_content(
            model="gemini-2.5-flash" ,
            contents=f"""
            Summarize this document in simple bullet points.

            {text[:10000]}
            """
        )

        summary = response.text

        pdf_document.summary = summary
        pdf_document.save()

        return JsonResponse({
            "message": "PDF uploaded successfully",
            "summary": summary,
            "document_id": pdf_document.id,
            "title":pdf_document.title

        })

    except Exception as e:
        print("Error:",e)
        return JsonResponse(
            {"error": str(e)},
            status=500
        )





@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_documents(request):
    documents=PDFDocument.objects.all().order_by("-uploaded_at")
    data=[]

    for doc in documents:
        data.append(
            {
                "id":doc.id,
                "title": doc.title,
                "summary": doc.summary,
                "uploaded_at":doc.uploaded_at
            }
        )
    return JsonResponse(data,safe=False)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_document(request, document_id):

    pdf = get_object_or_404(PDFDocument, id=document_id)

    # Delete the PDF file from storage
    if pdf.pdf_file and os.path.exists(pdf.pdf_file.path):
        os.remove(pdf.pdf_file.path)

    # Get all chunks belonging to this PDF
    results = collection.get(
        where={"document_id": str(document_id)}
    )

    # Delete chunks from ChromaDB
    if results["ids"]:
        collection.delete(ids=results["ids"])

    # Delete the database record
    pdf.delete()

    return Response({
        "message": "PDF deleted successfully"
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, session_id):

    session = get_object_or_404(
        ChatSession,
        id=session_id
    )

    messages = ChatMessage.objects.filter(
        session=session
    ).order_by("created_at")

    data = []

    for msg in messages:

        data.append({
            "question": msg.question,
            "answer": msg.answer,
        })

    return JsonResponse(data, safe=False)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_chat(request):

    document_id = request.data.get("document_id")

    if not document_id:
        return Response(
            {"error": "Document ID is required"},
            status=400
        )

    document = get_object_or_404(
        PDFDocument,
        id=document_id
    )

    session = ChatSession.objects.create(
        document=document,
        title="New Chat"
    )

    return Response({
        "session_id": session.id,
        "title": session.title
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_history(request, session_id):

    session = get_object_or_404(
        ChatSession,
        id=session_id
    )

    messages = ChatMessage.objects.filter(
        session=session
    ).order_by("created_at")

    data = []

    for message in messages:
        data.append({
            "question": message.question,
            "answer": message.answer,
            "created_at": message.created_at
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_sessions(request, document_id):

    document = get_object_or_404(
        PDFDocument,
        id=document_id
    )

    sessions = ChatSession.objects.filter(
        document=document
    ).order_by("-created_at")

    data = []

    for session in sessions:
        data.append({
            "id": session.id,
            "title": session.title,
            "created_at": session.created_at
        })

    return Response(data)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_document_flashcards(request, document_id):

    try:
        document = PDFDocument.objects.get(id=document_id)
    except PDFDocument.DoesNotExist:
        return Response(
            {"error": "Document not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    number_of_cards = request.data.get("number_of_cards", 10)
    difficulty = request.data.get("difficulty", "medium")

    try:
        number_of_cards = int(number_of_cards)
    except (TypeError, ValueError):
        return Response(
            {"error": "number_of_cards must be an integer."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if number_of_cards < 1 or number_of_cards > 50:
        return Response(
            {"error": "Number of cards must be between 1 and 50."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if difficulty not in ["easy", "medium", "hard"]:
        return Response(
            {"error": "Difficulty must be easy, medium, or hard."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        generated_cards = generate_flashcards(
            document_id=document.id,
            number_of_cards=number_of_cards,
            difficulty=difficulty,
        )

    except Exception as e:
        return Response(
            {
                "error": "Failed to generate flashcards.",
                "details": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    saved_cards = []

    for card in generated_cards:

        question = card.get("question")
        answer = card.get("answer")

        if not question or not answer:
            continue

        flashcard = Flashcard.objects.create(
            document=document,
            question=question,
            answer=answer,
            difficulty=card.get("difficulty", difficulty),
        )

        saved_cards.append(flashcard)

    serializer = FlashcardSerializer(
        saved_cards,
        many=True
    )

    return Response(
        {
            "message": "Flashcards generated successfully.",
            "count": len(saved_cards),
            "flashcards": serializer.data,
        },
        status=status.HTTP_201_CREATED,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_document_flashcards(request, document_id):

    try:
        document = PDFDocument.objects.get(id=document_id)
    except PDFDocument.DoesNotExist:
        return Response(
            {"error": "Document not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    flashcards = Flashcard.objects.filter(
        document=document
    ).order_by("-created_at")

    serializer = FlashcardSerializer(
        flashcards,
        many=True
    )

    return Response({
        "count": flashcards.count(),
        "flashcards": serializer.data
    })