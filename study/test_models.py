from google import genai
from dotenv import load_dotenv
import os 
load_dotenv()

client=genai.Client(api_key=os.getenv("GEMINI API KEY"))

for model in client.models.list():
    print(model.name)

    