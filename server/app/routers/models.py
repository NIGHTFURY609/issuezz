from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from model.matcher import IssueMatcher
import time
import json

router = APIRouter(prefix="/api", tags=["issue-analysis"])

class FileInfo(BaseModel):
    name: str
    path: str
    download_url: str

class IssueDetails(BaseModel):
    owner: str
    repo: str
    title: str
    description: str
    labels: List[str]

class IssueAnalysisRequest(BaseModel):
    owner: str
    repo: str
    filteredFiles: List[FileInfo]
    issueDetails: IssueDetails

class IssueAnalysisResponse(BaseModel):
    elapsed_time: float
    matches: dict
    status: str
    message: str

@router.post("/analyse-issue", response_model=IssueAnalysisResponse)
async def analyze_issue(request: IssueAnalysisRequest):
    try:
        # Initialize the matcher
        matcher = IssueMatcher()
        
        start_time = time.time()
        
        # Run the matching
        result = await matcher.match_files(
            request.issueDetails.dict(),
            [file.dict() for file in request.filteredFiles]
        )
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        return IssueAnalysisResponse(
            elapsed_time=elapsed_time,
            matches=result,
            status="success",
            message="Issue analysis completed successfully"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing issue: {str(e)}"
        )