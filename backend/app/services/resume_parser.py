import json
from io import BytesIO
from typing import Dict, Any
from google import genai
from pypdf import PdfReader
from docx import Document
from ..core.config import GOOGLE_API_KEY, MODEL_ID

client = genai.Client(api_key=GOOGLE_API_KEY)

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(file_content: bytes) -> str:
        pdf_reader = PdfReader(BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text

    @staticmethod
    def extract_text_from_docx(file_content: bytes) -> str:
        doc = Document(BytesIO(file_content))
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text

    async def parse_resume(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        file_ext = filename.split('.')[-1].lower()
        
        if file_ext == 'pdf':
            text = self.extract_text_from_pdf(file_content)
        elif file_ext in ['docx', 'doc']:
            text = self.extract_text_from_docx(file_content)
        else:
            raise ValueError("Unsupported file format")

        if not text.strip():
            raise ValueError("Could not extract text from the resume")

        # Use Gemini to extract structured data
        prompt = f"""
        Extract the following information from this resume and return it as a pure JSON object.
        Do NOT include any markdown formatting or explanations. Just the raw JSON.
        
        Structure:
        {{
            "name": "string",
            "email": "string",
            "phone": "string",
            "skills": ["string", ...],
            "experience": [{{ "company": "string", "role": "string", "duration": "string" }}, ...],
            "education": [{{ "institution": "string", "degree": "string", "year": "string" }}, ...],
            "summary": "string"
        }}

        Resume Text:
        {text}
        """

        response = await client.aio.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        
        # Clean the response to ensure it's valid JSON
        result_text = response.text.replace('```json', '').replace('```', '').strip()
        try:
            parsed_json = json.loads(result_text)
        except:
            parsed_json = {"raw_text": result_text}

        return {
            "parsed_data": parsed_json,
            "filename": filename,
            "raw_text": text[:1000]
        }
