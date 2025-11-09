import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { WavyBackground } from "@/components/ui/wavy-background"; 

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn("Session check error:", sessionError);
          setIsCheckingAuth(false);
          return;
        }
        
        // If user is already authenticated, redirect to dashboard
        if (session?.access_token) {
          navigate("/dashboard", { replace: true });
          return;
        }
        
        setIsCheckingAuth(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      if (!data.session) {
        throw new Error("Email is not verified. Please verify before login.");
      }

      const accessToken = data.session.access_token;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("email", email);

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      {/* 🎨 Background Layer */}
      <div className="absolute inset-0 -z-10">
        <WavyBackground
          backgroundFill="#0f0f11"
          waveOpacity={0.8}
          blur={8}
          speed="slow"
          colors={["#7c3aed", "#8b5cf6", "#a78bfa", "#c084fc"]}
        />
      </div>

      {/* 🌐 Navigation */}
      <Navigation />

      {/* 💳 Login Card */}
      <div className="max-w-md mx-auto pt-28 px-4 relative z-10">
        <Card className="p-8 space-y-6 bg-black/40 backdrop-blur-lg border border-white/10 shadow-2xl">
          <h1 className="text-3xl font-bold text-center text-white">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-white">Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button disabled={isLoading} className="w-full">
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="text-sm text-center text-white">
            New here?{" "}
            <Link to="/signup" className="underline hover:text-gray-200">
              Create an account
            </Link>
          </p>
          <p className="text-sm text-center">
            <Link
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
