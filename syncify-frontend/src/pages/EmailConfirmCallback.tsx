import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { apiPost } from "@/lib/api";

const EmailConfirmCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token from URL hash (Supabase puts it there)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // Also check query params (some flows use query params)
        const queryToken = searchParams.get("token");
        const queryType = searchParams.get("type");

        if (type === "signup" || queryType === "signup") {
          // User just confirmed their email
          if (accessToken) {
            // Exchange the Supabase token for our backend token
            try {
              const resp = await apiPost<{ accessToken: string; user: { email: string } }>(
                "/auth/token",
                {},
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (resp.accessToken) {
                localStorage.setItem("token", resp.accessToken);
                if (resp.user?.email) localStorage.setItem("email", resp.user.email);
                setStatus("success");
                setMessage("Email verified successfully! Redirecting...");
                setTimeout(() => navigate("/dashboard"), 2000);
                return;
              }
            } catch (err: any) {
              console.error("Token exchange error:", err);
              // Try to sign in directly with Supabase session
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              
              if (session && !sessionError) {
                // Exchange session for backend token
                const resp = await apiPost<{ accessToken: string; user: { email: string } }>(
                  "/auth/token",
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${session.access_token}`,
                    },
                  }
                );

                if (resp.accessToken) {
                  localStorage.setItem("token", resp.accessToken);
                  if (resp.user?.email) localStorage.setItem("email", resp.user.email);
                  setStatus("success");
                  setMessage("Email verified successfully! Redirecting...");
                  setTimeout(() => navigate("/dashboard"), 2000);
                  return;
                }
              }
            }
          }

          // If we have tokens, try to set the session
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!sessionError) {
              // Get the session and exchange for backend token
              const { data: { session } } = await supabase.auth.getSession();
              
              if (session) {
                const resp = await apiPost<{ accessToken: string; user: { email: string } }>(
                  "/auth/token",
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${session.access_token}`,
                    },
                  }
                );

                if (resp.accessToken) {
                  localStorage.setItem("token", resp.accessToken);
                  if (resp.user?.email) localStorage.setItem("email", resp.user.email);
                  setStatus("success");
                  setMessage("Email verified successfully! Redirecting...");
                  setTimeout(() => navigate("/dashboard"), 2000);
                  return;
                }
              }
            }
          }
        }

        // If no token in URL, check if user is already authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && !sessionError) {
          // User is already authenticated, exchange for backend token
          const resp = await apiPost<{ accessToken: string; user: { email: string } }>(
            "/auth/token",
            {},
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          if (resp.accessToken) {
            localStorage.setItem("token", resp.accessToken);
            if (resp.user?.email) localStorage.setItem("email", resp.user.email);
            setStatus("success");
            setMessage("Email verified successfully! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 2000);
            return;
          }
        }

        setStatus("error");
        setMessage("Failed to verify email. Please try signing in.");
        setTimeout(() => navigate("/signin"), 3000);
      } catch (error: any) {
        console.error("Email confirmation error:", error);
        setStatus("error");
        setMessage(error?.message || "Failed to verify email. Please try signing in.");
        setTimeout(() => navigate("/signin"), 3000);
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center space-y-4">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">{message}</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <p className="text-lg font-semibold">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="text-red-500 text-4xl mb-4">✗</div>
              <p className="text-lg font-semibold text-red-500">{message}</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmailConfirmCallback;

