📘 DocuSense – Document Summary Assistant

AI-powered document assistant that extracts text from PDFs or images and generates concise summaries using NLP.

Frontend: React + Vite + TailwindCSS
Backend: FastAPI + Hugging Face Transformers + Tesseract OCR + pdfplumber

✨ Features

📂 Upload PDFs or images (JPG, PNG, etc.)

🔍 Extracts text via pdfplumber or OCR (Tesseract + Poppler)

🤖 Generates summaries using BART (distilbart-cnn-12-6)

🎨 Modern UI with drag-and-drop support

📋 Copy extracted text or summary to clipboard

⚡ Project Structure
DocuSense-Document_Summary_Assistant/
│
├── frontend/            # React + Vite + Tailwind
│   ├── src/App.jsx      # Main React component
│   └── ...
│
├── backend/
│   ├── main.py          # FastAPI backend
│   └── requirements.txt # Python dependencies
│
└── README.md            # This file

🛠️ Setup Instructions
1. Clone the repo
git clone https://github.com/Sunaila-Amin/DocuSense-Document_Summary_Assistant.git
cd DocuSense-Document_Summary_Assistant

2. Backend Setup (FastAPI)
🔹 Install dependencies

Create a virtual environment:

cd backend
python -m venv venv
source venv/bin/activate   # (Linux/Mac)
venv\Scripts\activate      # (Windows)


Install packages:

pip install -r requirements.txt

🔹 Install Tesseract & Poppler

Windows:

Download Tesseract
 and install it.

Download Poppler
 and add bin/ to PATH.

Linux (Ubuntu/Debian):

sudo apt install tesseract-ocr poppler-utils


Mac:

brew install tesseract poppler

🔹 Run the backend
uvicorn main:app --reload --host 0.0.0.0 --port 5000


API will run on: http://127.0.0.1:5000

3. Frontend Setup (React + Vite)
🔹 Install dependencies
cd ../frontend
npm install

🔹 Start the frontend
npm run dev


Frontend will run on: http://127.0.0.1:5173

🚀 Deployment
🔹 Backend Deployment

You can deploy FastAPI on:

Render (free tier)

Railway

Azure App Service

Heroku (via Docker)

Make sure to:

Add requirements.txt in backend.

Change CORS in main.py to allow your frontend URL.

Example:

allow_origins = ["*"]  # or your deployed frontend URL

🔹 Frontend Deployment

You can deploy on:

Vercel

Netlify

GitHub Pages

Steps for Vercel:

cd frontend
npm run build


Then deploy the dist/ folder on Vercel.

⚠️ Update axios.post("http://127.0.0.1:5000/...") inside App.jsx with your backend URL (e.g., https://your-backend.onrender.com).

📌 Example Workflow

Upload a PDF or image.

Click Extract Text → Extracted text will appear.

Choose Summary length (short/medium/long).

Click Summarize → AI generates summary.

Copy text/summary to clipboard.

🧰 Tech Stack

Frontend: React, Vite, TailwindCSS

Backend: FastAPI, Transformers, Tesseract, pdfplumber

ML Model: sshleifer/distilbart-cnn-12-6

Deployment: Vercel + Render (recommended)

🙌 Contributing

Pull requests are welcome!

📜 License

MIT License © 2025 Sunaila Amin
