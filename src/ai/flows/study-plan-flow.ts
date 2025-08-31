
'use server';
/**
 * @fileOverview An AI flow to generate a personalized study plan for students.
 * 
 * - generateStudyPlan - A function that creates a study plan.
 * - GenerateStudyPlanInput - The input type for the generateStudyPlan function.
 * - GenerateStudyPlanOutput - The return type for the generateStudyPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStudyPlanInputSchema = z.object({
    subjectTitles: z.array(z.string()).describe("The titles of the subjects to include in the plan."),
    weeklyHours: z.number().describe("The total number of hours the student can study per week."),
    deadlines: z.string().optional().describe("Any upcoming exams or deadlines for the subjects."),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const StudySessionSchema = z.object({
    subjectTitle: z.string().describe("The title of the subject for this study session."),
    day: z.string().describe("The day of the week for the session (e.g., Monday, Tuesday)."),
    time: z.string().describe("The start and end time for the session (e.g., '10:00 AM - 11:30 AM')."),
    topic: z.string().describe("The specific topic or chapter to study during this session."),
    description: z.string().describe("A brief description of the goal or activity for the session."),
});

const GenerateStudyPlanOutputSchema = z.object({
    plan: z.array(StudySessionSchema).describe("The generated weekly study plan, broken down by sessions."),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
    return generateStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateStudyPlanPrompt',
    input: { schema: GenerateStudyPlanInputSchema },
    output: { schema: GenerateStudyPlanOutputSchema },
    prompt: `You are an expert academic advisor. Your task is to create a personalized, balanced weekly study plan for a student based on their subjects, available study time, and upcoming deadlines.

    **Student's Information:**
    - Subjects: {{{json subjectTitles}}}
    - Total Weekly Study Hours: {{{weeklyHours}}}
    - Upcoming Deadlines/Exams: {{{deadlines}}}

    **Your Task:**
    1.  Distribute the total weekly study hours intelligently across the selected subjects. Give more time to subjects that might be perceived as more demanding, or subjects with upcoming deadlines.
    2.  Break down the study time for each subject into specific, actionable sessions throughout the week (Monday to Sunday).
    3.  For each session, define a clear topic to focus on. These topics should be plausible for a college student (e.g., "Chapter 3: Kinematics", "Reviewing Lecture Notes on Data Structures", "Practice Problems: Organic Chemistry").
    4.  Assign a day and a realistic time slot for each session. Spread the sessions out to avoid burnout.
    5.  Provide a brief, helpful description for each session's objective.
    6.  Return the plan as a structured array of study sessions.
    
    Ensure the total time of all sessions does not exceed the student's specified weekly hours.
    `,
});

const generateStudyPlanFlow = ai.defineFlow(
    {
        name: 'generateStudyPlanFlow',
        inputSchema: GenerateStudyPlanInputSchema,
        outputSchema: GenerateStudyPlanOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
