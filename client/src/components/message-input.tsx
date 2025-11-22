import React from 'react';
import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { FilePreview } from "./file-preview";

interface MessageInputProps {
  onSendMessage: (content: string, files: File[]) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function MessageInput({ onSendMessage, disabled, isLoading }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Авто-фокус когда isLoading становится false (ответ получен)
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const handleSend = () => {
    if (!content.trim() && files.length === 0) return;
    // if (disabled || isLoading) return;
    
    onSendMessage(content, files);
    // СРАЗУ сбрасываем поле ввода и состояние
    setContent("");
    setFiles([]);
    
    // Возвращаем фокус на textarea
    // setTimeout(() => {
    //   textareaRef.current?.focus();
    // }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-background p-4 space-y-3">
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          aria-label="Прикрепить файлы"
          data-testid="input-file-hidden"
        />

        {/* <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          data-testid="input-file-hidden"
        /> */}

        <Button
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          data-testid="button-attach"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение..."
          className="min-h-[56px] max-h-[200px] resize-none flex-1"
          disabled={disabled || isLoading}
          data-testid="input-message"
          autoFocus // ← это важно!
        />
        
        <Button
          size="icon"
          onClick={handleSend}
          disabled={(!content.trim() && files.length === 0) || disabled || isLoading}
          data-testid="button-send"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground px-1">
        Enter — отправить, Shift+Enter — новая строка
      </p>
    </div>
  );
}









//  Рабочий файл !!!!!!!!!!
// import React from 'react';
// import { useState, useRef, KeyboardEvent } from "react";
// import { Button } from "../components/ui/button";
// import { Textarea } from "../components/ui/textarea";
// import { Paperclip, Send, Loader2 } from "lucide-react";
// import { FilePreview } from "./file-preview";

// interface MessageInputProps {
//   onSendMessage: (content: string, files: File[]) => void;
//   disabled?: boolean;
//   isLoading?: boolean;
// }

// export function MessageInput({ onSendMessage, disabled, isLoading }: MessageInputProps) {
//   const [content, setContent] = useState("");
//   const [files, setFiles] = useState<File[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   const handleSend = () => {
//     if (!content.trim() && files.length === 0) return;
//     if (disabled || isLoading) return;
    
//     onSendMessage(content, files);
//     setContent("");
//     setFiles([]);
//   };

//   const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       setFiles((prev) => [...prev, ...newFiles]);
//     }
//   };

//   const removeFile = (index: number) => {
//     setFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="border-t bg-background p-4 space-y-3">
//       {files.length > 0 && (
//         <div className="space-y-2">
//           {files.map((file, index) => (
//             <FilePreview
//               key={`${file.name}-${index}`}
//               file={file}
//               onRemove={() => removeFile(index)}
//             />
//           ))}
//         </div>
//       )}

//       <div className="flex items-end gap-2">
//         {/* <input
//           ref={fileInputRef}
//           type="file"
//           multiple
//           className="hidden"
//           onChange={handleFileSelect}
//           accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
//           data-testid="input-file-hidden"
//         /> */}

//         <input
//           ref={fileInputRef}
//           type="file"
//           multiple
//           className="hidden"
//           onChange={handleFileSelect}
//           accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
//           aria-label="Прикрепить файлы"
//           data-testid="input-file-hidden"
//         />

//         <Button
//           size="icon"
//           variant="ghost"
//           onClick={() => fileInputRef.current?.click()}
//           disabled={disabled || isLoading}
//           data-testid="button-attach"
//         >
//           <Paperclip className="w-5 h-5" />
//         </Button>
        
//         <Textarea
//           ref={textareaRef}
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Напишите сообщение..."
//           className="min-h-[56px] max-h-[200px] resize-none"
//           disabled={disabled || isLoading}
//           data-testid="input-message"
//         />
        
//         <Button
//           size="icon"
//           onClick={handleSend}
//           disabled={(!content.trim() && files.length === 0) || disabled || isLoading}
//           data-testid="button-send"
//         >
//           {isLoading ? (
//             <Loader2 className="w-5 h-5 animate-spin" />
//           ) : (
//             <Send className="w-5 h-5" />
//           )}
//         </Button>
//       </div>
      
//       <p className="text-xs text-muted-foreground px-1">
//         Enter — отправить, Shift+Enter — новая строка
//       </p>
//     </div>
//   );
// }
