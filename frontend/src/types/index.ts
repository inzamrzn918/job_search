export type ResumeData = {
    id?: number;
    parsed_data: {
        name: string;
        email: string;
        phone: string;
        skills: string[];
        experience: { company: string; role: string; duration: string }[];
        education: { institution: string; degree: string; year: string }[];
        summary: string;
    };
    filename: string;
    raw_text: string;
}

export type JobDetails = {
    id?: number;
    url?: string;
    parsed_data: {
        title: string;
        company: string;
        location: string;
        description: string;
        skills: string[];
        responsibilities: string[];
        salary: string;
    };
    raw_text: string;
    status?: string;
    interview_date?: string;
    interview_notes?: string;
}

export type MatchResult = {
    result: {
        score: number;
        justification: string;
        missing_skills: string[];
        matching_skills: string[];
    };
}

export type QuestionsResult = {
    questions: string[];
}

export type AnswerResult = {
    answer: string;
}

export type TailorResult = {
    suggestions: { category: string; advice: string; rephrased_text?: string }[];
}

export type CoverLetterResult = {
    cover_letter: string;
}

export type Job = {
    id: string;
    title: string;
    company: string;
    location: string;
    score: number;
    status: 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
    interview_date?: string;
    interview_notes?: string;
    details?: JobDetails;
}
