import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../providers/AuthContext.js";
import { permissions } from "../lib/permissions.js";
import { ROUTE_PATHS } from "../constants/index.js";
import Logo from "../../public/Logo.webp";
import {
  loginSchema,
  signupSchema,
  LoginInput,
  SignupInput,
  VerifyOtpInput,
} from "../schemas/validation.js";
import { Button } from "../components/ui/Button.js";

type AuthMode = "login" | "signup" | "verify";

export const Login = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [emailToVerify, setEmailToVerify] = useState<string>("");
  const [verifyCredentials, setVerifyCredentials] = useState<
    Omit<VerifyOtpInput, "otp" | "phone">
  >({
    email: "",
    username: "",
    password: "",
  });
  const [resendTimer, setResendTimer] = useState<number>(0);

  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);

  const { login, signup, verifyOtp, resendOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  // Reset transient fields when switching modes
  useEffect(() => {
    setShowPassword(false);
    setIsCapsLock(false);
  }, [mode]);

  // Handle Resend OTP Countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLock(e.getModifierState("CapsLock"));
  };

  // Form setups using centralized schemas
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const verifyForm = useForm<{ otp: string; phone?: string }>({
    defaultValues: { otp: "", phone: "" },
  });

  const onLoginSubmit = async (data: LoginInput) => {
    try {
      await login({
        ...data,
        identifier: data.identifier.trim(),
      });
      toast.success("Signed in successfully.");
      const savedUser = getAuthContext();
      if (savedUser && permissions.hasDashboardAccess(savedUser)) {
        navigate(ROUTE_PATHS.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTE_PATHS.ACCESS_DENIED, { replace: true });
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || "Invalid credentials. Please try again.");
    }
  };

  const onSignupSubmit = async (data: SignupInput) => {
    try {
      await signup(data);
      toast.success("Verification code sent to your email.");
      setEmailToVerify(data.email);
      setVerifyCredentials({
        email: data.email,
        username: data.username,
        password: data.password,
      });
      verifyForm.reset({ otp: "", phone: "" });
      setMode("verify");
      setResendTimer(60);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || "Sign up failed. Please try again.");
    }
  };

  const onVerifySubmit = async (data: { otp: string; phone?: string }) => {
    try {
      const fullVerifyData: VerifyOtpInput = {
        ...verifyCredentials,
        otp: data.otp,
        phone: data.phone || undefined,
      };
      await verifyOtp(fullVerifyData);
      toast.success("Account verified successfully! You may now sign in.");
      setMode("login");
      loginForm.setValue("identifier", verifyCredentials.username);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(
        errorObj.message || "Verification failed. Check the OTP code.",
      );
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOtp({ email: emailToVerify });
      toast.success("Verification code resent successfully.");
      setResendTimer(60);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || "Unable to resend code.");
    }
  };

  const getAuthContext = () => {
    const data = localStorage.getItem("rimal_user_profile");
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col md:flex-row font-body select-none">
      {/* Branding Left Panel (Desktop only) */}
      <div className="hidden md:flex md:w-1/2 bg-burgundy text-white flex-col justify-between p-12 border-r-4 border-gold relative overflow-hidden">
        {/* Background Decorative Graphic */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full border border-white -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-64 h-64 rounded-full border border-white bottom-10 right-10"></div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <img
            src={Logo}
            alt="Rimal Logo"
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="font-bold text-lg leading-none tracking-widest font-serif text-white uppercase">
              Rimal Trading Group
            </h1>
            <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
              DRIVEN BY IDEAS, POWERED BY TRUST.
            </span>
          </div>
        </div>

        <div className="my-auto max-w-sm relative z-10">
          <p className="text-xs text-gold uppercase tracking-widest font-bold mb-2">
            Admin Console Portal
          </p>
          <h2 className="text-2xl font-serif text-white leading-tight uppercase font-medium mb-4">
            Security & Controls Centre
          </h2>
          <p className="text-xs text-gray-300 font-body leading-relaxed">
            Manage company team listings, contact info records, visitor
            inquiries, and system monitoring from a centralized brand cockpit.
          </p>
        </div>

        <div className="text-[10px] text-gray-400 font-body relative z-10">
          &copy; 2026 Rimal Trading Group. All rights reserved.
        </div>
      </div>

      {/* Forms Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:w-1/2 bg-sand">
        <div className="max-w-md w-full bg-white rounded border border-border shadow-sm p-8 flex flex-col">
          {/* Logo / Header for mobile */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <div className="w-8 h-8 rounded bg-burgundy flex items-center justify-center text-white font-bold text-base">
              R
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wider font-serif text-navy leading-none">
                RIMAL
              </h2>
              <span className="text-[9px] text-gold uppercase font-semibold">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Mode Titles */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-navy uppercase tracking-wider">
              {mode === "login" && "Sign In"}
              {mode === "signup" && "Initiate Registration"}
              {mode === "verify" && "Verify Registration"}
            </h3>
            <p className="text-xs text-gray-500 font-body mt-1">
              {mode === "login" &&
                "Enter your admin credentials to access the panels."}
              {mode === "signup" && "Create an admin registry account."}
              {mode === "verify" &&
                `A six-digit OTP has been sent to ${emailToVerify}`}
            </p>
          </div>

          {/* 1. Login Mode Form */}
          {mode === "login" && (
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              noValidate
              className="space-y-4 font-body"
            >
              <fieldset disabled={isLoading} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    autoFocus
                    autoComplete="on"
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="Enter your email or username"
                    {...loginForm.register("identifier")}
                    className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                  {loginForm.formState.errors.identifier && (
                    <p className="text-[10px] text-red-600 font-medium mt-1">
                      {loginForm.formState.errors.identifier.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                      onKeyUp={checkCapsLock}
                      className="w-full bg-sand border border-border rounded py-2 pl-3 pr-10 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-gray-400 hover:text-navy p-1 transition focus:outline-none"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
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
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.395 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
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
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {isCapsLock && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                        />
                      </svg>
                      Warning: Caps Lock is ON
                    </p>
                  )}
                  {loginForm.formState.errors.password && (
                    <p className="text-[10px] text-red-600 font-medium mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-2.5 mt-2"
                  isLoading={isLoading}
                >
                  Log In
                </Button>
              </fieldset>

              <div className="text-center pt-4 border-t border-border mt-4 text-[11px]">
                <span className="text-gray-500 font-body">
                  Need an account?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-burgundy font-semibold hover:text-burgundy-deep transition"
                >
                  Create Registry Entry
                </button>
              </div>
            </form>
          )}

          {/* 2. Signup Mode Form */}
          {mode === "signup" && (
            <form
              onSubmit={signupForm.handleSubmit(onSignupSubmit)}
              className="space-y-4 font-body"
            >
              <fieldset disabled={isLoading} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="new_user"
                    {...signupForm.register("username")}
                    className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                  {signupForm.formState.errors.username && (
                    <p className="text-[10px] text-red-600 font-medium mt-1">
                      {signupForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="user@rimal.com"
                    {...signupForm.register("email")}
                    className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-[10px] text-red-600 font-medium mt-1">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...signupForm.register("password")}
                      onKeyUp={checkCapsLock}
                      className="w-full bg-sand border border-border rounded py-2 pl-3 pr-10 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-gray-400 hover:text-navy p-1 transition focus:outline-none"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
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
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.395 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
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
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {isCapsLock && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                        />
                      </svg>
                      Warning: Caps Lock is ON
                    </p>
                  )}
                  {signupForm.formState.errors.password && (
                    <p className="text-[10px] text-red-600 font-medium mt-1">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-2.5 mt-2"
                  isLoading={isLoading}
                >
                  Request Verification Code
                </Button>
              </fieldset>

              <div className="text-center pt-4 border-t border-border mt-4 text-[11px]">
                <span className="text-gray-500 font-body">
                  Already have an account?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-burgundy font-semibold hover:text-burgundy-deep transition"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* 3. Verify OTP Mode Form */}
          {mode === "verify" && (
            <form
              onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
              className="space-y-4 font-body"
            >
              <fieldset disabled={isLoading} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                    Six-Digit OTP
                  </label>
                  <input
                    type="text"
                    autoFocus
                    maxLength={6}
                    placeholder="123456"
                    {...verifyForm.register("otp", {
                      required: true,
                      minLength: 6,
                    })}
                    className="w-full bg-sand border border-border rounded py-2 px-3 text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                    Telephone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+974 4400 1234"
                    {...verifyForm.register("phone")}
                    className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-2.5 mt-2"
                  isLoading={isLoading}
                >
                  Verify OTP
                </Button>
              </fieldset>

              <div className="flex items-center justify-between pt-4 border-t border-border mt-4 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-gray-500 hover:text-navy transition font-body"
                >
                  &larr; Back to Sign Up
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className="text-burgundy font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:text-burgundy-deep transition"
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend OTP Code"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
