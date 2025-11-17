import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import type { Quiz } from "@shared/schema";

function QuizCard({ quiz }: { quiz: Quiz }) {
  const questionCount = (quiz.json as any).questions?.length || 0;

  return (
    <Card className="hover-elevate" data-testid={`quiz-card-${quiz.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <CardTitle className="text-lg" data-testid={`quiz-title-${quiz.id}`}>
              {quiz.title}
            </CardTitle>
            <CardDescription className="line-clamp-2" data-testid={`quiz-description-${quiz.id}`}>
              {quiz.description}
            </CardDescription>
          </div>
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 no-default-hover-elevate no-default-active-elevate">
            <FileQuestion className="w-3 h-3 mr-1" />
            {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground" data-testid={`quiz-date-${quiz.id}`}>
          Created {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
        </p>
        <Button asChild className="w-full" data-testid={`button-take-quiz-${quiz.id}`}>
          <Link href={`/quiz/${quiz.id}`}>
            <Play className="w-4 h-4 mr-2" />
            Take Quiz
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ViewQuizzes() {
  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes'],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-view-quizzes">
            View Quizzes
          </h1>
          <p className="text-sm text-muted-foreground">
            All available quizzes to test your knowledge
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !quizzes || quizzes.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <FileQuestion className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground" data-testid="text-empty-state">
                No quizzes available
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Get started by uploading your first quiz using the Upload Quiz page.
              </p>
            </div>
            <Button asChild data-testid="button-upload-first-quiz">
              <Link href="/upload-quiz">Upload Your First Quiz</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
