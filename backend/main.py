from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import pytesseract
from PIL import Image, ImageOps
from transformers import pipeline
import io
import os
import logging

try:
    from pdf2image import convert_from_bytes
except Exception:
    convert_from_bytes = None

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("doc-summary-backend")

# Just let system PATH handle it
pytesseract.pytesseract.tesseract_cmd = "tesseract"
POPPLER_PATH = None  # Linux usually has poppler installed globally

# --- Summarizer ---
summarizer = None
try:
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", device=-1)
    log.info("✅ Loaded summarizer")
except Exception as e:
    log.error(f"❌ Summarizer failed: {e}")

app = FastAPI(title="Document Summary Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helpers ---
def _ocr_pil(image: Image.Image) -> str:
    img = ImageOps.exif_transpose(image).convert("L")
    img = ImageOps.autocontrast(img)
    return pytesseract.image_to_string(img, config="--oem 3 --psm 6")

def extract_text_from_image_bytes(file_bytes: bytes) -> str:
    with Image.open(io.BytesIO(file_bytes)) as im:
        return _ocr_pil(im).strip()

def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            t = page.extract_text() or ""
            if t.strip():
                text_parts.append(t.strip())
    if not text_parts and convert_from_bytes:
        images = convert_from_bytes(file_bytes, dpi=200, poppler_path=POPPLER_PATH)
        for img in images:
            text_parts.append(_ocr_pil(img).strip())
    return "\n\n".join(text_parts).strip()

def summarize_text(text: str, length: str) -> str:
    if summarizer:
        return summarizer(text[:1000], max_length=150, min_length=30, do_sample=False)[0]["summary_text"]
    return text[:500]

# --- Routes ---
@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    file_bytes = await file.read()
    if file.filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf_bytes(file_bytes)
    else:
        text = extract_text_from_image_bytes(file_bytes)
    return {"text": text[:8000]}

@app.post("/summarize")
async def summarize(file: UploadFile = File(...), length: str = Form("medium")):
    file_bytes = await file.read()
    if file.filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf_bytes(file_bytes)
    else:
        text = extract_text_from_image_bytes(file_bytes)
    summary = summarize_text(text, length)
    return {"text": text[:1000], "summary": summary}
