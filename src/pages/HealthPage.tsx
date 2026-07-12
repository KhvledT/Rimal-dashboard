import React from "react";
import { useHealthQuery } from "../hooks/index.js";
import { States } from "../components/ui/States.js";
import { Button } from "../components/ui/Button.js";

export const HealthPage = () => {
  const { data: health, isLoading, isError, error, refetch, isFetching } = useHealthQuery();

  const getStatusBadge = (status: "UP" | "DOWN" | undefined) => {
    if (status === "UP") {
      return (
        <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-ping"></span>
          Operational
        </span>
      );
    }
    return (
      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
        Offline
      </span>
    );
  };

  const getCardStatusIndicator = (status: "UP" | "DOWN" | undefined) => {
    if (status === "UP") {
      return (
        <div className="flex items-center gap-1.5 text-green-600 font-semibold text-xs mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Connected
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-red-600 font-semibold text-xs mt-1">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        Unavailable
      </div>
    );
  };

  if (isLoading) {
    return <States.LoadingState message="Running system diagnostics..." />;
  }

  if (isError) {
    return <States.ErrorState message={error?.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 select-none font-body max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy uppercase tracking-wider">
            System Diagnostics
          </h2>
          <p className="text-xs text-gray-500 font-body">
            Monitor real-time status of backend REST endpoints, database layers, and storage vaults.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          isLoading={isFetching}
          className="text-xs font-semibold py-2 px-4 shadow uppercase"
        >
          Refresh Status
        </Button>
      </div>

      {/* Main Status Container */}
      <div className="bg-white rounded border border-border p-6 shadow-sm space-y-6">
        {/* Core Status Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
              Overall Status
            </span>
            {getStatusBadge(health?.status)}
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
              Uptime
            </span>
            <span className="text-sm font-semibold text-navy leading-none">
              {health?.uptime?.human || "—"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
              Check Timestamp
            </span>
            <span className="text-xs font-semibold text-navy font-mono">
              {health?.timestamp ? new Date(health.timestamp).toLocaleString() : "—"}
            </span>
          </div>
        </div>

        {/* Diagnostic Services Gauges */}
        <div>
          <h3 className="text-xs font-semibold text-navy uppercase tracking-wider mb-4">
            Component Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Server health check */}
            <div className="p-4 bg-sand border border-border rounded flex flex-col justify-between h-28">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  REST Server
                </span>
                <span className="text-xs text-gray-500 font-body block mt-0.5">
                  Express API Gateway
                </span>
              </div>
              {getCardStatusIndicator(health?.services?.server?.status)}
            </div>

            {/* DB health check */}
            <div className="p-4 bg-sand border border-border rounded flex flex-col justify-between h-28">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Database
                </span>
                <span className="text-xs text-gray-500 font-body block mt-0.5">
                  Mongoose MongoDB Atlas
                </span>
              </div>
              {getCardStatusIndicator(health?.services?.database?.status)}
            </div>

            {/* Storage health check */}
            <div className="p-4 bg-sand border border-border rounded flex flex-col justify-between h-28">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Storage Vault
                </span>
                <span className="text-xs text-gray-500 font-body block mt-0.5">
                  Supabase file bucket
                </span>
              </div>
              {getCardStatusIndicator(health?.services?.storage?.status)}
            </div>
          </div>
        </div>

        {/* Runtime specs */}
        <div className="border-t border-border pt-4">
          <h3 className="text-xs font-semibold text-navy uppercase tracking-wider mb-3">
            System Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Environment</span>
              <span className="font-semibold text-navy font-mono capitalize">{health?.environment || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Node Runtime</span>
              <span className="font-semibold text-navy font-mono">{health?.runtime?.node || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Build Version</span>
              <span className="font-semibold text-navy font-mono">{health?.version || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
