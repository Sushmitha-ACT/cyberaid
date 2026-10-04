"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, Suspense, useRef } from "react";
import { Mail, Lock, AlertTriangle, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type AuthMode = "login" | "register" | "forgot";

function AuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [forgotStep, setForgotStep] = useState(1);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to show a temporary toast error
  const showToastError = (message: string) => {
    setError(message);
    setSuccessMsg("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setError("");
    }, 5000); // Hide after 5 seconds
  };

  const showToastSuccess = (message: string) => {
    setSuccessMsg(message);
    setError("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSuccessMsg("");
    }, 5000);
  };

  useEffect(() => {
    // Only show toast if there's a redirect error from OAuth
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      if (errorParam === "OAuthAccountNotLinked" || errorParam === "ManualAccountExists") {
        showToastError("This account uses Email & Password. Please sign in using your password.");
      } else if (errorParam !== "CredentialsSignin") {
        showToastError(`Authentication Error: ${errorParam}`);
      }
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchParams]);

  // Clear error when user types
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (error || successMsg) {
      setError("");
      setSuccessMsg("");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (forgotStep === 1) {
        // Request OTP
        const res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "request", email }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          showToastError(data.error || "Failed to request reset.");
        } else {
          showToastSuccess("OTP sent to your email.");
          if (data.previewUrl) {
            console.log("📧 Ethereal Email Preview URL:", data.previewUrl);
          }
          setForgotStep(2);
        }
      } else if (forgotStep === 2) {
        // Move to Step 3, we validate OTP during the final reset
        if (otp.length < 6) {
          showToastError("Please enter a valid 6-digit OTP.");
        } else {
          setForgotStep(3);
        }
      } else if (forgotStep === 3) {
        // Final Reset
        if (newPassword.length < 6) {
          showToastError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset", email, otp, newPassword }),
        });
        const data = await res.json();

        if (!res.ok) {
          showToastError(data.error || "Failed to reset password.");
        } else {
          showToastSuccess("Password reset successfully. You can now sign in.");
          setAuthMode("login");
          setForgotStep(1);
          setOtp("");
          setNewPassword("");
          setPassword("");
        }
      }
    } catch (err) {
      showToastError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (authMode === "register") {
        // Handle Registration
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          showToastError(`${data.error || "Registration failed"}`);
          setLoading(false);
          return;
        }
        
        // Auto-login after successful registration
        await signIn("credentials", { redirect: false, email, password });
        router.push("/home");
      } else {
        // Handle Login
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          if (res.error === "GoogleAccountExists") {
            showToastError("This account uses Google Sign-In. Please continue with Google.");
          } else {
            showToastError("Invalid email or password.");
          }
          setLoading(false);
        } else {
          router.push("/home");
        }
      }
    } catch (err) {
      showToastError("An unexpected error occurred");
      setLoading(false);
    }
  };

  if (authMode === "forgot") {
    return (
      <div className="flex flex-col w-full relative pb-12">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground mb-1">
            Reset Password
          </h1>
          <p className="text-muted-foreground text-sm">
            {forgotStep === 1 && "Enter your email to receive an OTP"}
            {forgotStep === 2 && "Enter the 6-digit OTP sent to your email"}
            {forgotStep === 3 && "Create a new secure password"}
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          {forgotStep === 1 && (
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  className="w-full bg-input border border-border rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  placeholder="Email address"
                />
              </div>
            </div>
          )}

          {forgotStep === 2 && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input 
                  type="text" 
                  required
                  value={otp}
                  onChange={handleInputChange(setOtp)}
                  className="w-full bg-input border border-border rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground tracking-widest text-center"
                  placeholder="6-DIGIT OTP"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          {forgotStep === 3 && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={handleInputChange(setNewPassword)}
                  className="w-full bg-input border border-border rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  placeholder="New Password"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full font-mono uppercase tracking-wider h-12" disabled={loading}>
            {loading ? "Processing..." : forgotStep === 1 ? "Send OTP" : forgotStep === 2 ? "Verify OTP" : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <button 
            type="button"
            onClick={() => { setAuthMode("login"); setForgotStep(1); setError(""); setSuccessMsg(""); }}
            className="text-primary hover:underline font-medium focus:outline-none"
          >
            Sign in
          </button>
        </div>

        {/* Disappearing Inline Toast Error/Success */}
        <div className="absolute bottom-[-16px] left-0 right-0 flex justify-center pointer-events-none">
          <AnimatePresence>
            {(error || successMsg) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`${error ? "bg-destructive/10 border-destructive/50 text-destructive" : "bg-green-500/10 border-green-500/50 text-green-500"} border text-xs py-2 px-4 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap`}
              >
                {error && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                <span>{error || successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full relative pb-12">
      {/* Dynamic Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground mb-1">
          {authMode === "login" ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {authMode === "login" ? "Welcome back to CyberAid" : "Start your digital recovery plan"}
        </p>
      </div>

      <form onSubmit={handleManualAuth} className="space-y-4">
        {authMode === "register" && (
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <input 
                type="text" 
                required
                value={name}
                onChange={handleInputChange(setName)}
                className="w-full bg-input border border-border rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                placeholder="Full Name"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input 
              type="email" 
              required
              value={email}
              onChange={handleInputChange(setEmail)}
              className="w-full bg-input border border-border rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              placeholder="Email address"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input 
              type="password" 
              required
              value={password}
              onChange={handleInputChange(setPassword)}
              className="w-full bg-input border border-border rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              placeholder="Password"
            />
          </div>
          {authMode === "login" && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => { setAuthMode("forgot"); setError(""); setSuccessMsg(""); }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full font-mono uppercase tracking-wider h-12" disabled={loading}>
          {loading ? "Authenticating..." : (authMode === "login" ? "Sign In" : "Create Account")}
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-panel px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* Google Button */}
      <Button 
        type="button"
        variant="outline" 
        className="w-full flex items-center justify-center gap-3 px-6 h-12 bg-background border-border hover:bg-muted transition-colors"
        onClick={() => signIn("google", { callbackUrl: "/home" })}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="font-medium text-foreground">Continue with Google</span>
      </Button>

      {/* Toggle between Login and Register */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        {authMode === "login" ? (
          <>
            Don't have an account?{" "}
            <button 
              type="button"
              onClick={() => { setAuthMode("register"); setError(""); setSuccessMsg(""); }}
              className="text-primary hover:underline font-medium focus:outline-none"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button 
              type="button"
              onClick={() => { setAuthMode("login"); setError(""); setSuccessMsg(""); }}
              className="text-primary hover:underline font-medium focus:outline-none"
            >
              Sign in
            </button>
          </>
        )}
      </div>

      {/* Disappearing Inline Toast Error/Success */}
      <div className="absolute bottom-[-16px] left-0 right-0 flex justify-center pointer-events-none">
        <AnimatePresence>
          {(error || successMsg) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`${error ? "bg-destructive/10 border-destructive/50 text-destructive" : "bg-green-500/10 border-green-500/50 text-green-500"} border text-xs py-2 px-4 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap`}
            >
              {error && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
              <span>{error || successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SplashAuthButtons() {
  return (
    <Suspense fallback={<div className="h-[300px] w-full flex items-center justify-center text-muted-foreground animate-pulse">Loading secure gateway...</div>}>
      <AuthForm />
    </Suspense>
  );
}
