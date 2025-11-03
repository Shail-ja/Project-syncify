import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, MessageSquare } from "lucide-react";

const Teams = () => {
  const teams = [
    {
      name: "Engineering Team",
      description: "Core development and infrastructure",
      members: 12,
      projects: 5,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Design Team",
      description: "UI/UX and product design",
      members: 6,
      projects: 4,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Marketing Team",
      description: "Growth and brand management",
      members: 8,
      projects: 3,
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Product Team",
      description: "Product strategy and management",
      members: 5,
      projects: 6,
      color: "from-orange-500 to-red-500"
    }
  ];

  const members = [
    { name: "Alex Chen", role: "Tech Lead", team: "Engineering", status: "online" },
    { name: "Sarah Johnson", role: "Senior Designer", team: "Design", status: "online" },
    { name: "Mike Wilson", role: "Product Manager", team: "Product", status: "away" },
    { name: "Emily Brown", role: "Marketing Director", team: "Marketing", status: "offline" },
    { name: "David Lee", role: "Full Stack Dev", team: "Engineering", status: "online" },
    { name: "Lisa Garcia", role: "UX Designer", team: "Design", status: "online" },
    { name: "Tom Anderson", role: "DevOps Engineer", team: "Engineering", status: "away" },
    { name: "Rachel Kim", role: "Content Lead", team: "Marketing", status: "online" }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-2">
              Teams
            </h1>
            <p className="text-muted-foreground">Collaborate with your team members</p>
          </div>
          <Button className="bg-primary shadow-glow-primary">
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {teams.map((team, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${team.color} flex items-center justify-center text-white font-bold text-2xl mb-4`}>
                {team.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold mb-2">{team.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{team.members} members</span>
                <Badge variant="outline">{team.projects} projects</Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Team Members */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
          <h2 className="text-2xl font-bold mb-6">Team Members</h2>
          <div className="grid gap-4">
            {members.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12 bg-gradient-cosmic">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role} · {member.team}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Teams;
