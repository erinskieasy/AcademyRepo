import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Video, Music, Link as LinkIcon, FileQuestion, Plus, ChevronLeft, Trash2, Pencil, Check } from "lucide-react";
import type { Asset, Quiz } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Section {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
  assets: Asset[];
  quizzes: Quiz[];
}

interface CourseWithSections {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  sections: Section[];
}

export default function CourseView() {
  const [, params] = useRoute("/course/:id");
  const courseId = params?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery<CourseWithSections>({
    queryKey: ['/api/courses', courseId],
    enabled: !!courseId,
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      await apiRequest("DELETE", `/api/sections/${sectionId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
      // Invalidate current course and all courses list
      queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete section",
        variant: "destructive",
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      await apiRequest("DELETE", `/api/assets/${assetId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete asset",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="text-lg font-medium text-foreground">Course not found</h3>
            <Button asChild>
              <Link href="/" data-testid="button-back-dashboard">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'video_file':
      case 'video_link':
        return <Video className="w-4 h-4" />;
      case 'audio_file':
        return <Music className="w-4 h-4" />;
      case 'link':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'video_file':
        return 'Video File';
      case 'video_link':
        return 'Video Link';
      case 'audio_file':
        return 'Audio File';
      case 'link':
        return 'Link';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back-dashboard">
            <Link href="/">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-course-title">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-muted-foreground mt-2" data-testid="text-course-description">
                {course.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground pl-14">
          <span>{course.sections.length} {course.sections.length === 1 ? 'section' : 'sections'}</span>
        </div>
      </div>

      {course.sections.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <FileQuestion className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium text-foreground">No sections yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                This course doesn't have any sections yet. Create your first section to get started.
              </p>
            </div>
            <Button asChild data-testid="button-add-section">
              <Link href="/upload-asset">
                <Plus className="w-4 h-4 mr-2" />
                Add Section Content
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {course.sections.map((section) => {
            const totalItems = section.assets.length + section.quizzes.length;

            return (
              <Card key={section.id} data-testid={`section-${section.id}`} className="relative group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle data-testid={`text-section-title-${section.id}`}>
                        {section.title}
                      </CardTitle>
                      <CardDescription>
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingSectionId === section.id ? (
                        <Button
                          variant="default"
                          size="icon"
                          onClick={() => setEditingSectionId(null)}
                          data-testid={`button-save-section-${section.id}`}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setEditingSectionId(section.id)}
                            data-testid={`button-edit-section-${section.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteSectionMutation.mutate(section.id)}
                            disabled={deleteSectionMutation.isPending}
                            data-testid={`button-delete-section-${section.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {totalItems === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No content in this section yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {section.assets.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">Assets</h4>
                          <div className="grid gap-3">
                            {section.assets.map((asset) => {
                              const isLink = asset.type === 'link';
                              const isEditing = editingSectionId === section.id;
                              const CardWrapper = (isLink && !isEditing) ? 'a' : 'div';
                              const cardProps = (isLink && !isEditing) ? { 
                                href: asset.url || '#',
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "block no-underline"
                              } : {};
                              
                              return (
                                <CardWrapper key={asset.id} {...cardProps}>
                                  <Card 
                                    className={`${(isLink && !isEditing) ? "hover-elevate cursor-pointer" : ""} ${isEditing ? "group" : ""}`}
                                    data-testid={`asset-${asset.id}`}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                          <div className="mt-1">
                                            {getAssetIcon(asset.type)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-medium text-foreground truncate">
                                              {asset.title}
                                            </h5>
                                            <Badge variant="secondary" className="mt-1">
                                              {getAssetTypeLabel(asset.type)}
                                            </Badge>
                                          </div>
                                        </div>
                                        {isEditing && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              deleteAssetMutation.mutate(asset.id);
                                            }}
                                            disabled={deleteAssetMutation.isPending}
                                            data-testid={`button-delete-asset-${asset.id}`}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                      
                                      {asset.type === 'video_link' && asset.url && (
                                        <div className="mt-4">
                                          <iframe
                                            src={asset.url.replace('watch?v=', 'embed/')}
                                            className="w-full aspect-video rounded-md"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            data-testid={`iframe-${asset.id}`}
                                          />
                                        </div>
                                      )}
                                      
                                      {asset.type === 'video_file' && asset.url && (
                                        <div className="mt-4">
                                          <video
                                            controls
                                            className="w-full rounded-md"
                                            data-testid={`video-${asset.id}`}
                                          >
                                            <source src={asset.url} type="video/mp4" />
                                            Your browser does not support the video tag.
                                          </video>
                                        </div>
                                      )}
                                      
                                      {asset.type === 'audio_file' && asset.url && (
                                        <div className="mt-4">
                                          <audio
                                            controls
                                            className="w-full"
                                            data-testid={`audio-${asset.id}`}
                                          >
                                            <source src={asset.url} type="audio/mpeg" />
                                            Your browser does not support the audio tag.
                                          </audio>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </CardWrapper>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {section.quizzes.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">Quizzes</h4>
                          <div className="grid gap-3">
                            {section.quizzes.map((quiz) => (
                              <Card 
                                key={quiz.id} 
                                className="hover-elevate"
                                data-testid={`quiz-${quiz.id}`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="mt-1">
                                        <FileQuestion className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-medium text-foreground">
                                          {quiz.title}
                                        </h5>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {quiz.description}
                                        </p>
                                      </div>
                                    </div>
                                    <Button 
                                      asChild 
                                      size="sm"
                                      data-testid={`button-take-quiz-${quiz.id}`}
                                    >
                                      <Link href={`/quiz/${quiz.id}`}>
                                        Take Quiz
                                      </Link>
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
