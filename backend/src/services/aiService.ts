import { GoogleGenAI } from '@google/genai';
import prisma from '../config/prisma';



const cleanRetrievedText = (text: string): string => {
  return text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => {
      const normalized = line.toLowerCase();

      // Remove repeated PDF headers, footers, and page labels.
      if (normalized === 'vtucircle.com') return false;
      if (/^bcs601 cloud computing module-?1$/.test(normalized)) {
        return false;
      }
      if (/^pg\.?\s*\d+$/.test(normalized)) return false;
      if (/^page\s+\d+$/.test(normalized)) return false;

      return true;
    })
    .join('\n')
    // Remove excessive blank lines.
    .replace(/\n{3,}/g, '\n\n')
    // Keep numbered headings and list items visually separated.
    .replace(/([.!?])\s+(\d+\.\s+[A-Z])/g, '$1\n$2')
    .trim();
};


const formatFallbackNotes = (text: string): string => {
  return text
    // Separate numbered items when PDF extraction puts them on one line.
    .replace(
      /(^|\n)\s*(\d+)\.\s+/g,
      (_match, prefix: string, number: string) =>
        `${prefix}${number}. `
    )
    // Ensure consecutive service-model headings have distinct numbers.
    .replace(
      /(^|\n)\s*1\.\s+(Platform as a Service)/gi,
      '$1 2. $2'
    )
    .replace(
      /(^|\n)\s*1\.\s+(Software as a Service)/gi,
      '$1 3. $2'
    )
    .trim();
};


export interface AIResponsePayload {
  explanation: string;
  keyPoints: string[];
  realWorldExample?: string;
  codeSnippet?: string;
  language?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  commonMistakes?: string[];
  interviewQuestions?: string[];
  summary: string;
  sources?: {
    resourceId: string;
    title: string;
    moduleNumber: number;
    chunkIndex: number;
    url: string;
  }[];

}

export interface StudentContext {
  university: string;
  branch: string;
  semester: number;
  subject?: string;
  mode?: 'THEORY' | 'CODE' | 'LAB' | 'INTERVIEW' | 'PYQ';
}



const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your_actual_gemini_api_key')) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
};



const retrieveRelevantNotes = async (
  question: string,
  subjectName: string
): Promise<{
  context: string;
  sources: {
    resourceId: string;
    title: string;
    moduleNumber: number;
    chunkIndex: number;
    url: string;
  }[];
}> => {

  const stopWords = new Set([
    'what', 'why', 'how', 'when', 'where', 'which', 'who',
    'explain', 'describe', 'define', 'give', 'show', 'tell',
    'the', 'and', 'for', 'from', 'with', 'that', 'this',
    'are', 'was', 'were', 'can', 'could', 'would', 'should',
    'into', 'about', 'using', 'used', 'use', 'its', 'is',
    'according', 'notes', 'note', 'please', 'based', 'upon',
    'my', 'uploaded', 'source', 'sources', 'cite',
  ]);

  const questionTerms = question
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];

  const keywords = [
    ...new Set(
      questionTerms.filter(
        (word) => word.length >= 3 && !stopWords.has(word)
      )
    ),
  ];

  if (keywords.length === 0) {
    return { context: '', sources: [] };
  }


  const resources = await prisma.studyResource.findMany({
    where: {
      subject: {
        is: {
          name: {
            contains: subjectName.trim(),
            mode: 'insensitive',
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      moduleNumber: true,
      driveUrl: true,
    },
  });


  if (resources.length === 0) {
    return { context: '', sources: [] };
  }

  // Load chunks belonging only to the selected subject's resources.
  const chunks = await prisma.resourceChunk.findMany({
    where: {
      resourceId: {
        in: resources.map(resource => resource.id)
      }
    },
    select: {
      resourceId: true,
      content: true,
      chunkIndex: true,
      resource: {
        select: {
          title: true,
          moduleNumber: true,
          driveUrl: true
        }
      }
    }
  });

  if (chunks.length === 0) {
    return { context: '', sources: [] };
  }

  const normalizedQuestion = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  // Score chunks by keyword relevance.

  // Score chunks by keyword relevance.
  const scored = chunks.map((chunk) => {
    const cleanedContent = cleanRetrievedText(chunk.content);
    const text = cleanedContent.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = text.match(
        new RegExp(`\\b${escaped}\\b`, 'g')
      );

      if (matches) {
        // Give longer, more specific terms greater weight.
        const termWeight =
          keyword.length >= 8 ? 3 : keyword.length >= 5 ? 2 : 1;

        // Limit the influence of repeated words.
        score += Math.min(matches.length, 3) * termWeight;
      }
    }

    // Prioritize chunks containing the complete question.
    if (
      normalizedQuestion.length >= 5 &&
      text.replace(/[^a-z0-9]+/g, ' ').includes(normalizedQuestion)
    ) {
      score += 20;
    }

    // Reward chunks containing the first two question keywords.
    if (
      keywords.length >= 2 &&
      text.includes(keywords[0]) &&
      text.includes(keywords[1])
    ) {
      score += 8;
    }

    return { ...chunk, score };
  });


  const ranked = scored
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score);

  // Keep only chunks with a strong relevance score.
  const relevantChunks = ranked.filter(
    chunk => chunk.score >= 8
  );


  if (relevantChunks.length === 0) {
    return { context: '', sources: [] };
  }

  // Include neighboring chunks to preserve context at boundaries.

  // Select the strongest matches and only useful neighboring chunks.

  // Select only the strongest matching chunks.
  // This prevents unrelated neighboring passages from entering the context.

  // Select only the three highest-ranked matching chunks.
  const selected = new Map<string, (typeof chunks)[number]>();

  const topMatches = relevantChunks.slice(0, 3);

  for (const match of topMatches) {
    selected.set(
      `${match.resourceId}:${match.chunkIndex}`,
      match
    );
  }

  const ordered = [...selected.values()].sort((a, b) => {
    if (a.resourceId !== b.resourceId) {
      return a.resourceId.localeCompare(b.resourceId);
    }

    return a.chunkIndex - b.chunkIndex;
  });


  // Return the three highest-ranked sources with their resource URLs.
  const sources = ranked.slice(0, 3).map(chunk => ({
    resourceId: chunk.resourceId,
    title: chunk.resource.title,
    moduleNumber: chunk.resource.moduleNumber,
    chunkIndex: chunk.chunkIndex,
    url: chunk.resource.driveUrl
  }));


  const seenContent = new Set<string>();

  const context = ordered
    .map((chunk) => {
      const cleaned = cleanRetrievedText(chunk.content);

      // Normalize whitespace to identify repeated passages.
      const normalized = cleaned
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

      // Skip exact duplicate chunks after cleaning.
      if (!normalized || seenContent.has(normalized)) {
        return null;
      }

      seenContent.add(normalized);

      return `[Source: ${chunk.resource.title}, Module ${chunk.resource.moduleNumber}, Chunk ${chunk.chunkIndex}]\n${cleaned}`;
    })
    .filter((item): item is string => item !== null)
    .join('\n\n---\n\n');


  console.log(
    `[RAG] Ranked ${ranked.length} matching chunks; selected ${ordered.length}.`
  );
  console.log(
    '[RAG] Top ranked chunks:',
    ranked.slice(0, 10).map((chunk) => ({
      title: chunk.resource.title,
      chunkIndex: chunk.chunkIndex,
      score: chunk.score,
    }))
  );

  console.log(
    '[RAG] Selected chunks:',
    ordered.map(chunk => ({
      title: chunk.resource.title,
      chunkIndex: chunk.chunkIndex,
      score: scored.find(
        item =>
          item.resourceId === chunk.resourceId &&
          item.chunkIndex === chunk.chunkIndex
      )?.score ?? 0
    }))
  );

  return { context, sources };
};



export const generateAcademicAIResponse = async (
  question: string,
  context: StudentContext
): Promise<AIResponsePayload> => {
  const gemini = getGeminiClient();
  const subjectName = context.subject || 'Computer Science Core';
  const mode = context.mode || 'THEORY';

  let notesContext = '';
  let noteSources: {
    resourceId: string;
    title: string;
    moduleNumber: number;
    chunkIndex: number;
    url: string;
  }[] = [];

  try {
    const retrieved = await retrieveRelevantNotes(
      question,
      subjectName
    );

    notesContext = retrieved.context;
    noteSources = retrieved.sources;

    console.log(
      `[RAG] Subject: ${subjectName} | Chunks found: ${notesContext ? notesContext.split('\n\n---\n\n').length : 0
      }`
    );
    console.log('[RAG] Context sent to Gemini:\n', notesContext);
  } catch (error) {
    console.error('[RAG] Notes retrieval failed:', error);
  }

  if (gemini) {
    try {
      const systemPrompt = `
You are an AI Academic Assistant for university engineering students.

Student context:
- University: ${context.university}
- Branch: ${context.branch}
- Semester: ${context.semester}
- Subject: ${subjectName}
- Mode: ${mode}

The student's question:
${question}

Retrieved study notes:
${notesContext || 'No relevant notes were found for this question.'}



Instructions:
1. Treat the retrieved study notes as the primary source for the answer.
2. Read all retrieved passages before deciding whether the topic is covered.
3. Under "According to your notes", include only information directly supported by the retrieved passages.
4. If the notes provide partial information, clearly state what they support and what they do not specify.
5. Put relevant information beyond the retrieved notes under a separate heading, "Additional explanation".
6. Clearly distinguish general academic knowledge from information taken from the notes.
7. If the retrieved notes do not contain the answer, acknowledge this explicitly before providing any relevant general academic explanation.
8. Never invent facts, quotations, page numbers, or claims about what the notes contain.
9. Keep the retrieved resource citations and source links attached to the response.
10. Explain concepts clearly at an engineering-student level.
11. Return only a valid JSON object with the required response fields.

{
  "explanation": "Step-by-step explanation",
  "keyPoints": ["Key point 1"],
  "realWorldExample": "Practical example or empty string",
  "codeSnippet": "Working code or empty string",
  "language": "Programming language or empty string",
  "timeComplexity": "Time complexity or empty string",
  "spaceComplexity": "Space complexity or empty string",
  "commonMistakes": ["Common mistake"],
  "interviewQuestions": ["Relevant question"],
  "summary": "Short takeaway"
}
Use empty strings and empty arrays for inapplicable fields.
`;

      const response = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: question,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const content = response.text;

      if (!content) {
        throw new Error('Gemini returned an empty response.');
      }

      const parsed = JSON.parse(content);

      return {
        sources: noteSources,
        explanation: parsed.explanation || 'No explanation was returned.',
        keyPoints: Array.isArray(parsed.keyPoints)
          ? parsed.keyPoints
          : [],
        realWorldExample: parsed.realWorldExample || '',
        codeSnippet: parsed.codeSnippet || '',
        language: parsed.language || '',
        timeComplexity: parsed.timeComplexity || '',
        spaceComplexity: parsed.spaceComplexity || '',
        commonMistakes: Array.isArray(parsed.commonMistakes)
          ? parsed.commonMistakes
          : [],
        interviewQuestions: Array.isArray(parsed.interviewQuestions)
          ? parsed.interviewQuestions
          : [],
        summary: parsed.summary || 'Summary takeaway.'
      };
    } catch (error) {
      console.warn(
        'Gemini API call failed; using academic fallback:',
        error
      );
    }
  }


  // If Gemini is unavailable, answer using retrieved note passages.
  if (notesContext.trim()) {
    return {


      explanation:
        `## According to your notes\n\n` +
        `AI generation is temporarily unavailable, so the following is source material rather than a generated explanation.\n\n` +
        formatFallbackNotes(notesContext) +
        `\n\n## Additional explanation\n\n` +
        `A generated explanation could not be provided because the AI service is temporarily unavailable. Please try again later.\n\n` +
        `**Source note:** The passages above are retrieved directly from your study notes; they have not been independently verified.`,

      keyPoints: [],
      realWorldExample: '',
      codeSnippet: '',
      language: '',
      timeComplexity: '',
      spaceComplexity: '',
      commonMistakes: [],
      interviewQuestions: [],
      summary:
        'Review the retrieved note passages above. A generated summary is unavailable while the AI service is offline.',
      sources: noteSources,
    };
  }

  const fallback = generateFallbackResponse(
    question,
    subjectName,
    mode
  );

  fallback.explanation +=
    '\n\nNote: AI generation is unavailable and no relevant note passages were found. This fallback has not been verified against your notes.';

  return {
    ...fallback,
    sources: noteSources,
  };

  // Preserve the original response structure and identify fallback output.
  if (noteSources.length > 0) {
    fallback.explanation +=
      '\n\nNote: The notes were retrieved, but the AI service was unavailable. This response was generated by the local fallback and has not been verified against those notes.';
  }

  return {
    ...fallback,
    sources: noteSources,
  };
};



const generateFallbackResponse = (
  question: string,
  subject: string,
  mode: string
): AIResponsePayload => {
  const lower = question.toLowerCase();

  if (lower.includes('deadlock') || subject.toLowerCase().includes('operating')) {
    return {
      explanation:
        'A Deadlock occurs in an Operating System when two or more processes are blocked indefinitely, each holding a resource while waiting for another resource held by another process in the set.',
      keyPoints: [
        'Mutual Exclusion: At least one resource must be held in a non-shareable mode.',
        'Hold and Wait: A process holds at least one resource and waits for another.',
        'No Preemption: Resources cannot be forcibly taken from a process.',
        'Circular Wait: A closed chain of processes exists where each process waits for a resource held by the next.',
      ],
      realWorldExample:
        'Imagine a narrow four-way intersection with four cars arriving simultaneously from all four directions. Each car blocks the car behind it, creating a complete traffic gridlock.',
      codeSnippet: `// Example: Standard Banker's Algorithm Safety Check Pseudocode
bool isSafeState(int processes[], int avail[], int max[][], int alloc[][]) {
    int need[P][R];
    for (int i = 0; i < P; i++)
        for (int j = 0; j < R; j++)
            need[i][j] = max[i][j] - alloc[i][j];

    bool finish[P] = {0};
    int safeSeq[P];
    int work[R];
    for (int i = 0; i < R; i++) work[i] = avail[i];

    int count = 0;
    while (count < P) {
        bool found = false;
        for (int p = 0; p < P; p++) {
            if (finish[p] == 0) {
                int j;
                for (j = 0; j < R; j++)
                    if (need[p][j] > work[j]) break;

                if (j == R) {
                    for (int k = 0; k < R; k++) work[k] += alloc[p][k];
                    safeSeq[count++] = p;
                    finish[p] = 1;
                    found = true;
                }
            }
        }
        if (!found) return false; // System is in Deadlock state
    }
    return true; // System is Safe
}`,
      language: 'cpp',
      timeComplexity: 'O(R * P^2)',
      spaceComplexity: 'O(R * P)',
      commonMistakes: [
        'Confusing Deadlock with Starvation (Starvation is indefinite delay, Deadlock is permanent lock).',
        'Forgetting that removing any ONE of the 4 Coffman conditions breaks the deadlock.',
      ],
      interviewQuestions: [
        'What are the 4 Coffman conditions required for a deadlock to occur?',
        'How does Banker’s Algorithm prevent deadlocks in an OS?',
        'Explain the difference between Deadlock Prevention, Avoidance, and Detection.',
      ],
      summary:
        'Deadlock is a critical OS condition requiring Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. It is handled via Prevention, Avoidance (Banker’s Algorithm), or Detection.',
    };
  }

  if (lower.includes('binary search') || lower.includes('sort') || lower.includes('search') || mode === 'CODE') {
    return {
      explanation:
        'Binary Search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item until you have narrowed down the possible locations to just one.',
      keyPoints: [
        'Prerequisite: The input array MUST be sorted.',
        'Uses Divide and Conquer strategy.',
        'Compares target value with middle element of array at each iteration.',
      ],
      realWorldExample:
        'Searching for a contact name in a printed physical phone book by opening directly to the middle page and discarding half the book based on alphabetical order.',
      codeSnippet: `int binarySearch(int arr[], int size, int target) {
    int low = 0;
    int high = size - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2; // Prevents integer overflow

        if (arr[mid] == target)
            return mid; // Target found
        else if (arr[mid] < target)
            low = mid + 1; // Search right half
        else
            high = mid - 1; // Search left half
    }
    return -1; // Target not found
}`,
      language: 'cpp',
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1) Iterative / O(log N) Recursive',
      commonMistakes: [
        'Calculating mid as (low + high) / 2 instead of low + (high - low) / 2, causing potential integer overflow.',
        'Applying Binary Search on an unsorted array without sorting first.',
      ],
      interviewQuestions: [
        'Why is mid calculated as low + (high - low) / 2?',
        'How do you adapt Binary Search to find the first occurrence of a duplicate element?',
        'Can Binary Search be implemented on a Singly Linked List? What is the time complexity?',
      ],
      summary:
        'Binary Search runs in O(log N) logarithmic time on sorted collections by repeatedly halving the search space.',
    };
  }

  // Generic Academic Solution Synthesis
  return {
    explanation: `Here is a structured academic solution for "${question}" tailored to ${subject} (Semester 5 syllabus):`,
    keyPoints: [
      `Core Concept: ${question} is a fundamental topic in ${subject}.`,
      'Key Theory: Requires systematic analysis, standard definition, and step-by-step problem breakdown.',
      'Exam Relevance: Highly frequently asked in semester examinations and technical interviews.',
    ],
    realWorldExample:
      'In production software engineering, this concept is applied to ensure optimal performance, scalability, and clean system architecture.',
    codeSnippet: `// Solution Implementation Example
#include <iostream>
using namespace std;

void solveAcademicProblem() {
    cout << "Executing algorithm for: ${question}" << endl;
}

int main() {
    solveAcademicProblem();
    return 0;
}`,
    language: 'cpp',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    commonMistakes: [
      'Omitting edge case handling (e.g. null inputs or bounds check).',
      'Forgetting to mention time and space complexities in exam answers.',
    ],
    interviewQuestions: [
      `Explain the core mechanism of ${question} with a real-world scenario.`,
      `How would you optimize the solution for ${question} under memory constraints?`,
    ],
    summary: `Understanding ${question} provides a solid foundation for ${subject} and technical assessments.`,
  };
};
