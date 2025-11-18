import { Home, Upload, FileQuestion, ListChecks, Settings, BookOpen, ChevronRight, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import type { Course } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    testId: "link-dashboard",
  },
  {
    title: "Upload Asset",
    url: "/upload-asset",
    icon: Upload,
    testId: "link-upload-asset",
  },
  {
    title: "Upload Quiz",
    url: "/upload-quiz",
    icon: FileQuestion,
    testId: "link-upload-quiz",
  },
  {
    title: "View Quizzes",
    url: "/quizzes",
    icon: ListChecks,
    testId: "link-view-quizzes",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    testId: "link-settings",
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [coursesOpen, setCoursesOpen] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
      return courseId;
    },
    onSuccess: (deletedCourseId) => {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      // Invalidate all course-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      
      // Redirect to home if user is on the deleted course page
      if (location.startsWith(`/course/${deletedCourseId}`)) {
        window.location.href = '/';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">AR</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-sidebar-foreground">Asset Repository</h1>
            <p className="text-xs text-muted-foreground">Manage your media</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/"}>
                  <Link href="/" data-testid="link-dashboard">
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible open={coursesOpen} onOpenChange={setCoursesOpen}>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between hover-elevate rounded-md p-2">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Courses</span>
                </span>
                <ChevronRight 
                  className={`w-4 h-4 transition-transform ${coursesOpen ? 'rotate-90' : ''}`} 
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {isLoading ? (
                    <div className="px-4 py-2 text-xs text-muted-foreground">Loading courses...</div>
                  ) : courses.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-muted-foreground">No courses yet</div>
                  ) : (
                    courses.map((course) => (
                    <SidebarMenuItem key={course.id}>
                      <div className="group relative flex items-center w-full">
                        <SidebarMenuButton 
                          asChild 
                          isActive={location === `/course/${course.id}`}
                          className="flex-1 pr-8"
                        >
                          <Link 
                            href={`/course/${course.id}`} 
                            data-testid={`link-course-${course.id}`}
                          >
                            <span>{course.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteCourseMutation.mutate(course.id);
                          }}
                          disabled={deleteCourseMutation.isPending}
                          data-testid={`button-delete-course-${course.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.slice(1).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
