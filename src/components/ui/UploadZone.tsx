import React, { useRef, useState, DragEvent, ChangeEvent } from "react";
import { cn } from "../../lib/utils.js";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  subLabel?: string;
  error?: string;
  uploadProgress?: number; // Real upload progress (0 to 100)
}

export const UploadZone = ({
  onFileSelect,
  accept = "application/pdf",
  maxSizeMB = 10,
  label = "Upload file",
  subLabel = "Drag and drop or click to select",
  error: externalError,
  uploadProgress,
}: UploadZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = (file: File): boolean => {
    setLocalError(null);

    // Validate type
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileName.endsWith(type);
      }
      if (type.endsWith("/*")) {
        return fileType.startsWith(type.replace("/*", ""));
      }
      return fileType === type;
    });

    if (!isAccepted) {
      setLocalError(`Invalid file format. Accepted formats: ${accept}`);
      return false;
    }

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setLocalError(`File size exceeds limit of ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const onZoneClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const displayError = externalError || localError;
  const isUploading = uploadProgress !== undefined && uploadProgress > 0 && uploadProgress < 100;

  return (
    <div className="w-full">
      <div
        onClick={onZoneClick}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "w-full cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded p-6 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy",
          isDragActive
            ? "border-burgundy bg-burgundy/5 scale-[1.01]"
            : "border-border bg-sand/30 hover:bg-sand/65 hover:border-gold",
          displayError ? "border-red-400 bg-red-50/15" : "",
          isUploading ? "pointer-events-none opacity-80" : ""
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />

        <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-gold mb-3 transition shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
            />
          </svg>
        </div>

        <p className="text-xs font-bold text-navy uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-[11px] text-gray-500 font-body">{subLabel}</p>

        {/* Real Axios Upload Progress Bar */}
        {uploadProgress !== undefined && uploadProgress > 0 && (
          <div className="mt-4 w-full max-w-xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-navy">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-sand-200 border border-border/40 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-burgundy h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {selectedFile && !isUploading && (
          <div className="mt-4 p-2.5 bg-white rounded border border-border inline-flex items-center gap-2.5 max-w-xs text-left shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-4 h-4 text-gold flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-navy truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-gray-400 font-body">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="flex items-center gap-1 text-[11px] text-red-600 font-medium font-body mt-1.5 pl-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          {displayError}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
