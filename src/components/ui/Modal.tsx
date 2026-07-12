import React, { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils.js";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Semi-transparent Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />

        {/* Modal Window Content Container */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] md:w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded bg-white p-5 md:p-6 shadow-xl border border-border focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200 ease-out select-none",
            className
          )}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <DialogPrimitive.Title className="text-sm font-semibold uppercase tracking-wider text-navy">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-xs text-gray-500 font-body mt-1">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>

            {/* Close Button Trigger */}
            <DialogPrimitive.Close className="text-gray-400 hover:text-navy rounded transition p-1 hover:bg-sand focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Child content container */}
          <div className="max-h-[75vh] overflow-y-auto pr-1">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Modal;
