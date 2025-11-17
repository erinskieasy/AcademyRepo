import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Video, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ASSET_TYPES } from "@shared/schema";
import { CourseSectionSelector } from "@/components/course-section-selector";

export default function UploadAsset() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Course and section selection
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  
  // Video file upload
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  
  // Video link
  const [videoLinkUrl, setVideoLinkUrl] = useState("");
  const [videoLinkTitle, setVideoLinkTitle] = useState("");
  
  // Audio file upload
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioTitle] = useState("");
  
  // General link
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const uploadVideoFileMutation = useMutation({
    mutationFn: async () => {
      if (!videoFile || !videoTitle || !selectedSectionId) throw new Error("Missing required fields");
      
      // Get upload URL from backend
      const { uploadURL } = await apiRequest<{ uploadURL: string }>("POST", "/api/objects/upload", {});
      
      // Upload file to object storage
      await fetch(uploadURL, {
        method: "PUT",
        body: videoFile,
        headers: {
          "Content-Type": videoFile.type,
        },
      });
      
      // Save asset metadata to database
      await apiRequest("POST", "/api/assets", {
        sectionId: selectedSectionId,
        type: ASSET_TYPES.VIDEO_FILE,
        title: videoTitle,
        url: uploadURL.split("?")[0], // Remove query params
        metadata: {
          size: videoFile.size,
          contentType: videoFile.type,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video file uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      setVideoFile(null);
      setVideoTitle("");
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload video file",
        variant: "destructive",
      });
    },
  });

  const uploadVideoLinkMutation = useMutation({
    mutationFn: async () => {
      if (!videoLinkUrl || !videoLinkTitle || !selectedSectionId) throw new Error("Missing required fields");
      
      await apiRequest("POST", "/api/assets", {
        sectionId: selectedSectionId,
        type: ASSET_TYPES.VIDEO_LINK,
        title: videoLinkTitle,
        url: videoLinkUrl,
        metadata: {},
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video link added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      setVideoLinkUrl("");
      setVideoLinkTitle("");
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add video link",
        variant: "destructive",
      });
    },
  });

  const uploadAudioFileMutation = useMutation({
    mutationFn: async () => {
      if (!audioFile || !audioTitle || !selectedSectionId) throw new Error("Missing required fields");
      
      // Get upload URL from backend
      const { uploadURL} = await apiRequest<{ uploadURL: string }>("POST", "/api/objects/upload", {});
      
      // Upload file to object storage
      await fetch(uploadURL, {
        method: "PUT",
        body: audioFile,
        headers: {
          "Content-Type": audioFile.type,
        },
      });
      
      // Save asset metadata to database
      await apiRequest("POST", "/api/assets", {
        sectionId: selectedSectionId,
        type: ASSET_TYPES.AUDIO_FILE,
        title: audioTitle,
        url: uploadURL.split("?")[0], // Remove query params
        metadata: {
          size: audioFile.size,
          contentType: audioFile.type,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Audio file uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      setAudioFile(null);
      setAudioTitle("");
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload audio file",
        variant: "destructive",
      });
    },
  });

  const uploadLinkMutation = useMutation({
    mutationFn: async () => {
      if (!linkUrl || !linkTitle || !selectedSectionId) throw new Error("Missing required fields");
      
      await apiRequest("POST", "/api/assets", {
        sectionId: selectedSectionId,
        type: ASSET_TYPES.LINK,
        title: linkTitle,
        url: linkUrl,
        metadata: {},
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Link added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      setLinkUrl("");
      setLinkTitle("");
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add link",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-upload-asset">
          Upload Asset
        </h1>
        <p className="text-sm text-muted-foreground">
          Add videos, audio files, or links to your repository
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Course & Section</CardTitle>
          <CardDescription>Choose where to add this asset</CardDescription>
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

      <Tabs defaultValue="video-file" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="video-file" data-testid="tab-video-file">
            <Video className="w-4 h-4 mr-2" />
            Video File
          </TabsTrigger>
          <TabsTrigger value="video-link" data-testid="tab-video-link">
            <LinkIcon className="w-4 h-4 mr-2" />
            Video Link
          </TabsTrigger>
          <TabsTrigger value="audio-file" data-testid="tab-audio-file">
            <Music className="w-4 h-4 mr-2" />
            Audio File
          </TabsTrigger>
          <TabsTrigger value="link" data-testid="tab-link">
            <LinkIcon className="w-4 h-4 mr-2" />
            Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video-file">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video File</CardTitle>
              <CardDescription>Upload a video file to your repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-title">Title</Label>
                <Input
                  id="video-title"
                  placeholder="My awesome video"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  data-testid="input-video-title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-file">Video File</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover-elevate">
                  <input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                    data-testid="input-video-file"
                  />
                  <label htmlFor="video-file" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {videoFile ? videoFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, WebM, or other video formats
                    </p>
                  </label>
                </div>
              </div>

              <Button
                onClick={() => uploadVideoFileMutation.mutate()}
                disabled={!videoFile || !videoTitle || uploadVideoFileMutation.isPending}
                className="w-full"
                data-testid="button-upload-video"
              >
                {uploadVideoFileMutation.isPending ? "Uploading..." : "Upload Video"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video-link">
          <Card>
            <CardHeader>
              <CardTitle>Add Video Link</CardTitle>
              <CardDescription>Embed videos from YouTube, Vimeo, or other platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-link-title">Title</Label>
                <Input
                  id="video-link-title"
                  placeholder="My favorite video"
                  value={videoLinkTitle}
                  onChange={(e) => setVideoLinkTitle(e.target.value)}
                  data-testid="input-video-link-title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-link-url">Video URL</Label>
                <Input
                  id="video-link-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoLinkUrl}
                  onChange={(e) => setVideoLinkUrl(e.target.value)}
                  data-testid="input-video-link-url"
                />
                <p className="text-xs text-muted-foreground">
                  Supports YouTube, Vimeo, and other embeddable video platforms
                </p>
              </div>

              <Button
                onClick={() => uploadVideoLinkMutation.mutate()}
                disabled={!videoLinkUrl || !videoLinkTitle || uploadVideoLinkMutation.isPending}
                className="w-full"
                data-testid="button-add-video-link"
              >
                {uploadVideoLinkMutation.isPending ? "Adding..." : "Add Video Link"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio-file">
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio File</CardTitle>
              <CardDescription>Upload an audio file to your repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audio-title">Title</Label>
                <Input
                  id="audio-title"
                  placeholder="My audio track"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  data-testid="input-audio-title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audio-file">Audio File</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover-elevate">
                  <input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="hidden"
                    data-testid="input-audio-file"
                  />
                  <label htmlFor="audio-file" className="cursor-pointer">
                    <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {audioFile ? audioFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP3, WAV, OGG, or other audio formats
                    </p>
                  </label>
                </div>
              </div>

              <Button
                onClick={() => uploadAudioFileMutation.mutate()}
                disabled={!audioFile || !audioTitle || uploadAudioFileMutation.isPending}
                className="w-full"
                data-testid="button-upload-audio"
              >
                {uploadAudioFileMutation.isPending ? "Uploading..." : "Upload Audio"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="link">
          <Card>
            <CardHeader>
              <CardTitle>Add General Link</CardTitle>
              <CardDescription>Add links to PDFs, GitHub repos, websites, or any URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-title">Title</Label>
                <Input
                  id="link-title"
                  placeholder="My useful link"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  data-testid="input-link-title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  data-testid="input-link-url"
                />
                <p className="text-xs text-muted-foreground">
                  Any valid URL including PDFs, documents, websites, or GitHub repositories
                </p>
              </div>

              <Button
                onClick={() => uploadLinkMutation.mutate()}
                disabled={!linkUrl || !linkTitle || uploadLinkMutation.isPending}
                className="w-full"
                data-testid="button-add-link"
              >
                {uploadLinkMutation.isPending ? "Adding..." : "Add Link"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
