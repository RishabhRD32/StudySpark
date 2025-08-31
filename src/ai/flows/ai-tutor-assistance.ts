'use server';

/**
 * @fileOverview An AI tutor assistance flow that answers questions about course material.
 *
 * - aiTutorAssistance - A function that handles the AI tutor assistance process.
 * - AiTutorAssistanceInput - The input type for the aiTutorAssistance function.
 * - AiTutorAssistanceOutput - The return type for the aiTutorAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTutorAssistanceInputSchema = z.object({
  question: z.string().describe('The question about the course material.'),
  courseMaterial: z.string().optional().describe('Optional course material to provide context for the answer.'),
});
export type AiTutorAssistanceInput = z.infer<typeof AiTutorAssistanceInputSchema>;

const AiTutorAssistanceOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AiTutorAssistanceOutput = z.infer<typeof AiTutorAssistanceOutputSchema>;

export async function aiTutorAssistance(input: AiTutorAssistanceInput): Promise<AiTutorAssistanceOutput> {
  return aiTutorAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorAssistancePrompt',
  input: {schema: AiTutorAssistanceInputSchema},
  output: {schema: AiTutorAssistanceOutputSchema},
  prompt: `You are an AI tutor, skilled at explaining complex topics in simple terms. Your goal is to provide a clear and concise answer to the student's question.

  {{#if courseMaterial}}
  Use the following course material as the primary source of information to answer the question. Ground your answer in this material.
  ---
  Course Material:
  {{{courseMaterial}}}
  ---
  {{/if}}

  Answer the following question to the best of your ability:

  Question: {{{question}}}`,
});

const aiTutorAssistanceFlow = ai.defineFlow(
  {
    name: 'aiTutorAssistanceFlow',
    inputSchema: AiTutorAssistanceInputSchema,
    outputSchema: AiTutorAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
