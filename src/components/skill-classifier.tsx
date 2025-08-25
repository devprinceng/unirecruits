'use client';

import { useState } from 'react';
import { classifySkills, ClassifySkillsInput } from '@/ai/flows/classify-skills';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type SkillClassifierProps = {
  onSkillsClassified: (skills: string[]) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;
};

export function SkillClassifier({ onSkillsClassified, jobDescription, setJobDescription }: SkillClassifierProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  async function handleClassify() {
    setIsLoading(true);
    setError(null);
    setSkills([]);
    try {
      const input: ClassifySkillsInput = { jobDescription };
      const result = await classifySkills(input);
      const classifiedSkills = result.skills || [];
      setSkills(classifiedSkills);
      onSkillsClassified(classifiedSkills);
    } catch (e) {
      console.error(e);
      setError('Failed to classify skills. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-secondary/50">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Wand2 className="text-primary" />
                AI Skill Classifier
            </CardTitle>
            <CardDescription>
                Enter a job description below and let AI extract the key skills.
            </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleClassify} disabled={isLoading || !jobDescription}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
             <>
              <Wand2 className="mr-2 h-4 w-4" />
              Classify Skills
            </>
          )}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {skills.length > 0 && (
          <div className="space-y-2">
            <Label>Identified Skills:</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
