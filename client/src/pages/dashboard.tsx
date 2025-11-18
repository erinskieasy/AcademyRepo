import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Music, Link as LinkIcon, ExternalLink, Trash2, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Asset } from "@shared/schema";
import { ASSET_TYPES } from "@shared/schema";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function AssetCard({ asset }: { asset: Asset }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      await apiRequest("DELETE", `/api/assets/${assetId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete asset",
        variant: "destructive",
      });
    },
  });

  const getAssetIcon = () => {
    switch (asset.type) {
      case ASSET_TYPES.VIDEO_FILE:
      case ASSET_TYPES.VIDEO_LINK:
        return <Play className="w-4 h-4" />;
      case ASSET_TYPES.AUDIO_FILE:
        return <Music className="w-4 h-4" />;
      case ASSET_TYPES.LINK:
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const getAssetBadgeColor = () => {
    switch (asset.type) {
      case ASSET_TYPES.VIDEO_FILE:
      case ASSET_TYPES.VIDEO_LINK:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case ASSET_TYPES.AUDIO_FILE:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case ASSET_TYPES.LINK:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getAssetTypeLabel = () => {
    switch (asset.type) {
      case ASSET_TYPES.VIDEO_FILE:
        return "Video File";
      case ASSET_TYPES.VIDEO_LINK:
        return "Video Link";
      case ASSET_TYPES.AUDIO_FILE:
        return "Audio File";
      case ASSET_TYPES.LINK:
        return "Link";
      default:
        return "Unknown";
    }
  };

  const renderPreview = () => {
    if (asset.type === ASSET_TYPES.VIDEO_FILE) {
      return (
        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          <video
            src={asset.url}
            controls
            className="w-full h-full object-cover"
            data-testid={`video-player-${asset.id}`}
          />
        </div>
      );
    }

    if (asset.type === ASSET_TYPES.VIDEO_LINK) {
      // Extract video ID from YouTube/Vimeo URLs
      let embedUrl = asset.url;
      if (asset.url.includes('youtube.com') || asset.url.includes('youtu.be')) {
        const videoId = asset.url.includes('youtu.be') 
          ? asset.url.split('youtu.be/')[1]?.split('?')[0]
          : new URL(asset.url).searchParams.get('v');
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (asset.url.includes('vimeo.com')) {
        const videoId = asset.url.split('vimeo.com/')[1]?.split('?')[0];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      return (
        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            data-testid={`video-embed-${asset.id}`}
          />
        </div>
      );
    }

    if (asset.type === ASSET_TYPES.AUDIO_FILE) {
      return (
        <div className="bg-muted rounded-md p-4">
          <audio
            src={asset.url}
            controls
            className="w-full"
            data-testid={`audio-player-${asset.id}`}
          />
        </div>
      );
    }

    // For general links, show an icon
    return (
      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
        <ExternalLink className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Card className="hover-elevate relative group" data-testid={`asset-card-${asset.id}`}>
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={() => deleteAssetMutation.mutate(asset.id)}
        disabled={deleteAssetMutation.isPending}
        data-testid={`button-delete-asset-${asset.id}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <CardContent className="p-4 space-y-3">
        {renderPreview()}
        
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-card-foreground truncate" data-testid={`asset-title-${asset.id}`}>
                {asset.title}
              </h3>
              <p className="text-xs text-muted-foreground" data-testid={`asset-date-${asset.id}`}>
                {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Badge className={`${getAssetBadgeColor()} no-default-hover-elevate no-default-active-elevate`}>
              <div className="flex items-center gap-1">
                {getAssetIcon()}
                <span className="text-xs">{getAssetTypeLabel()}</span>
              </div>
            </Badge>
          </div>

          {asset.type === ASSET_TYPES.LINK && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              asChild
              data-testid={`button-open-link-${asset.id}`}
            >
              <a href={asset.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="w-3 h-3" />
                Open Link
              </a>
            </Button>
          )}

          {asset.metadata && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {(asset.metadata as any).size && (
                <span>Size: {((asset.metadata as any).size / 1024 / 1024).toFixed(2)} MB</span>
              )}
              {(asset.metadata as any).duration && (
                <span>Duration: {Math.floor((asset.metadata as any).duration / 60)}:{String(Math.floor((asset.metadata as any).duration % 60)).padStart(2, '0')}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-dashboard">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            All your uploaded assets in one place
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="aspect-video rounded-md" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !assets || assets.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <Upload className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground" data-testid="text-empty-state">
                No assets uploaded yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Get started by uploading your first video, audio file, or link using the Upload Asset page.
              </p>
            </div>
            <Button asChild data-testid="button-upload-first-asset">
              <a href="/upload-asset">Upload Your First Asset</a>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
