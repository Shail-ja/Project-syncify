import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, CheckCircle2, Clock, Plus } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { label: "Active Projects", value: "12", icon: <TrendingUp className="w-6 h-6" />, trend: "+15%" },
    { label: "Team Members", value: "48", icon: <Users className="w-6 h-6" />, trend: "+3%" },
    { label: "Completed Tasks", value: "284", icon: <CheckCircle2 className="w-6 h-6" />, trend: "+24%" },
    { label: "Hours This Week", value: "156", icon: <Clock className="w-6 h-6" />, trend: "+8%" }
  ];

  const recentProjects = [
    { name: "Mobile App Redesign", progress: 75, team: 8, deadline: "2 days" },
    { name: "Backend API Development", progress: 45, team: 5, deadline: "1 week" },
    { name: "Marketing Campaign", progress: 90, team: 6, deadline: "Today" },
    { name: "Database Migration", progress: 30, team: 4, deadline: "2 weeks" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-primary">{stat.icon}</div>
                <span className="text-sm text-green-500">{stat.trend}</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <Button size="sm" className="bg-primary shadow-glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="grid gap-4">
            {recentProjects.map((project, index) => (
              <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.team} team members · Due in {project.deadline}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{project.progress}%</p>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>
                <Progress value={project.progress} className="h-2" />
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex flex-col space-y-2">
              <Plus className="w-6 h-6" />
              <span>Create Task</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col space-y-2">
              <Users className="w-6 h-6" />
              <span>Invite Team</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col space-y-2">
              <TrendingUp className="w-6 h-6" />
              <span>View Reports</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col space-y-2">
              <Clock className="w-6 h-6" />
              <span>Time Tracking</span>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
