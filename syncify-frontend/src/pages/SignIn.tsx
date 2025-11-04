import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hyperspeed from "@/components/Hyperspeed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiPost<{ message: string }>("/auth/login", { email, password });
      const tokenResp = await apiPost<{ token: string; email: string }>("/auth/token", { email });
      localStorage.setItem("token", tokenResp.token);
      localStorage.setItem("email", tokenResp.email);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <Hyperspeed
          effectOptions={{
            distortion: 'turbulentDistortion',
            fov: 85,
            fovSpeedUp: 130,
            carLightsFade: 0.45,
            totalSideLightSticks: 24,
            lightPairsPerRoadWay: 40,
            colors: {
              background: 0x05010f,
              roadColor: 0x0a0a12,
              islandColor: 0x0a0a12,
              shoulderLines: 0x60a5fa,
              brokenLines: 0x60a5fa,
              leftCars: [0xf472b6, 0xd946ef, 0x8b5cf6],
              rightCars: [0x22d3ee, 0x38bdf8, 0x60a5fa],
              sticks: 0x2563eb
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/80" />
      </div>
      <Navigation />
      <div className="max-w-md mx-auto pt-28 px-4">
        <Card className="p-8 space-y-6 bg-card/70 backdrop-blur-md border-border">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted-foreground">Welcome back</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div className="text-sm text-red-500" role="alert">{error}</div>
            )}
            <Button type="submit" className="w-full bg-primary shadow-glow-primary" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;


