import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MoreHorizontal, Users, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";

const Teams = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<"join" | "create">("join");
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createTags, setCreateTags] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const colors = ["bg-yellow-500", "bg-indigo-600", "bg-pink-600", "bg-yellow-400", "bg-blue-600", "bg-cyan-600", "bg-fuchsia-600", "bg-teal-700", "bg-green-600", "bg-purple-600", "bg-red-600", "bg-orange-600"];
  
  const [teams, setTeams] = useState<Array<{ id: string; title: string; color: string; initials: string; people: number; projects: number; slug: string; description?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await apiGet<{ projects: Array<{ id: string; title: string; slug?: string; summary?: string }> }>('/projects');
        const projects = data.projects || [];
        
        // Fetch member count for each project
        const teamsWithMembers = await Promise.all(
          projects.map(async (project, index) => {
            try {
              const membersData = await apiGet<{ members: Array<any> }>(`/teams/${project.id}/members`);
              const memberCount = membersData.members?.length || 1;
              return {
                id: project.id,
                title: project.title,
                color: colors[index % colors.length],
                initials: getInitials(project.title),
                people: memberCount,
                projects: 1, // Each project is a team
                slug: project.slug || toSlug(project.title),
                description: project.summary
              };
            } catch {
              return {
                id: project.id,
                title: project.title,
                color: colors[index % colors.length],
                initials: getInitials(project.title),
                people: 1,
                projects: 1,
                slug: project.slug || toSlug(project.title),
                description: project.summary
              };
            }
          })
        );
        
        setTeams(teamsWithMembers);
      } catch (err: any) {
        console.error('Failed to fetch teams:', err);
        toast({
          title: "Error",
          description: "Failed to load teams. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [toast]);

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/).slice(0, 2);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.map((w) => w.charAt(0).toUpperCase()).join("");
  };

  const handleJoinTeam = async () => {
    const code = joinCode.trim();
    if (!code) {
      toast({ title: "Enter a join code", description: "Ask a teammate for the team code to continue." });
      return;
    }
    setJoinLoading(true);
    try {
      const normalized = code.toLowerCase();
      const match = teams.find((team) => team.id.toLowerCase() === normalized || team.slug === toSlug(normalized));
      if (!match) {
        toast({ title: "Team not found", description: "Double-check the code or ask the team owner for an invite." });
        return;
      }
      toast({ title: "You're in!", description: `Redirecting you to ${match.title}` });
      setDialogOpen(false);
      setJoinCode("");
      navigate(`/teams/${match.slug}`);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!createName.trim()) {
      toast({ title: "Give your team a name", description: "A clear name helps teammates discover it faster." });
      return;
    }
    setCreateLoading(true);
    try {
      const name = createName.trim();
      const description = createDescription.trim();
      const tags = createTags.trim();
      const id = Math.random().toString(36).slice(2, 8).toUpperCase();
      const slug = toSlug(name);
      const initials = getInitials(name);

      const newTeam = {
        id,
        title: name,
        color: "bg-primary",
        initials,
        people: 1,
        projects: 0,
        slug,
        description,
        tags,
        owner: "You"
      };

      setTeams((prev) => [newTeam, ...prev]);
      toast({
        title: "Team created",
        description: `Share the code ${id} with teammates to bring them in.`
      });
      setDialogOpen(false);
      setCreateName("");
      setCreateDescription("");
      setCreateTags("");
      navigate(`/teams/${slug}`);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">Teams</h1>
          <Button variant="outline" onClick={() => { setActiveView("join"); setDialogOpen(true); }}>
            Join or create team
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading teams...</span>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">Join a team or create one to get started!</p>
            <Button onClick={() => { setActiveView("create"); setDialogOpen(true); }}>
              Create Your First Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {teams.map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(`/teams/${item.slug}`)}
              className="p-6 h-44 cursor-pointer bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-md flex items-center justify-center text-white text-lg font-semibold ${item.color}`}>{item.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-base">{item.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground truncate">{item.projects} projects · {item.people} people involved</div>
                  {item.description && (
                    <div className="mt-2 text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Class</span>
                  </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{activeView === "join" ? "Join a team" : "Create a team"}</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeView === "join" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("join")}
              >
                I have a code
              </Button>
              <Button
                variant={activeView === "create" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("create")}
              >
                Start a new team
              </Button>
            </div>

            {activeView === "join" ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="joinCode">Team code</Label>
                  <Input
                    id="joinCode"
                    placeholder="e.g. METWORKING"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Team owners can share this 6-character code from their team settings.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>What to expect</Label>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">Shared roadmap</Badge>
                    <Badge variant="outline">Stand-ups</Badge>
                    <Badge variant="outline">Knowledge base</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="teamName">Team name</Label>
                  <Input
                    id="teamName"
                    placeholder="Product Discovery Crew"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teamDescription">Mission statement</Label>
                  <Textarea
                    id="teamDescription"
                    placeholder="Share the team's focus, rituals, or the problem space you're exploring."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teamTags">Tags</Label>
                  <Input
                    id="teamTags"
                    placeholder="Design, AI, Onboarding"
                    value={createTags}
                    onChange={(e) => setCreateTags(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tags help teammates discover teams aligned with their interests.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              {activeView === "join" ? (
                <Button className="bg-primary" disabled={joinLoading} onClick={handleJoinTeam}>
                  {joinLoading ? "Joining..." : "Join team"}
                </Button>
              ) : (
                <Button className="bg-primary" disabled={createLoading} onClick={handleCreateTeam}>
                  {createLoading ? "Creating..." : "Create team"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Teams;
