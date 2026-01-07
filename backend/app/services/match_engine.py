import json
from typing import Dict, Any, List
from google import genai
from ..core.config import GOOGLE_API_KEY, MODEL_ID

client = genai.Client(api_key=GOOGLE_API_KEY)

class MatchEngine:
    async def calculate_score(self, resume_data: str, jd_data: str) -> Dict[str, Any]:
        prompt = f"""
        Compare the following Resume and Job Description (JD). 
        Calculate a match score from 0 to 100 based on skills, experience, and educational alignment.
        Also provide a brief justification for the score.

        Resume Data:
        {resume_data}

        Job Description Data:
        {jd_data}

        Return the result as a JSON object:
        {{
            "score": <int>,
            "justification": "<string>",
            "missing_skills": [<list of strings>],
            "matching_skills": [<list of strings>]
        }}
        """
        response = await client.aio.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        
        # Clean and parse JSON
        result_text = response.text.replace('```json', '').replace('```', '').strip()
        try:
            parsed_json = json.loads(result_text)
        except:
            parsed_json = {"score": 0, "justification": "Error parsing response"}

        return {"result": parsed_json}

    async def generate_questions(self, resume_data: str, jd_data: str) -> List[str]:
        prompt = f"""
        Based on the Resume and Job Description provided, generate 5-10 highly relevant interview questions.
        Return the questions as a PURE JSON list of strings. Do NOT include markdown formatting.

        Format: ["question 1", "question 2", ...]

        Resume Data:
        {resume_data}

        Job Description Data:
        {jd_data}
        """
        response = await client.aio.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        
        # Clean and parse JSON
        result_text = response.text.replace('```json', '').replace('```', '').strip()
        try:
            parsed_json = json.loads(result_text)
        except:
            parsed_json = []

        return {"questions": parsed_json}

    async def generate_answer(self, question: str, resume_data: str, jd_data: str) -> str:
        prompt = f"""
        Generate a professional and tailored answer to the following interview question, 
        using the user's resume context and the job description requirements.

        Question: {question}

        Resume Data:
        {resume_data}

        Job Description Data:
        {jd_data}

        Return the answer as a string.
        """
        response = await client.aio.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        return {"answer": response.text}

    async def tailor_resume(self, resume_data: str, jd_data: str) -> Dict[str, Any]:
        prompt = f"""
        Analyze the Resume and Job Description (JD). 
        Provide 3-5 specific suggestions on how to tailor the resume for this specific job.
        Focus on:
        1. Keywords to add from the JD.
        2. Experience points to highlight or rephrase.
        3. Skills to emphasize.

        Resume Data:
        {resume_data}

        Job Description Data:
        {jd_data}

        Return the result as a JSON object:
        {{
            "suggestions": [
                {{ "category": "string", "advice": "string", "rephrased_text": "optional string" }},
                ...
            ]
        }}
        """
        response = await client.aio.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        result_text = response.text.replace('```json', '').replace('```', '').strip()
        try:
            parsed_json = json.loads(result_text)
        except:
            parsed_json = {"suggestions": [{"category": "Error", "advice": "Could not generate suggestions"}]}
        return parsed_json

    async def generate_cover_letter(self, resume_data: str, jd_data: str) -> str:
        prompt = f"""
        Write a professional, compelling, and tailored cover letter based on the Resume and Job Description.
        The cover letter should be about 250-400 words.
        It should highlight specific skills and experiences from the resume that match the JD requirements.

        Resume Data:
        {resume_data}

        Job Description Data:
        {jd_data}

        Return the cover letter text.
        """
        response = await client.aio.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        return {"cover_letter": response.text}
