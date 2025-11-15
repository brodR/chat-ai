import { X, FileText, Image as ImageIcon, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="relative group rounded-lg border bg-card p-3 flex items-center gap-3 hover-elevate" data-testid={`file-preview-${file.name}`}>
      <div className="flex-shrink-0">
        {isImage ? (
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        ) : isVideo ? (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
            <Video className="w-6 h-6 text-muted-foreground" />
          </div>
        ) : isAudio ? (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
            <Music className="w-6 h-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" data-testid={`text-filename-${file.name}`}>{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={onRemove}
        className="flex-shrink-0"
        data-testid={`button-remove-${file.name}`}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
