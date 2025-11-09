import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Hyperspeed from "@/components/Hyperspeed";
import Navigation from "@/components/Navigation";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import MagicBento from "@/components/MagicBento";
import { Link, Navigate } from "react-router-dom";
import { Rocket, Users, Zap, Shield, BarChart3, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status using Supabase session
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Auth check error:", error);
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(!!session?.access_token);
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.access_token);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading while checking authentication, then redirect if authenticated
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates and instant communication"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Experience blazing fast performance with our optimized infrastructure"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control and encryption"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Track progress with comprehensive analytics and insightful metrics"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Real-time Chat",
      description: "Communicate instantly with integrated team messaging and notifications"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Project Management",
      description: "Organize tasks with intuitive Kanban boards and dependency tracking"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section with Hyperspeed Background */}
      <section className="relative h-screen w-full overflow-hidden">
        <Hyperspeed />
        <div className="absolute top-6 left-6 z-20">
          <img
            src="/brand/collabspace-logo.png"
            alt="CollabSpace"
            className="h-10 w-auto drop-shadow-[0_0_18px_rgba(132,0,255,0.25)]"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-cosmic bg-clip-text text-transparent animate-glow-pulse">
              CollabSpace
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto ">
              The next-generation platform for teams to collaborate, manage projects, and achieve extraordinary results together
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link to="/signup">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-glow shadow-glow-primary transition-all duration-300 hover:scale-105 text-lg px-8 py-6"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link to="/projects">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-primary/50 hover:border-primary hover:bg-primary/10 text-lg px-8 py-6 transition-all duration-300"
                >
                  View Projects
                </Button>
              </Link>
            </div>

            <div className="pt-12 text-sm text-muted-foreground">
              <p>🚀 Join 10,000+ teams already using CollabSpace</p>
            </div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to supercharge your team's productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-8 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary hover:scale-105 group"
              >
                <div className="text-primary mb-4 group-hover:animate-float">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Magic Bento Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
              Powerful Capabilities
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our platform's features designed to enhance your productivity
            </p>
          </div>
          <div className="flex justify-center">
            <MagicBento 
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
            />
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
              Track Your Performance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get insights into your website analytics with our comprehensive dashboard
            </p>
          </div>
          <AnalyticsDashboard />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-muted-foreground">
            Start your free trial today. No credit card required.
          </p>
          <Link to="/signup">
          <Button 
            size="lg"
            className="bg-secondary hover:bg-secondary-glow shadow-glow-secondary transition-all duration-300 hover:scale-105 text-secondary-foreground text-lg px-10 py-6"
          >
            Start Free Trial
          </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 CollabSpace. Built for the future of work.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
