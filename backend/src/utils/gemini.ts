import { GoogleGenAI } from '@google/genai';
import type { GenerateContentParameters } from '@google/genai';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const errText = (err: any) => String(err?.message || err);

const isOverloaded = (err: any) =>
    err?.status === 503 || errText(err).includes('UNAVAILABLE');

const isSwitchable = (err: any) =>
    isOverloaded(err) ||
    err?.status === 429 ||
    err?.status === 404 ||
    errText(err).includes('RESOURCE_EXHAUSTED');

export async function generateWithRetry(
    gemini: GoogleGenAI,
    params: Omit<GenerateContentParameters, 'model'>
) {
    const primary = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const fallback = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite';
    const models = [...new Set([primary, fallback])];

    let lastError: unknown;

    for (const model of models) {
        for (let attempt = 0; attempt <= 2; attempt++) {
            try {
                console.log(`[Gemini] model=${model} attempt=${attempt + 1}`);
                return await gemini.models.generateContent({ ...params, model });
            } catch (err) {
                lastError = err;
                // Retry the same model only for temporary overload
                if (isOverloaded(err) && attempt < 2) {
                    await sleep(1500 * (attempt + 1));
                    continue;
                }
                // Real errors (bad request, etc.) should not try another model
                if (!isSwitchable(err)) throw err;
                break; // move to the fallback model
            }
        }
    }

    throw lastError;
}