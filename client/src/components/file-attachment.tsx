import React from 'react';
import { FileText, Image as ImageIcon, Video, Music, Download } from "lucide-react";
import { FileAttachment as FileAttachmentType } from "@shared/schema";
import { Button } from "../components/ui/button";
interface FileAttachmentProps {
  file: FileAttachmentType;
}

export function FileAttachment({ file }: FileAttachmentProps) {
  const isImage = file.mimeType?.startsWith("image/");
  const isVideo = file.mimeType?.startsWith("video/");
  const isAudio = file.mimeType?.startsWith("audio/");
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isImage) {
    return (
      <div className="my-2 rounded-lg overflow-hidden max-w-md" data-testid={`attachment-image-${file.id}`}>
        <img 
          src={file.url} 
          alt={file.name}
          className="w-full h-auto"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="my-2 rounded-lg overflow-hidden max-w-md" data-testid={`attachment-video-${file.id}`}>
        <video 
          src={file.url} 
          controls
          className="w-full h-auto"
        />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="my-2" data-testid={`attachment-audio-${file.id}`}>
        <audio src={file.url} controls className="w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="my-2 rounded-lg border bg-card p-3 flex items-center gap-3 max-w-md" data-testid={`attachment-file-${file.id}`}>
      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>

      <Button size="icon" variant="ghost" asChild className="flex-shrink-0">
        <a
          href={file.url}
          download={file.name}
          aria-label={`Скачать файл ${file.name}`}
          data-testid={`button-download-${file.id}`}
        >
          <Download className="w-4 h-4" />
        </a>
      </Button>

      {/* <Button
        size="icon"
        variant="ghost"
        asChild
        className="flex-shrink-0"
      >
        <a href={file.url} download={file.name} data-testid={`button-download-${file.id}`}>
          <Download className="w-4 h-4" />
        </a>
      </Button> */}
    </div>
  );
}
