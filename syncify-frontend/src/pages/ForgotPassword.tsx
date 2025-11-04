import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hyperspeed from "@/components/Hyperspeed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <Hyperspeed
          effectOptions={{
            distortion: 'xyDistortion',
            fov: 80,
            fovSpeedUp: 120,
            colors: {
              background: 0x060312,
              roadColor: 0x0a0a12,
              islandColor: 0x0a0a12,
              shoulderLines: 0x93c5fd,
              brokenLines: 0x93c5fd,
              leftCars: [0xf0abfc, 0xd8b4fe, 0xa78bfa],
              rightCars: [0x7dd3fc, 0x60a5fa, 0x93c5fd],
              sticks: 0x4f46e5
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/80" />
      </div>
      <Navigation />
      <div className="max-w-md mx-auto pt-28 px-4">
        <Card className="p-8 space-y-6 bg-card/70 backdrop-blur-md border-border">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Reset your password</h1>
            <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
          </div>
          {!submitted ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-primary shadow-glow-primary">Send reset link</Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p>We have sent a reset link to <span className="font-semibold">{email}</span> if it exists in our system.</p>
              <Link to="/signin" className="text-primary hover:underline">Back to Login</Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;


