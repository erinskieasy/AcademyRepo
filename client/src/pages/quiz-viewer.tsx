import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";
import type { Quiz, QuizJson } from "@shared/schema";

export default function QuizViewer() {
  const [, params] = useRoute("/quiz/:id");
  const quizId = params?.id;

  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: ['/api/quizzes', quizId],
    enabled: !!quizId,
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-lg font-medium text-foreground">Quiz not found</h3>
          <Button asChild>
            <Link href="/quizzes">Back to Quizzes</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const quizData = quiz.json as QuizJson;
  const questions = quizData.questions;
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
    };
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-quiz-results">
            Quiz Results
          </h1>
          <p className="text-sm text-muted-foreground">{quiz.title}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground" data-testid="text-score-percentage">
                  {score.percentage}%
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {score.percentage >= 70 ? "Great Job!" : score.percentage >= 50 ? "Good Effort!" : "Keep Practicing!"}
                </CardTitle>
                <CardDescription className="text-base mt-2" data-testid="text-score-summary">
                  You answered {score.correct} out of {score.total} questions correctly
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {questions.map((question, qIndex) => {
                const userAnswer = answers[qIndex];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <Card key={qIndex} className={isCorrect ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800"}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            Question {qIndex + 1}: {question.question}
                          </CardTitle>
                          <div className="mt-3 space-y-2">
                            {question.options.map((option, oIndex) => {
                              const isUserAnswer = userAnswer === oIndex;
                              const isCorrectAnswer = question.correctAnswer === oIndex;

                              return (
                                <div
                                  key={oIndex}
                                  className={`p-3 rounded-md text-sm ${
                                    isCorrectAnswer
                                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                      : isUserAnswer
                                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                      : "bg-muted"
                                  }`}
                                >
                                  {option}
                                  {isCorrectAnswer && (
                                    <Badge className="ml-2 bg-green-600 dark:bg-green-700">Correct</Badge>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <Badge variant="destructive" className="ml-2">Your Answer</Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleRetry} variant="outline" className="flex-1" data-testid="button-retry-quiz">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Quiz
              </Button>
              <Button asChild variant="outline" className="flex-1" data-testid="button-back-to-quizzes">
                <Link href="/quizzes">Back to Quizzes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const userAnswer = answers[currentQuestion];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-quiz-title">
          {quiz.title}
        </h1>
        <p className="text-sm text-muted-foreground">{quiz.description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground" data-testid="text-question-progress">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="text-muted-foreground">
            {Object.keys(answers).length} answered
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl" data-testid={`text-question-${currentQuestion}`}>
            {currentQ.question}
          </CardTitle>
          <CardDescription>Select the correct answer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={userAnswer?.toString()}
            onValueChange={(value) => handleAnswerChange(currentQuestion, parseInt(value))}
          >
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-md border hover-elevate"
                data-testid={`option-${currentQuestion}-${index}`}
              >
                <RadioGroupItem value={index.toString()} id={`q${currentQuestion}-option${index}`} />
                <Label
                  htmlFor={`q${currentQuestion}-option${index}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentQuestion < totalQuestions - 1 ? (
              <Button
                onClick={handleNext}
                className="flex-1"
                data-testid="button-next"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== totalQuestions}
                className="flex-1"
                data-testid="button-submit-quiz"
              >
                Submit Quiz
              </Button>
            )}
          </div>

          {currentQuestion === totalQuestions - 1 && Object.keys(answers).length !== totalQuestions && (
            <p className="text-sm text-muted-foreground text-center">
              Please answer all questions before submitting
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
