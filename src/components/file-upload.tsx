import { FileIcon, Upload, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { ErrorMessage } from '@/components/error-message';
import { cn } from '@/lib/utils';

type FileUploadProps = {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileSizeMb?: number;
  hint?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  files,
  onChange,
  maxFiles = 5,
  maxFileSizeMb = 10,
  hint,
}: FileUploadProps) {
  const maxFileSize = maxFileSizeMb * 1024 * 1024;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (incoming: FileList | File[]) => {
    setError(null);
    const toAdd = Array.from(incoming);

    const oversized = toAdd.filter((f) => f.size > maxFileSize);
    if (oversized.length > 0) {
      setError(
        `Files must be under ${maxFileSizeMb} MB. Remove: ${oversized.map((f) => f.name).join(', ')}`,
      );
      return;
    }

    const deduped = toAdd.filter(
      (f) => !files.some((p) => p.name === f.name && p.size === f.size),
    );
    const combined = [...files, ...deduped];

    if (combined.length > maxFiles) {
      setError(`You can attach up to ${maxFiles} files.`);
      return;
    }

    onChange(combined);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'w-full rounded-xl border-2 border-dashed py-8 flex flex-col items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30',
          files.length >= maxFiles && 'pointer-events-none opacity-50',
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Upload className="size-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragging ? 'Drop files here' : 'Click or drag files here'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Up to {maxFiles} files · max {maxFileSizeMb} MB each
          </p>
        </div>
      </button>

      {error && <ErrorMessage message={error} />}

      {/* File list */}
      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.div
            key="files"
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence initial={false}>
              {files.map((file, i) => (
                <motion.div
                  key={`${file.name}-${file.size}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3.5 py-2.5">
                    <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-background border">
                      <FileIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-tight">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="flex-shrink-0 text-muted-foreground/60 hover:text-destructive transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {files.length === 0 && hint && (
        <p className="text-center text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
