import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hyperspeed from "@/components/Hyperspeed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";

const SignUp = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    try {
       // Call backend signup
      const resp = await apiPost<{ message: string; token?: string; email: string; requiresEmailVerification?: boolean }>(
        "/auth/register",
        { email, password, firstName, lastName }
      );
    
        // Save token only if email confirmation is disabled in Supabase
      if (resp.token) {
        localStorage.setItem("token", resp.token);
        localStorage.setItem("email", resp.email);
        navigate("/dashboard");
      } else if (resp.requiresEmailVerification) {
        // Email verification required
        setError("Please check your email to verify your account before signing in.");
      } else {
        throw new Error("Registration failed - no token received");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
    
  }

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <Hyperspeed
          effectOptions={{
            distortion: 'deepDistortion',
            fov: 80,
            fovSpeedUp: 120,
            carLightsFade: 0.5,
            totalSideLightSticks: 28,
            lightPairsPerRoadWay: 36,
            colors: {
              background: 0x070314,
              roadColor: 0x0a0a12,
              islandColor: 0x0a0a12,
              shoulderLines: 0x8368ff,
              brokenLines: 0x8368ff,
              leftCars: [0xf0abfc, 0xc084fc, 0xa78bfa],
              rightCars: [0x22d3ee, 0x60a5fa, 0x7dd3fc],
              sticks: 0x7c3aed
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/80" />
      </div>
      <Navigation />
      <div className="max-w-md mx-auto pt-28 px-4">
        <Card className="p-8 space-y-6 bg-card/70 backdrop-blur-md border-border">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground">Start your free trial in minutes</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Create password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500" role="alert">{error}</div>
            )}
            <Button type="submit" className="w-full bg-primary shadow-glow-primary" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/signin" className="text-primary hover:underline">Login</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;


