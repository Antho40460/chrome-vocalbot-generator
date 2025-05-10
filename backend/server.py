from fastapi import FastAPI, HTTPException, Depends, Request, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, HttpUrl, validator
import requests
import os
import uuid
import json
from dotenv import load_dotenv
from pymongo import MongoClient
import motor.motor_asyncio
from datetime import datetime, timedelta
import stripe

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

# API keys
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY", "")
VAPI_API_KEY = os.environ.get("VAPI_API_KEY", "")

# Setup Stripe
if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Pydantic Models
class UserCreate(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str
    email: str
    created_at: datetime

class WebsiteInfo(BaseModel):
    url: HttpUrl
    title: Optional[str] = None

class CrawlRequest(BaseModel):
    website_url: HttpUrl

class CrawlResponse(BaseModel):
    id: str
    website_url: HttpUrl
    content: Dict[str, Any]
    created_at: datetime

class AssistantConfig(BaseModel):
    name: str
    system_prompt: str
    voice_id: str = "nova"
    language: str = "en"
    llm_model: str = "gpt-4o"
    temperature: float = 0.7
    max_response_duration: int = 120

class AssistantCreate(BaseModel):
    website_id: str
    config: AssistantConfig

class Assistant(BaseModel):
    id: str
    website_id: str
    config: AssistantConfig
    created_at: datetime
    test_mode: bool = True
    assistant_api_id: Optional[str] = None

class WidgetConfig(BaseModel):
    color: str = "#4F46E5"
    position: str = "bottom-right"
    cta_text: str = "Chat with me"
    avatar_url: Optional[str] = None

class WidgetCreate(BaseModel):
    assistant_id: str
    config: WidgetConfig

class Widget(BaseModel):
    id: str
    assistant_id: str
    config: WidgetConfig
    iframe_code: str
    created_at: datetime

class UsageRecord(BaseModel):
    user_id: str
    assistant_id: str
    duration: float  # in seconds
    cost: float  # in USD
    timestamp: datetime

# Startup and Shutdown Events
@app.on_event("startup")
async def startup_db_client():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.crawled_websites.create_index("website_url")
    await db.assistants.create_index("website_id")
    await db.widgets.create_index("assistant_id")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# User Routes
@app.post("/api/users", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    """Register a new user using Supabase authentication"""
    # Implementation will depend on Supabase integration
    # For now, return a mock response
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(new_user)
    return new_user

# Website Crawling
@app.post("/api/crawl", response_model=CrawlResponse)
async def crawl_website(crawl_request: CrawlRequest):
    """Crawl a website using Firecrawl.ai"""
    
    # Mock implementation for now
    # In production, integrate with Firecrawl.ai API
    website_url = str(crawl_request.website_url)
    
    # Simulate a website crawl 
    crawl_results = {
        "title": "Example Website",
        "pages": [
            {
                "url": website_url,
                "title": "Home Page",
                "content": "This is the main page content of the website."
            },
            {
                "url": f"{website_url}/about",
                "title": "About Us",
                "content": "Learn more about our company and mission."
            },
            {
                "url": f"{website_url}/services",
                "title": "Our Services",
                "content": "We offer a wide range of services to meet your needs."
            }
        ],
        "faq": [
            {
                "question": "What do you do?",
                "answer": "We provide innovative solutions for businesses."
            },
            {
                "question": "How can I contact you?",
                "answer": "You can reach us via email or phone."
            }
        ]
    }
    
    crawl_record = {
        "id": str(uuid.uuid4()),
        "website_url": website_url,
        "content": crawl_results,
        "created_at": datetime.utcnow()
    }
    
    await db.crawled_websites.insert_one(crawl_record)
    return crawl_record

# Assistant Creation
@app.post("/api/assistants", response_model=Assistant)
async def create_assistant(assistant_create: AssistantCreate):
    """Create a new voice assistant using Vapi.ai API"""
    
    # Get the crawled website content
    website = await db.crawled_websites.find_one({"id": assistant_create.website_id})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    # Prepare system prompt with website content
    system_prompt = assistant_create.config.system_prompt
    
    # Mock Vapi.ai API integration
    # In production, use actual Vapi.ai API
    vapi_response = {
        "id": f"vapi_{str(uuid.uuid4())}",
        "status": "created"
    }
    
    assistant = {
        "id": str(uuid.uuid4()),
        "website_id": assistant_create.website_id,
        "config": assistant_create.config.dict(),
        "created_at": datetime.utcnow(),
        "test_mode": True,
        "assistant_api_id": vapi_response["id"]
    }
    
    await db.assistants.insert_one(assistant)
    return assistant

# Widget Generation
@app.post("/api/widgets", response_model=Widget)
async def create_widget(widget_create: WidgetCreate):
    """Generate a widget for an assistant"""
    
    assistant = await db.assistants.find_one({"id": widget_create.assistant_id})
    if not assistant:
        raise HTTPException(status_code=404, detail="Assistant not found")
    
    # Generate iFrame code
    config = widget_create.config
    iframe_code = f"""
    <!-- Vapi.ai Voice Assistant Widget -->
    <script>
      var vapiInstance = null;
      const assistant = "{assistant['assistant_api_id']}";
      const apiKey = "public_key_placeholder";
      const buttonConfig = {{
        position: "{config.position}",
        color: "{config.color}",
        text: "{config.cta_text}",
        avatar: "{config.avatar_url or ''}"
      }};
    
      (function (d, t) {{
        var g = document.createElement(t),
          s = d.getElementsByTagName(t)[0];
        g.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
        g.defer = true;
        g.async = true;
        s.parentNode.insertBefore(g, s);
        g.onload = function () {{
          vapiInstance = window.vapiSDK.run({{
            apiKey: apiKey,
            assistant: assistant,
            config: buttonConfig,
          }});
        }};
      }})(document, "script");
    </script>
    """
    
    widget = {
        "id": str(uuid.uuid4()),
        "assistant_id": widget_create.assistant_id,
        "config": widget_create.config.dict(),
        "iframe_code": iframe_code,
        "created_at": datetime.utcnow()
    }
    
    await db.widgets.insert_one(widget)
    return widget

# Usage Tracking
@app.post("/api/usage", response_model=UsageRecord)
async def record_usage(
    user_id: str, 
    assistant_id: str, 
    duration: float, 
    background_tasks: BackgroundTasks
):
    """Record usage and charge the user accordingly"""
    
    # Calculate cost (0.49 USD per minute)
    cost = (duration / 60) * 0.49
    
    usage_record = {
        "user_id": user_id,
        "assistant_id": assistant_id,
        "duration": duration,
        "cost": cost,
        "timestamp": datetime.utcnow()
    }
    
    await db.usage_records.insert_one(usage_record)
    
    # In a background task, process the payment via Stripe
    background_tasks.add_task(process_payment, user_id, cost)
    
    return usage_record

async def process_payment(user_id: str, amount: float):
    """Process payment via Stripe"""
    # Implementation depends on Stripe integration
    # In production, use Stripe API to charge the customer
    pass

# Stripe webhook handler
@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
            event_data = event.data.object
            
            # Handle different event types
            if event.type == "charge.succeeded":
                # Handle successful payment
                pass
            elif event.type == "invoice.payment_failed":
                # Handle failed payment
                pass
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001)
