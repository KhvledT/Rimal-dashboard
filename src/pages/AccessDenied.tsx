import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthContext.js";
import { ROUTE_PATHS } from "../constants/index.js";
import { Button } from "../components/ui/Button.js";

export const AccessDenied = () => {
  const { logout, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTE_PATHS.LOGIN, { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-6 select-none font-body">
      <div className="max-w-md w-full bg-white shadow-sm border border-border rounded p-8 text-center">
        {/* Shield Alert Icon */}
        <div className="w-16 h-16 bg-amber-50 text-gold rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
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
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
            />
          </svg>
        </div>

        <h1 className="text-lg font-bold text-navy mb-2 tracking-wide uppercase">
          Access Restriction Active
        </h1>
        
        {user && (
          <p className="text-[11px] text-gold uppercase tracking-wider font-semibold mb-4">
            Logged In As: {user.userName} ({user.email})
          </p>
        )}

        <p className="text-xs text-gray-600 leading-relaxed mb-6 font-body">
          Your account has been registered and verified successfully. However, dashboard administration access is restricted to approved **Admins** and **Super Admins** only. 
          <br /><br />
          Please contact the system administrator to promote your account.
        </p>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full py-2.5"
          isLoading={isLoading}
        >
          Return to Sign In
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
