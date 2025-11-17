import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Course, Section } from "@shared/schema";

interface CourseSectionSelectorProps {
  selectedCourseId: string;
  selectedSectionId: string;
  onCourseChange: (courseId: string) => void;
  onSectionChange: (sectionId: string) => void;
}

export function CourseSectionSelector({
  selectedCourseId,
  selectedSectionId,
  onCourseChange,
  onSectionChange,
}: CourseSectionSelectorProps) {
  const { toast } = useToast();
  const [showNewCourseDialog, setShowNewCourseDialog] = useState(false);
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ['/api/sections', selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      const res = await fetch(`/api/sections?courseId=${selectedCourseId}`);
      if (!res.ok) throw new Error('Failed to fetch sections');
      return res.json();
    },
    enabled: !!selectedCourseId,
  });

  const createCourseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/courses", {
        method: "POST",
        body: JSON.stringify({
          title: newCourseTitle,
          description: newCourseDescription || null,
        }),
      });
    },
    onSuccess: (newCourse: Course) => {
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setShowNewCourseDialog(false);
      setNewCourseTitle("");
      setNewCourseDescription("");
      onCourseChange(newCourse.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/sections", {
        method: "POST",
        body: JSON.stringify({
          courseId: selectedCourseId,
          title: newSectionTitle,
          orderIndex: sections.length,
        }),
      });
    },
    onSuccess: (newSection: Section) => {
      toast({
        title: "Success",
        description: "Section created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sections', selectedCourseId] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setShowNewSectionDialog(false);
      setNewSectionTitle("");
      onSectionChange(newSection.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create section",
        variant: "destructive",
      });
    },
  });

  const handleCourseSelectChange = (value: string) => {
    if (value === "__new__") {
      setShowNewCourseDialog(true);
    } else {
      onCourseChange(value);
    }
  };

  const handleSectionSelectChange = (value: string) => {
    if (value === "__new__") {
      setShowNewSectionDialog(true);
    } else {
      onSectionChange(value);
    }
  };

  if (coursesLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Loading courses...</div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No courses available. Please create a course first before uploading content.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course-select">Course</Label>
          <Select value={selectedCourseId} onValueChange={handleCourseSelectChange}>
            <SelectTrigger id="course-select" data-testid="select-course">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem 
                  key={course.id} 
                  value={course.id}
                  data-testid={`course-option-${course.id}`}
                >
                  {course.title}
                </SelectItem>
              ))}
              <SelectItem value="__new__" data-testid="course-option-new">
                <div className="flex items-center gap-2 font-medium text-primary">
                  <Plus className="w-4 h-4" />
                  Create New Course
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedCourseId && (
          <div className="space-y-2">
            <Label htmlFor="section-select">Section</Label>
            {sectionsLoading ? (
              <div className="text-sm text-muted-foreground">Loading sections...</div>
            ) : (
              <Select value={selectedSectionId} onValueChange={handleSectionSelectChange}>
                <SelectTrigger id="section-select" data-testid="select-section">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem 
                      key={section.id} 
                      value={section.id}
                      data-testid={`section-option-${section.id}`}
                    >
                      {section.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__" data-testid="section-option-new">
                    <div className="flex items-center gap-2 font-medium text-primary">
                      <Plus className="w-4 h-4" />
                      Create New Section
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      <Dialog open={showNewCourseDialog} onOpenChange={setShowNewCourseDialog}>
        <DialogContent data-testid="dialog-new-course">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to organize your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-course-title">Course Title</Label>
              <Input
                id="new-course-title"
                placeholder="Introduction to Programming"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                data-testid="input-new-course-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-course-description">Description (Optional)</Label>
              <Textarea
                id="new-course-description"
                placeholder="Learn the fundamentals of programming..."
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                data-testid="input-new-course-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewCourseDialog(false)}
              data-testid="button-cancel-course"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createCourseMutation.mutate()}
              disabled={!newCourseTitle || createCourseMutation.isPending}
              data-testid="button-create-course"
            >
              {createCourseMutation.isPending ? "Creating..." : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewSectionDialog} onOpenChange={setShowNewSectionDialog}>
        <DialogContent data-testid="dialog-new-section">
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Add a new section to {courses.find(c => c.id === selectedCourseId)?.title || 'this course'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-section-title">Section Title</Label>
              <Input
                id="new-section-title"
                placeholder="Getting Started"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                data-testid="input-new-section-title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewSectionDialog(false)}
              data-testid="button-cancel-section"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createSectionMutation.mutate()}
              disabled={!newSectionTitle || createSectionMutation.isPending}
              data-testid="button-create-section"
            >
              {createSectionMutation.isPending ? "Creating..." : "Create Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
