
'use server';
/**
 * @fileOverview An AI flow to generate a quiz from source text.
 * 
 * - generateQuiz - A function that creates a quiz.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const QuestionSchema = z.object({
    questionText: z.string().describe("The text of the quiz question."),
    options: z.array(z.string()).length(4).describe("An array of exactly four possible answers."),
    correctAnswerIndex: z.number().min(0).max(3).describe("The index (0-3) of the correct answer in the options array."),
    explanation: z.string().describe("A brief explanation of why the correct answer is right.")
});

const GenerateQuizInputSchema = z.object({
    sourceText: z.string().describe("The source material to generate the quiz from."),
    numQuestions: z.number().min(1).max(10).describe("The number of questions to generate."),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
    questions: z.array(QuestionSchema).describe("The array of generated quiz questions."),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
    return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateQuizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `You are a helpful assistant that creates educational quizzes. Based on the provided source text, generate a multiple-choice quiz with the specified number of questions.

    **Instructions:**
    1.  Create exactly {{{numQuestions}}} questions.
    2.  Each question must have exactly four options.
    3.  For each question, identify the correct answer and provide its index (0-3).
    4.  For each question, provide a brief explanation for the correct answer.
    5.  The questions should be relevant to the key concepts in the source text.
    6.  The options should be plausible, with one clear correct answer.

    **Source Text:**
    ---
    {{{sourceText}}}
    ---
    `,
});

const generateQuizFlow = ai.defineFlow(
    {
        name: 'generateQuizFlow',
        inputSchema: GenerateQuizInputSchema,
        outputSchema: GenerateQuizOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
