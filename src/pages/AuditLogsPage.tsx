import React from "react";

export const AuditLogsPage = () => {
  return (
    <div className="space-y-6 select-none font-body">
      {/* Page Header */}
      <div>
        <h2 className="text-base font-bold text-navy uppercase tracking-wider">
          Audit Logs
        </h2>
        <p className="text-xs text-gray-500 font-body">
          Track security actions and record updates inside the administration console.
        </p>
      </div>

      {/* Placeholder Information Panel */}
      <div className="bg-white rounded border border-border p-8 text-center max-w-xl mx-auto shadow-sm mt-12">
        <div className="w-16 h-16 bg-sand text-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            />
          </svg>
        </div>

        <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-2">
          Audit Logs Pending Implementation
        </h3>
        
        <p className="text-xs text-gray-500 leading-relaxed font-body">
          Audit Logs will be available after the backend audit module is implemented.
          <br /><br />
          The routing and sidebar navigation configurations are fully prepared. Once the backend introduces `/audit-logs` endpoints, they can be immediately connected here without modifying the dashboard layouts.
        </p>
      </div>
    </div>
  );
};

export default AuditLogsPage;
