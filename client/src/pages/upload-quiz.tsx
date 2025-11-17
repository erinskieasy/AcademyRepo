import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileJson, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { quizJsonSchema } from "@shared/schema";
import { CourseSectionSelector } from "@/components/course-section-selector";

export default function UploadQuiz() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    setJsonFile(file);
    setJsonContent(null);
    setValidationError(null);
    
    if (!file) return;
    
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      // Validate JSON structure
      const result = quizJsonSchema.safeParse(json);
      if (!result.success) {
        setValidationError(result.error.errors[0]?.message || "Invalid quiz format");
        return;
      }
      
      setJsonContent(json);
    } catch (error) {
      setValidationError("Invalid JSON file");
    }
  };

  const uploadQuizMutation = useMutation({
    mutationFn: async () => {
      if (!title || !description || !jsonContent || !selectedSectionId) {
        throw new Error("Missing required fields");
      }
      
      await apiRequest("POST", "/api/quizzes", {
        sectionId: selectedSectionId,
        title,
        description,
        json: jsonContent,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quiz uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      setTitle("");
      setDescription("");
      setJsonFile(null);
      setJsonContent(null);
      setValidationError(null);
      setLocation("/quizzes");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload quiz",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-upload-quiz">
          Upload Quiz
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload a JSON file containing multiple-choice questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Course & Section</CardTitle>
          <CardDescription>Choose where to add this quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseSectionSelector
            selectedCourseId={selectedCourseId}
            selectedSectionId={selectedSectionId}
            onCourseChange={setSelectedCourseId}
            onSectionChange={setSelectedSectionId}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Information</CardTitle>
            <CardDescription>Provide details about your quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Title</Label>
              <Input
                id="quiz-title"
                placeholder="JavaScript Basics Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-quiz-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quiz-description">Description</Label>
              <Textarea
                id="quiz-description"
                placeholder="Test your knowledge of JavaScript fundamentals"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                data-testid="input-quiz-description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quiz-file">Quiz JSON File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover-elevate">
                <input
                  id="quiz-file"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  data-testid="input-quiz-file"
                />
                <label htmlFor="quiz-file" className="cursor-pointer">
                  <FileJson className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    {jsonFile ? jsonFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JSON file with quiz questions
                  </p>
                </label>
              </div>
              
              {validationError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive" data-testid="text-validation-error">
                    {validationError}
                  </p>
                </div>
              )}
              
              {jsonContent && !validationError && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-600 dark:text-green-400" data-testid="text-validation-success">
                    Valid quiz format ({jsonContent.questions.length} questions)
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={() => uploadQuizMutation.mutate()}
              disabled={!title || !description || !jsonContent || uploadQuizMutation.isPending}
              className="w-full"
              data-testid="button-upload-quiz"
            >
              {uploadQuizMutation.isPending ? "Uploading..." : "Upload Quiz"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected JSON Format</CardTitle>
            <CardDescription>Your quiz JSON should follow this structure</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
{`{
  "questions": [
    {
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1
    },
    {
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correctAnswer": 2
    }
  ]
}`}
            </pre>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong className="text-foreground">questions:</strong> Array of question objects
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">question:</strong> The question text
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">options:</strong> Array of answer choices (min 2)
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">correctAnswer:</strong> Index of correct option (0-based)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
