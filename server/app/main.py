from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import models
app = FastAPI(
    title="IssueWiz",
    description="An AI-powered assistant for decoding open-source issues",
    version="1.0.0",
)
# CORS setup
origins = [
    "http://localhost:3000",  # Allow local frontend
    "http://localhost:3001",
    "https://issue-wiz.vercel.app/",  # Add your deployed frontend URL here
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,  # Allow cookies to be included
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(models.router, prefix="/models", tags=["models"])

@app.get("/")
def read_root():
    return {"message": "Welcome to IssueWiz API!"}
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "Server is running!"}


