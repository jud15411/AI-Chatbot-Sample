# app.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import os
import json
import re
from difflib import SequenceMatcher
from typing import List
from dotenv import load_dotenv
import google.generativeai as genai
from pathlib import Path

def similarity(a: str, b: str) -> float:
    """Calculate the similarity ratio between two strings."""
    # Remove special characters and convert to lowercase for better comparison
    def clean_text(text):
        return re.sub(r'[^\w\s]', '', text).lower()
    
    a_clean = clean_text(a)
    b_clean = clean_text(b)
    
    # If either string is empty after cleaning, return 0 similarity
    if not a_clean or not b_clean:
        return 0.0
        
    return SequenceMatcher(None, a_clean, b_clean).ratio()

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Use the recommended model
model_name = "gemini-1.5-flash"
print(f"\nUsing model: {model_name}")
try:
    model = genai.GenerativeModel(model_name)
    print(f"Successfully loaded model: {model_name}")
except Exception as e:
    print(f"Error loading model {model_name}: {str(e)}")
    print("Falling back to listing available models...")
    try:
        available_models = [m for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        model_names = [m.name for m in available_models]
        print("\nAvailable models:", model_names)
        if available_models:
            model_name = available_models[0].name.split('/')[-1]
            print(f"Falling back to model: {model_name}")
            model = genai.GenerativeModel(model_name)
        else:
            raise Exception("No models available with generateContent support")
    except Exception as e:
        raise Exception(f"Failed to load any model: {str(e)}")

app = FastAPI()

# Set up templates
templates = Jinja2Templates(directory="static")

# Set up CORS middleware first to handle cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict this in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600  # Cache preflight requests for 10 minutes
)

# Get the absolute path to the static directory
static_dir = os.path.abspath("static")
css_dir = os.path.join(static_dir, "CSS")

# Create the CSS directory if it doesn't exist
os.makedirs(css_dir, exist_ok=True)

# Serve static files from the static directory
app.mount("/static", StaticFiles(directory=static_dir, html=True), name="static")

# Serve the main index.html file at the root with proper HTML response
@app.get("/", response_class=HTMLResponse)
async def read_index():
    return FileResponse(
        os.path.join(static_dir, "index.html"),
        media_type="text/html"
    )

# Handle favicon.ico requests
@app.get("/favicon.ico")
async def favicon():
    return FileResponse(
        os.path.join(static_dir, "favicon.ico"),
        media_type="image/x-icon"
    )

# Serve static files from the CSS directory
app.mount("/CSS", StaticFiles(directory=os.path.join(static_dir, "CSS")), name="css")

# Redirect any direct CSS requests to the static directory
@app.get("/CSS/{filename}")
async def get_css(filename: str):
    css_path = os.path.join(static_dir, "CSS", filename)
    if os.path.isfile(css_path):
        return FileResponse(css_path, media_type="text/css")
    raise HTTPException(status_code=404, detail="CSS file not found")

class PromptRequest(BaseModel):
    prompt: str
    emojis: bool = False
    topic: str = "cybersecurity"
    modifier: str = ""
    content_type: str = "message"
    risk_level: str = "medium"
    num_responses: int = 5

@app.options("/chat")
async def options_chat():
    return {"message": "OK"}

@app.post("/chat")
async def chat(prompt_request: PromptRequest):
    """Handle chat requests and generate responses."""
    # Convert to dict for easier manipulation
    data = prompt_request.dict()
    
    # Content type instructions
    content_type_instructions = {
        "message": "Generate concise, direct messages as if they were sent through a messaging platform.",
        "post": "Create social media posts that are engaging and appropriate for the specified platform.",
        "email": "Compose professional emails with appropriate subject lines and sign-offs."
    }
    content_instruction = content_type_instructions.get(
        prompt_request.content_type.lower(), 
        content_type_instructions["message"]
    )
    
    # Emoji instructions
    emoji_instruction = (
        "Include emojis in responses where it enhances realism."
        if prompt_request.emojis else
        "Do not include emojis."
    )
    
    # Risk level instructions
    risk_instructions = {
        "low": "The content should be safe, professional, and appropriate for all audiences. Avoid any potentially sensitive or controversial topics.",
        "medium": "The content can include discussions of security topics but should remain professional and appropriate for a business context.",
        "high": "The content can include examples of suspicious or malicious communications, but should clearly label them as such and provide educational context about why they are concerning."
    }
    risk_instruction = risk_instructions.get(
        prompt_request.risk_level.lower(), 
        risk_instructions["medium"]
    )
    
    # Format instructions based on content type
    format_instructions = {
        "message": "Each response should be a single message, no more than 2-3 sentences.",
        "post": "Each response should be a complete social media post with appropriate formatting.",
        "email": "Each response should be a complete email with subject line and proper email formatting."
    }
    format_instruction = format_instructions.get(
        prompt_request.content_type.lower(),
        format_instructions["message"]
    )
    
    async def generate():
        try:
            # Ensure we have the prompt data
            if not data.get('prompt'):
                yield json.dumps({"error": "No prompt provided"})
                return
            base_prompt = f"""
You are helping generate {prompt_request.content_type} content related to {prompt_request.topic}.
Generate exactly {prompt_request.num_responses} unique {prompt_request.content_type} examples.

{content_instruction}

Guidelines for each {prompt_request.content_type}:
1. Cover different sub-topics within {prompt_request.topic}
2. Vary the tone and style (e.g., formal, casual, urgent, informative)
3. Include different types of content (e.g., announcements, warnings, tips, questions)
4. Address different audiences when applicable (e.g., team leads, new hires, specific departments)
5. {format_instruction}
6. {risk_instruction}
7. {emoji_instruction}

Context: {prompt_request.modifier}

For high-risk content, ensure you provide educational context about why certain communications might be suspicious or malicious."

User Prompt:
{prompt_request.prompt}

For each message, respond with just the message content, no numbering or extra formatting.
"""
            response_count = 0
            previous_responses = []
            
            while response_count < prompt_request.num_responses:
                # Build the prompt with context of previous responses
                diversity_prompt = base_prompt
                if previous_responses:
                    diversity_prompt += "\n\nPrevious responses (for reference - do not repeat these exact ideas):\n"
                    for i, resp in enumerate(previous_responses, 1):
                        diversity_prompt += f"{i}. {resp}\n"
                
                diversity_prompt += f"\nGenerate message {response_count + 1} of {prompt_request.num_responses} (must be different from previous responses):"
                
                # Generate one response at a time with more specific instructions
                prompt = f"""{diversity_prompt}
                
                IMPORTANT: Respond with ONLY the message content. Do not include any:
                - Numbering (1., 2., etc.)
                - Markdown formatting (```, **, _)
                - Multiple messages
                - Email headers or signatures
                - Quotation marks around the message
                
                The response should be a single, clean message."""
                
                response = model.generate_content(prompt)
                response_text = response.text.strip()
                
                # Clean up the response more aggressively
                response_text = re.sub(r'^[\d\s\.\-\*_`:"]+', '', response_text)  # Remove numbering and formatting
                response_text = re.sub(r'[\*_`"]', '', response_text)  # Remove any remaining markdown
                response_text = re.sub(r'^\s*[\w\s]*[:;]\s*$', '', response_text, flags=re.MULTILINE)  # Remove headers
                response_text = re.sub(r'\n+', '\n', response_text).strip()  # Normalize newlines
                response_text = re.sub(r'\s+', ' ', response_text)  # Collapse multiple spaces
                
                # Take only the first paragraph if multiple exist
                paragraphs = [p.strip() for p in response_text.split('\n\n') if p.strip()]
                response_text = paragraphs[0] if paragraphs else ''
                
                # Skip if empty or too similar to previous responses
                if not response_text or any(similarity(response_text, prev) > 0.8 for prev in previous_responses):
                    continue
                
                previous_responses.append(response_text)
                response_count += 1
                
                yield json.dumps({
                    "response": response_text,
                    "index": response_count - 1,
                    "total": prompt_request.num_responses
                }) + "\n"
                    
        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"
    
    return StreamingResponse(generate(), media_type="application/x-ndjson")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
