// classify-skills.ts
'use server';

/**
 * @fileOverview A skill classifier AI agent.
 *
 * - classifySkills - A function that classifies skills from a job description.
 * - ClassifySkillsInput - The input type for the classifySkills function.
 * - ClassifySkillsOutput - The return type for the classifySkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifySkillsInputSchema = z.object({
  jobDescription: z.string().describe('The job description to classify skills from.'),
});
export type ClassifySkillsInput = z.infer<typeof ClassifySkillsInputSchema>;

const ClassifySkillsOutputSchema = z.object({
  skills: z.array(z.string()).describe('The list of skills extracted from the job description.'),
});
export type ClassifySkillsOutput = z.infer<typeof ClassifySkillsOutputSchema>;

export async function classifySkills(input: ClassifySkillsInput): Promise<ClassifySkillsOutput> {
  return classifySkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifySkillsPrompt',
  input: {schema: ClassifySkillsInputSchema},
  output: {schema: ClassifySkillsOutputSchema},
  prompt: `You are an expert in recruiting and talent acquisition. Your goal is to extract the
most important skills from a job description. Only return skills that are explicitly mentioned or
strongly implied. Do not assume or make up skills that are not present in the job description.

Job Description: {{{jobDescription}}}

Skills:`, // Ensure that the output is valid JSON.
});

const classifySkillsFlow = ai.defineFlow(
  {
    name: 'classifySkillsFlow',
    inputSchema: ClassifySkillsInputSchema,
    outputSchema: ClassifySkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
