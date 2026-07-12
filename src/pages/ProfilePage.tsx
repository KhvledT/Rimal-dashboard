import React, { useState } from "react";
import { toast } from "sonner";
import {
  useProfileQuery,
  useUploadProfile,
  useDeleteProfile,
} from "../hooks/index.js";
import { profileService } from "../services/profile.service.js";
import { Button } from "../components/ui/Button.js";
import { UploadZone } from "../components/ui/UploadZone.js";
import { States } from "../components/ui/States.js";
import { Modal } from "../components/ui/Modal.js";

export const ProfilePage = () => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { data: profile, isLoading, isError, error, refetch } = useProfileQuery();

  const uploadMutation = useUploadProfile();
  const deleteMutation = useDeleteProfile();

  const handleFileUpload = async (file: File) => {
    try {
      setUploadProgress(0.1);
      await uploadMutation.mutateAsync({
        file,
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });
      toast.success("Corporate Profile PDF uploaded successfully.");
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || "Failed to upload corporate profile.");
    } finally {
      setUploadProgress(0);
    }
  };

  const onDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync();
      toast.success("Corporate Profile PDF deleted successfully.");
      setIsDeleteOpen(false);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || "Failed to delete profile document.");
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <States.LoadingState message="Checking corporate profile files..." />;
  }

  // Handle case where profile has not been uploaded yet
  // Mapped from backend NotFound domain error check (e.g. 404 means no profile uploaded)
  const isNoProfile = isError && (error as { status?: number } | null)?.status === 404;

  if (isError && !isNoProfile) {
    return <States.ErrorState message={error?.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 select-none font-body max-w-4xl">
      <div>
        <h2 className="text-base font-bold text-navy uppercase tracking-wider">
          Corporate Profile
        </h2>
        <p className="text-xs text-gray-500 font-body">
          Upload, manage, and replace the corporate overview PDF file served on the public website.
        </p>
      </div>

      {isNoProfile || !profile ? (
        <div className="bg-white rounded border border-border p-6 shadow-sm space-y-6">
          <States.EmptyState
            title="No Document Uploaded"
            description="There is currently no corporate profile PDF uploaded to storage. The public download link will fail until a document is provided."
          />
          <div className="border-t border-border pt-6">
            <h3 className="text-xs font-semibold text-navy uppercase tracking-wider mb-3">
              Upload Profile Document
            </h3>
            <UploadZone
              onFileSelect={handleFileUpload}
              accept="application/pdf"
              maxSizeMB={20}
              label="Select Corporate Profile PDF"
              subLabel="PDF format only, maximum size 20MB"
              error={uploadMutation.error?.message}
              uploadProgress={uploadProgress > 0 ? uploadProgress : undefined}
            />
            {uploadMutation.isPending && uploadProgress === 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gold">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gold"></span>
                Orchestrating pre-signed URL upload sequence...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metadata Display Card */}
            <div className="bg-white rounded border border-border p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2">
                  Document Details
                </h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <span className="text-gray-400 font-body">Filename:</span>
                  <span className="col-span-2 text-navy font-semibold truncate" title={profile.originalFilename}>
                    {profile.originalFilename}
                  </span>

                  <span className="text-gray-400 font-body">File Size:</span>
                  <span className="col-span-2 text-navy font-semibold">
                    {formatBytes(profile.size)}
                  </span>

                  <span className="text-gray-400 font-body">Format type:</span>
                  <span className="col-span-2 text-navy font-semibold font-mono text-[10px]">
                    {profile.mimeType}
                  </span>

                  <span className="text-gray-400 font-body">Last Updated:</span>
                  <span className="col-span-2 text-navy font-semibold">
                    {formatDate(profile.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-8 border-t border-border pt-4 text-xs font-semibold uppercase tracking-wider text-white">
                <a
                  href={profileService.getDownloadUrl()}
                  className="bg-gold hover:bg-gold-light px-4 py-2 rounded shadow transition flex items-center gap-1.5"
                  title="Download directly from streaming endpoint"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Download PDF
                </a>
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteOpen(true)}
                  className="py-2 px-4 shadow flex items-center gap-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                  Delete File
                </Button>
              </div>
            </div>

            {/* Replace file uploader panel */}
            <div className="bg-white rounded border border-border p-6 shadow-sm flex flex-col">
              <h3 className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2 mb-4">
                Replace Document
              </h3>
              <UploadZone
                onFileSelect={handleFileUpload}
                accept="application/pdf"
                maxSizeMB={20}
                label="Select New PDF File"
                subLabel="Will overwrite existing profile"
                error={uploadMutation.error?.message}
                uploadProgress={uploadProgress > 0 ? uploadProgress : undefined}
              />
              {uploadMutation.isPending && uploadProgress === 0 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gold">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gold"></span>
                  Processing signed URL workflow...
                </div>
              )}
            </div>
          </div>

          {/* Interactive Live PDF Preview Card */}
          {profile.previewUrl && (
            <div className="bg-white rounded border border-border p-6 shadow-sm flex flex-col">
              <h3 className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2 mb-4 flex items-center justify-between">
                <span>Interactive Live Preview</span>
                <span className="text-[10px] text-gold font-bold uppercase tracking-widest font-mono">PDF Viewer</span>
              </h3>
              <div className="bg-sand border border-border rounded overflow-hidden aspect-[4/3] w-full relative">
                <iframe
                  title="PDF Live Preview Frame"
                  src={`${profile.previewUrl}#toolbar=0&navpanes=0&statusbar=0`}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-none"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Profile Deletion"
        description="This action will permanently delete the Corporate Profile PDF from Supabase storage buckets and MongoDB records. The download action on the public website will fail."
      >
        <div className="flex items-center justify-end gap-3 pt-4 select-none">
          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onDeleteConfirm}
            isLoading={deleteMutation.isPending}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
