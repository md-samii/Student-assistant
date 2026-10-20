import { GoogleGenAI } from '@google/genai';
import prisma from '../config/prisma';
import { generateWithRetry } from '../utils/gemini';

export interface GeneratedQuestion {
    id?: string;
    questionText: string;
    options: string[];
    correctOption: number;
    explanation: string;
}

export interface GeneratedQuiz {
    title: string;
    description: string;
    questions: GeneratedQuestion[];
}

const getGeminiClient = (): GoogleGenAI => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.includes('your_actual_gemini_api_key')) {
        throw new Error('GEMINI_API_KEY is missing from the backend environment.');
    }

    return new GoogleGenAI({ apiKey });
};

const validateQuestions = (value: unknown): value is GeneratedQuiz => {
    if (!value || typeof value !== 'object') return false;

    const quiz = value as GeneratedQuiz;

    return (
        typeof quiz.title === 'string' &&
        typeof quiz.description === 'string' &&
        Array.isArray(quiz.questions) &&
        quiz.questions.length > 0 &&
        quiz.questions.every((q) =>
            typeof q.questionText === 'string' &&
            q.questionText.trim().length > 0 &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            q.options.every(
                (option) => typeof option === 'string' && option.trim().length > 0
            ) &&
            Number.isInteger(q.correctOption) &&
            q.correctOption >= 0 &&
            q.correctOption <= 3 &&
            typeof q.explanation === 'string' &&
            q.explanation.trim().length > 0
        )
    );
};

export async function generateQuizQuestionsOnly(
    subjectCode: string,
    moduleNumber: number,
    questionCount: number,
    difficulty: string
): Promise<{ subject: any; generated: GeneratedQuiz }> {
    if (!Number.isInteger(moduleNumber) || moduleNumber < 1) {
        throw new Error('moduleNumber must be a positive integer.');
    }

    if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 20) {
        throw new Error('questionCount must be between 1 and 20.');
    }

    const subject = await prisma.subject.findUnique({
        where: { code: subjectCode },
    });

    if (!subject) {
        throw new Error(`Subject code "${subjectCode}" was not found.`);
    }

    const resources = await prisma.studyResource.findMany({
        where: {
            subjectId: subject.id,
            moduleNumber,
            type: 'PDF_NOTES',
        },
        include: {
            chunks: {
                orderBy: { chunkIndex: 'asc' },
            },
        },
    });

    const noteContext = resources
        .map((resource) =>
            resource.chunks
                .map((chunk) => `[${resource.title}]\n${chunk.content}`)
                .join('\n\n')
        )
        .join('\n\n---\n\n')
        .slice(0, 24000);

    const hasNotes = Boolean(noteContext.trim());

    const gemini = getGeminiClient();

    const prompt = `
Create exactly ${questionCount} university-level multiple-choice questions for engineering students.

Subject: ${subject.name} (${subject.code})
Module: ${moduleNumber}
Difficulty: ${difficulty}

${hasNotes
            ? `Use the supplied notes as the primary factual basis.
Do not invent syllabus-specific facts or rely on unsupported claims.

STUDY NOTES:
${noteContext}`
            : `Generate authentic, curriculum-accurate university engineering examination questions for this subject and module.`}

Requirements:
1. Create exactly ${questionCount} distinct multiple choice questions.
2. Each question must have exactly four distinct options and exactly one correct option.
3. The correctOption field must be a zero-based index: 0, 1, 2, or 3.
4. Explanations must be thorough, clear, and scientifically/technically accurate.

Return only valid JSON in this format:
{
  "title": "${subject.name} - Module ${moduleNumber} Practice Quiz",
  "description": "Comprehensive practice questions for ${subject.name} Module ${moduleNumber} (${difficulty} level).",
  "questions": [
    {
      "questionText": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": 0,
      "explanation": "Detailed explanation of why this answer is correct"
    }
  ]
}
`;

    const response = await generateWithRetry(gemini, {
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
        },
    });

    const responseText = response.text;

    if (!responseText) {
        throw new Error('Gemini returned an empty response.');
    }

    let generated: unknown;

    try {
        generated = JSON.parse(responseText);
    } catch {
        throw new Error('Gemini returned invalid JSON. Please try generating the quiz again.');
    }

    if (!validateQuestions(generated)) {
        throw new Error('Gemini returned an invalid quiz structure. Please try again.');
    }

    if (generated.questions.length !== questionCount) {
        if (generated.questions.length > questionCount) {
            generated.questions = generated.questions.slice(0, questionCount);
        } else {
            throw new Error(
                `Gemini generated ${generated.questions.length} questions instead of ${questionCount}. Please try again.`
            );
        }
    }

    return { subject, generated };
}

export async function generateQuizFromNotes(
    creatorId: string,
    subjectCode: string,
    moduleNumber: number,
    questionCount: number,
    difficulty: string
) {
    const { subject, generated } = await generateQuizQuestionsOnly(
        subjectCode,
        moduleNumber,
        questionCount,
        difficulty
    );

    const savedQuiz = await prisma.quiz.create({
        data: {
            title: generated.title.trim(),
            description: generated.description.trim(),
            subjectId: subject.id,
            creatorId,
            moduleNumber,
            timeLimitMin: Math.max(5, questionCount),
            totalMarks: questionCount,
            questions: {
                create: generated.questions.map((question) => ({
                    questionText: question.questionText.trim(),
                    options: JSON.stringify(question.options),
                    correctOption: question.correctOption,
                    explanation: question.explanation.trim(),
                })),
            },
        },
        include: {
            subject: true,
            questions: true,
        },
    });

    return {
        id: savedQuiz.id,
        title: savedQuiz.title,
        description: savedQuiz.description,
        subjectCode: savedQuiz.subject.code,
        subjectName: savedQuiz.subject.name,
        moduleNumber: savedQuiz.moduleNumber,
        timeLimitMin: savedQuiz.timeLimitMin,
        totalMarks: savedQuiz.totalMarks,
        questionsCount: savedQuiz.questions.length,
    };
}
