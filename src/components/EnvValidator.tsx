import React from "react";

/**
 * EnvValidator is a utility component that validates essential environment
 * variables at runtime. If any required variables are missing, it throws a
 * configuration error which is caught by the application's root ErrorBoundary,
 * displaying a friendly system crash message rather than a generic white screen.
 */
export const EnvValidator: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error(
      "Configuration Error: The 'VITE_API_URL' environment variable is missing.\n\n" +
      "Please create a '.env' file in the root directory and define 'VITE_API_URL', " +
      "or verify it is configured in your Vercel Project Environment Variables."
    );
  }

  return null;
};

export default EnvValidator;
