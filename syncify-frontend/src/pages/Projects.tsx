import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, MoreVertical } from "lucide-react";

const Projects = () => {
  const projects = [
    {
      id: "7153842",
      name: "Mobile App Redesign",
      description: "Complete overhaul of the mobile application UI/UX",
      status: "In Progress",
      priority: "High",
      team: 8,
      tasks: { completed: 45, total: 60 },
      deadline: "Dec 15, 2025",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "2047619",
      name: "Backend API Development",
      description: "RESTful API development for new microservices",
      status: "In Progress",
      priority: "High",
      team: 5,
      tasks: { completed: 23, total: 51 },
      deadline: "Jan 10, 2026",
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: "8930417",
      name: "Marketing Campaign",
      description: "Q1 2026 marketing strategy and content creation",
      status: "Review",
      priority: "Medium",
      team: 6,
      tasks: { completed: 54, total: 60 },
      deadline: "Dec 8, 2025",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "3567204",
      name: "Database Migration",
      description: "Migrate from PostgreSQL to distributed database",
      status: "Planning",
      priority: "Medium",
      team: 4,
      tasks: { completed: 12, total: 40 },
      deadline: "Feb 1, 2026",
      color: "from-orange-500 to-red-500"
    },
    {
      id: "6401593",
      name: "Security Audit",
      description: "Comprehensive security review and penetration testing",
      status: "In Progress",
      priority: "Critical",
      team: 3,
      tasks: { completed: 18, total: 35 },
      deadline: "Dec 20, 2025",
      color: "from-red-500 to-rose-500"
    },
    {
      id: "5782316",
      name: "Customer Portal",
      description: "Self-service portal for customer management",
      status: "Planning",
      priority: "Low",
      team: 7,
      tasks: { completed: 5, total: 45 },
      deadline: "Mar 15, 2026",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "Review": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "Planning": return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-500/20 text-red-400 border-red-500/50";
      case "High": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "Medium": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "Low": return "bg-green-500/20 text-green-400 border-green-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-2">
              Projects
            </h1>
            <p className="text-muted-foreground">Manage and track all your active projects</p>
          </div>
          <Button className="bg-primary shadow-glow-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${project.color} flex items-center justify-center text-white font-bold text-xl`}>
                  {project.name.charAt(0)}
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="text-xl font-bold mb-2">{project.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground truncate">ID: {project.id}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => navigator.clipboard.writeText(project.id)}
                >
                  Copy ID
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{Math.round((project.tasks.completed / project.tasks.total) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${project.color}`}
                    style={{ width: `${(project.tasks.completed / project.tasks.total) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{project.team} members</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{project.deadline}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Projects;
