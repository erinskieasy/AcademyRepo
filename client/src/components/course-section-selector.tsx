import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="course-select">Course</Label>
        <Select value={selectedCourseId} onValueChange={onCourseChange}>
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
          </SelectContent>
        </Select>
      </div>

      {selectedCourseId && (
        <div className="space-y-2">
          <Label htmlFor="section-select">Section</Label>
          {sectionsLoading ? (
            <div className="text-sm text-muted-foreground">Loading sections...</div>
          ) : sections.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No sections in this course. Please create a section first.
              </AlertDescription>
            </Alert>
          ) : (
            <Select value={selectedSectionId} onValueChange={onSectionChange}>
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
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
