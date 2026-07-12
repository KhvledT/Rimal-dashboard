/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";

interface QueryClientContextType {
  queryClient: QueryClient | null;
}

const QueryClientContext = createContext<QueryClientContextType>({
  queryClient: null,
});

export const QueryClientProviderWrapper = ({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) => {
  return (
    <QueryClientContext.Provider value={{ queryClient }}>
      {children}
    </QueryClientContext.Provider>
  );
};

export const useQueryClientContext = () => {
  return useContext(QueryClientContext);
};
