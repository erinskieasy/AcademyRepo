import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, ChevronDown, ChevronRight, Book } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  requestBody?: string;
  response: string;
  example: string;
}

const apiEndpoints: APIEndpoint[] = [
  {
    method: "GET",
    path: "/api/courses",
    description: "List all courses in the repository",
    response: `[
  {
    "id": "uuid-string",
    "title": "Course Title",
    "description": "Course description",
    "createdAt": "2025-11-17T12:00:00.000Z"
  }
]`,
    example: `fetch('/api/courses')
  .then(res => res.json())
  .then(courses => console.log(courses));`,
  },
  {
    method: "GET",
    path: "/api/courses/:id",
    description: "Get a specific course with all its sections, assets, and quizzes",
    response: `{
  "id": "uuid-string",
  "title": "Course Title",
  "description": "Course description",
  "createdAt": "2025-11-17T12:00:00.000Z",
  "sections": [
    {
      "id": "uuid-string",
      "courseId": "uuid-string",
      "title": "Section Title",
      "orderIndex": 0,
      "createdAt": "2025-11-17T12:00:00.000Z",
      "assets": [...],
      "quizzes": [...]
    }
  ]
}`,
    example: `fetch('/api/courses/uuid-string')
  .then(res => res.json())
  .then(course => console.log(course));`,
  },
  {
    method: "POST",
    path: "/api/courses",
    description: "Create a new course",
    requestBody: `{
  "title": "Introduction to Programming",
  "description": "Learn programming fundamentals"
}`,
    response: `{
  "id": "uuid-string",
  "title": "Introduction to Programming",
  "description": "Learn programming fundamentals",
  "createdAt": "2025-11-17T12:00:00.000Z"
}`,
    example: `fetch('/api/courses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Introduction to Programming",
    description: "Learn programming fundamentals"
  })
})
  .then(res => res.json())
  .then(course => console.log(course));`,
  },
  {
    method: "GET",
    path: "/api/sections?courseId=:courseId",
    description: "Get all sections for a specific course",
    response: `[
  {
    "id": "uuid-string",
    "courseId": "uuid-string",
    "title": "Section Title",
    "orderIndex": 0,
    "createdAt": "2025-11-17T12:00:00.000Z"
  }
]`,
    example: `fetch('/api/sections?courseId=uuid-string')
  .then(res => res.json())
  .then(sections => console.log(sections));`,
  },
  {
    method: "POST",
    path: "/api/sections",
    description: "Create a new section within a course",
    requestBody: `{
  "courseId": "uuid-string",
  "title": "Getting Started",
  "orderIndex": 0
}`,
    response: `{
  "id": "uuid-string",
  "courseId": "uuid-string",
  "title": "Getting Started",
  "orderIndex": 0,
  "createdAt": "2025-11-17T12:00:00.000Z"
}`,
    example: `fetch('/api/sections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    courseId: "uuid-string",
    title: "Getting Started",
    orderIndex: 0
  })
})
  .then(res => res.json())
  .then(section => console.log(section));`,
  },
  {
    method: "GET",
    path: "/api/assets",
    description: "List all assets (videos, audio, links) in the repository",
    response: `[
  {
    "id": "uuid-string",
    "sectionId": "uuid-string",
    "type": "video_file" | "video_link" | "audio_file" | "link",
    "title": "Asset Title",
    "url": "https://example.com/file.mp4",
    "metadata": { "size": 1024, "contentType": "video/mp4" },
    "createdAt": "2025-11-17T12:00:00.000Z"
  }
]`,
    example: `fetch('/api/assets')
  .then(res => res.json())
  .then(assets => console.log(assets));`,
  },
  {
    method: "POST",
    path: "/api/assets",
    description: "Create a new asset (requires sectionId). Supports video files, video links, audio files, and general links",
    requestBody: `{
  "sectionId": "uuid-string",
  "type": "video_link",
  "title": "Introduction Video",
  "url": "https://youtube.com/watch?v=example",
  "metadata": {}
}`,
    response: `{
  "id": "uuid-string",
  "sectionId": "uuid-string",
  "type": "video_link",
  "title": "Introduction Video",
  "url": "https://youtube.com/watch?v=example",
  "metadata": {},
  "createdAt": "2025-11-17T12:00:00.000Z"
}`,
    example: `fetch('/api/assets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sectionId: "uuid-string",
    type: "video_link",
    title: "Introduction Video",
    url: "https://youtube.com/watch?v=example",
    metadata: {}
  })
})
  .then(res => res.json())
  .then(asset => console.log(asset));`,
  },
  {
    method: "GET",
    path: "/api/quizzes",
    description: "List all quizzes in the repository",
    response: `[
  {
    "id": "uuid-string",
    "sectionId": "uuid-string",
    "title": "JavaScript Basics Quiz",
    "description": "Test your knowledge",
    "json": { "questions": [...] },
    "createdAt": "2025-11-17T12:00:00.000Z"
  }
]`,
    example: `fetch('/api/quizzes')
  .then(res => res.json())
  .then(quizzes => console.log(quizzes));`,
  },
  {
    method: "GET",
    path: "/api/quizzes/:id",
    description: "Get a specific quiz by ID",
    response: `{
  "id": "uuid-string",
  "sectionId": "uuid-string",
  "title": "JavaScript Basics Quiz",
  "description": "Test your knowledge",
  "json": {
    "questions": [
      {
        "question": "What is JavaScript?",
        "options": ["A language", "A framework", "A library", "A database"],
        "correctAnswer": 0
      }
    ]
  },
  "createdAt": "2025-11-17T12:00:00.000Z"
}`,
    example: `fetch('/api/quizzes/uuid-string')
  .then(res => res.json())
  .then(quiz => console.log(quiz));`,
  },
  {
    method: "POST",
    path: "/api/quizzes",
    description: "Create a new quiz (requires sectionId)",
    requestBody: `{
  "sectionId": "uuid-string",
  "title": "JavaScript Basics Quiz",
  "description": "Test your knowledge",
  "json": {
    "questions": [
      {
        "question": "What is JavaScript?",
        "options": ["A language", "A framework", "A library", "A database"],
        "correctAnswer": 0
      }
    ]
  }
}`,
    response: `{
  "id": "uuid-string",
  "sectionId": "uuid-string",
  "title": "JavaScript Basics Quiz",
  "description": "Test your knowledge",
  "json": { "questions": [...] },
  "createdAt": "2025-11-17T12:00:00.000Z"
}`,
    example: `fetch('/api/quizzes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sectionId: "uuid-string",
    title: "JavaScript Basics Quiz",
    description: "Test your knowledge",
    json: { questions: [...] }
  })
})
  .then(res => res.json())
  .then(quiz => console.log(quiz));`,
  },
  {
    method: "POST",
    path: "/api/objects/upload",
    description: "Get a presigned URL for uploading files to object storage",
    requestBody: `{}`,
    response: `{
  "uploadURL": "https://storage.googleapis.com/..."
}`,
    example: `// Step 1: Get upload URL
fetch('/api/objects/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
  .then(res => res.json())
  .then(data => {
    // Step 2: Upload file to storage
    return fetch(data.uploadURL, {
      method: 'PUT',
      body: fileBlob,
      headers: { 'Content-Type': 'video/mp4' }
    });
  })
  .then(() => console.log('File uploaded'));`,
  },
];

function EndpointCard({ endpoint }: { endpoint: APIEndpoint }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card data-testid={`api-endpoint-${endpoint.method}-${endpoint.path.replace(/\//g, '-')}`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Badge
                  variant={endpoint.method === "GET" ? "secondary" : "default"}
                  className="min-w-[60px] justify-center"
                  data-testid={`badge-method-${endpoint.method}`}
                >
                  {endpoint.method}
                </Badge>
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-mono text-foreground break-all">
                    {endpoint.path}
                  </code>
                  <p className="text-sm text-muted-foreground mt-1">
                    {endpoint.description}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" data-testid="button-toggle-endpoint">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {endpoint.requestBody && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Request Body</h4>
                <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                  <code className="text-foreground">{endpoint.requestBody}</code>
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Response</h4>
              <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                <code className="text-foreground">{endpoint.response}</code>
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Example Code</h4>
              <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                <code className="text-foreground">{endpoint.example}</code>
              </pre>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function Settings() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="heading-settings">
          <Book className="w-6 h-6" />
          API Documentation
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Complete API reference for integrating with the Asset Repository
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Use these endpoints to build apps that connect to your asset repository
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Code className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Base URL</p>
              <code className="text-sm text-muted-foreground">
                {window.location.origin}
              </code>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Code className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Content Type</p>
              <code className="text-sm text-muted-foreground">application/json</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">API Endpoints</h2>
        {apiEndpoints.map((endpoint, index) => (
          <EndpointCard key={index} endpoint={endpoint} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Course Hierarchy:</strong> All assets and quizzes must belong to a section, and all sections must belong to a course. The sectionId field is required when creating assets or quizzes.
          </p>
          <p>
            <strong className="text-foreground">Asset Types:</strong> Supported asset types are <code>video_file</code>, <code>video_link</code>, <code>audio_file</code>, and <code>link</code>.
          </p>
          <p>
            <strong className="text-foreground">File Uploads:</strong> For uploading video and audio files, first request a presigned upload URL from <code>/api/objects/upload</code>, then PUT your file to that URL, and finally create the asset record with the URL.
          </p>
          <p>
            <strong className="text-foreground">Quiz Format:</strong> Quiz JSON must follow the structure: <code>{`{ "questions": [{ "question": "...", "options": [...], "correctAnswer": 0 }] }`}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
