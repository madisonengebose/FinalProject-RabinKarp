from fastapi import HTTPException, UploadFile, File
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from keyword_detector import KeywordDetector

# singleton detector instance
detector = KeywordDetector()

# router for keyword detection endpoints
router = APIRouter(prefix="/api", tags=["keyword-detection"])

# pydantic models for keyword detection
class AddKeywordsRequest(BaseModel):
    keywords: List[str]

class AddKeywordsResponse(BaseModel):
    message: str
    current_keywords: List[str]

class EmailDetectionRequest(BaseModel):
    emails: List[str]

class EmailMatchResult(BaseModel):
    email_index: int
    matches: Dict[str, List[int]]  # {keyword: [word_indices]}

class EmailDetectionResponse(BaseModel):
    results: List[EmailMatchResult]


@router.post("/keywords/add", response_model=AddKeywordsResponse)
async def add_keywords_endpoint(request: AddKeywordsRequest) -> AddKeywordsResponse:
    """
    Add keywords to the detector.
    Accepts a list of keywords and adds them to the detector.
    Keywords are added as-is (phrases are preserved, not tokenized).
    """
    try:
        # Normalize keywords (lowercase, strip) but don't tokenize
        normalized_keywords = [kw.strip().lower() for kw in request.keywords if kw.strip()]
        # Filter out duplicates
        existing_keywords_set = set(detector.keywords)
        new_keywords = [kw for kw in normalized_keywords if kw not in existing_keywords_set]
        # Add keywords directly without tokenizing
        detector.keywords.extend(new_keywords)
        return AddKeywordsResponse(
            message=f"Successfully added {len(new_keywords)} keyword(s) ({len(normalized_keywords) - len(new_keywords)} duplicates skipped)",
            current_keywords=detector.keywords.copy()
        )
    except Exception as e:
        import traceback
        error_detail = str(e)
        error_traceback = traceback.format_exc()
        print(f"Error adding keywords: {error_detail}")
        print(f"Traceback: {error_traceback}")
        raise HTTPException(status_code=400, detail=f"Error adding keywords: {error_detail}")


@router.post("/keywords/set", response_model=AddKeywordsResponse)
async def set_keywords_endpoint(request: AddKeywordsRequest) -> AddKeywordsResponse:
    """
    Set keywords in the detector (replaces all existing keywords).
    Accepts a list of keywords and replaces all current keywords with them.
    Keywords are added as-is (phrases are preserved, not tokenized).
    """
    try:
        # Clear all existing keywords
        detector.keywords = []
        # Normalize keywords (lowercase, strip) but don't tokenize
        normalized_keywords = [kw.strip().lower() for kw in request.keywords if kw.strip()]
        # Add keywords directly without tokenizing
        detector.keywords.extend(normalized_keywords)
        return AddKeywordsResponse(
            message=f"Successfully set {len(normalized_keywords)} keyword(s)",
            current_keywords=detector.keywords.copy()
        )
    except Exception as e:
        import traceback
        error_detail = str(e)
        error_traceback = traceback.format_exc()
        print(f"Error setting keywords: {error_detail}")
        print(f"Traceback: {error_traceback}")
        raise HTTPException(status_code=400, detail=f"Error setting keywords: {error_detail}")


def parse_keyword_file(file_content: str) -> List[str]:
    """Parse keyword file content (one keyword per line)."""
    keywords = []
    lines = file_content.split('\n')
    for line in lines:
        keyword = line.strip()
        # Skip empty lines
        if keyword:
            keywords.append(keyword.lower())
    return keywords


@router.post("/keywords/upload", response_model=AddKeywordsResponse)
async def upload_keywords_file_endpoint(
    file: UploadFile = File(..., description="TXT file containing keywords (one per line)"),
    replace: bool = False
) -> AddKeywordsResponse:
    """
    Upload keywords from a text file.
    Accepts a .txt file with one keyword per line.
    
    Args:
        file: The keyword file to upload
        replace: If True, replaces all existing keywords. If False, adds to existing keywords.
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check if file is .txt
        filename = file.filename.lower()
        if not filename.endswith('.txt'):
            raise HTTPException(status_code=400, detail="Only .txt files are supported for keyword uploads")
        
        # Read and parse the file
        contents = await file.read()
        file_content = contents.decode('utf-8')
        keywords = parse_keyword_file(file_content)
        
        if not keywords:
            raise HTTPException(status_code=400, detail="No keywords found in file")
        
        # Add or set keywords based on replace flag
        # Add keywords directly without tokenizing (treat each line as a single keyword)
        if replace:
            detector.keywords = []
            # Add keywords directly without tokenizing
            detector.keywords.extend(keywords)
            message = f"Successfully set {len(keywords)} keyword(s) from file"
        else:
            # Filter out duplicates
            existing_keywords_set = set(detector.keywords)
            new_keywords = [kw for kw in keywords if kw not in existing_keywords_set]
            # Add keywords directly without tokenizing
            detector.keywords.extend(new_keywords)
            message = f"Successfully added {len(new_keywords)} new keyword(s) from file ({len(keywords) - len(new_keywords)} duplicates skipped)"
        
        return AddKeywordsResponse(
            message=message,
            current_keywords=detector.keywords.copy()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = str(e)
        error_traceback = traceback.format_exc()
        print(f"Error uploading keywords file: {error_detail}")
        print(f"Traceback: {error_traceback}")
        raise HTTPException(status_code=400, detail=f"Error uploading keywords file: {error_detail}")


@router.post("/keywords/detect", response_model=EmailDetectionResponse)
async def detect_keywords_endpoint(request: EmailDetectionRequest) -> EmailDetectionResponse:
    """
    Detect keywords in one or more emails.
    Accepts a list of email texts and returns keyword matches for each email.
    """
    try:
        results = []
        for idx, email_text in enumerate(request.emails):
            matches = detector.detect_keywords(email_text)
            # Convert defaultdict to regular dict for JSON serialization
            results.append(EmailMatchResult(
                email_index=idx,
                matches=dict(matches)
            ))
        
        return EmailDetectionResponse(results=results)

    except Exception as e:
        import traceback
        error_detail = str(e)
        error_traceback = traceback.format_exc()
        print(f"Error detecting keywords: {error_detail}")
        print(f"Traceback: {error_traceback}")
        raise HTTPException(status_code=400, detail=f"Error detecting keywords: {error_detail}")


def parse_file_content(file_content: str, filename: str) -> List[str]:
    """Parse TXT file content and extract emails."""
    emails = []
    
    # Parse plain text files - split by double newlines or single lines
    lines = file_content.split('\n\n')
    if len(lines) == 1:
        # If no double newlines, split by single newlines
        lines = file_content.split('\n')
    
    emails = [line.strip() for line in lines if line.strip()]
    
    return emails

@router.post("/keywords/detect/files", response_model=EmailDetectionResponse)
async def detect_keywords_files_endpoint(files: List[UploadFile] = File(..., description="TXT files to process")) -> EmailDetectionResponse:
    """
    Detect keywords in emails from uploaded .txt files or folders containing .txt files.
    Accepts plain text files (one email per line or separated by blank lines).
    """
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files uploaded")
        
        all_emails = []
        file_info = []  # Track which file each email came from
        
        # Process each file (only .txt files)
        for file in files:
            try:
                # Check if file is .txt
                filename = file.filename.lower() if file.filename else ''
                if not filename.endswith('.txt'):
                    print(f"Skipping non-.txt file: {file.filename}")
                    continue
                
                contents = await file.read()
                file_content = contents.decode('utf-8')
                emails = parse_file_content(file_content, file.filename)
                
                # Track file info for each email
                for email in emails:
                    all_emails.append(email)
                    file_info.append({
                        'filename': file.filename,
                        'email_index': len(all_emails) - 1
                    })
            except Exception as e:
                print(f"Error processing file {file.filename}: {str(e)}")
                # Continue with other files even if one fails
                continue
        
        if not all_emails:
            raise HTTPException(status_code=400, detail="No emails found in any of the uploaded files")
        
        # Detect keywords in all emails
        results = []
        for idx, email_text in enumerate(all_emails):
            matches = detector.detect_keywords(email_text)
            results.append(EmailMatchResult(
                email_index=idx,
                matches=dict(matches)
            ))
        
        return EmailDetectionResponse(results=results)

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = str(e)
        error_traceback = traceback.format_exc()
        print(f"Error detecting keywords from files: {error_detail}")
        print(f"Traceback: {error_traceback}")
        raise HTTPException(status_code=400, detail=f"Error detecting keywords from files: {error_detail}")