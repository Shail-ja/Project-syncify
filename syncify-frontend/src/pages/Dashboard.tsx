import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { TrendingUp, Users, CheckCircle2, Clock, Plus, CalendarClock, Bot } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Create Task state
  const [createOpen, setCreateOpen] = useState(false);
  const [ctProjectId, setCtProjectId] = useState("");
  const [ctTitle, setCtTitle] = useState("");
  const [ctDescription, setCtDescription] = useState("");
  const [ctAssignee, setCtAssignee] = useState("");
  const [ctDueDate, setCtDueDate] = useState("");
  const [ctLoading, setCtLoading] = useState(false);

  // Invite Team state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invProjectId, setInvProjectId] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState("member");
  const [invLoading, setInvLoading] = useState(false);
  const stats = [
    { label: "Active Projects", value: "12", icon: <TrendingUp className="w-6 h-6" />, trend: "+15%", description: "Teams aligned across delivery streams" },
    { label: "Team Members", value: "48", icon: <Users className="w-6 h-6" />, trend: "+3%", description: "Collaborators engaged this week" },
    { label: "Completed Tasks", value: "284", icon: <CheckCircle2 className="w-6 h-6" />, trend: "+24%", description: "Shipped across all squads" },
    { label: "Hours This Week", value: "156", icon: <Clock className="w-6 h-6" />, trend: "+8%", description: "Tracked across initiatives" }
  ];

  const projectPipeline = [
    { name: "Mobile App Redesign", stage: "Execution", status: "On Track", owner: "Product Squad", due: "Dec 15, 2025", progress: 75 },
    { name: "Backend API Development", stage: "Planning", status: "Needs Alignment", owner: "Platform Guild", due: "Jan 10, 2026", progress: 45 },
    { name: "Marketing Campaign", stage: "Launch Prep", status: "At Risk", owner: "Growth Team", due: "Dec 8, 2025", progress: 62 },
    { name: "Database Migration", stage: "Design", status: "Critical Watch", owner: "Infrastructure", due: "Feb 1, 2026", progress: 30 }
  ];

  const teamFocus = [
    { name: "Product Squad", focus: "Collaboration Experience", utilization: 82, members: 12, sentiment: "Positive" },
    { name: "Growth Team", focus: "Campaign Automation", utilization: 68, members: 9, sentiment: "Steady" },
    { name: "Platform Guild", focus: "API Reliability", utilization: 91, members: 7, sentiment: "Alert" }
  ];

  const activityFeed = [
    { title: "Daily sync recap", actor: "Ava Kim", time: "3m ago", context: "Mobile App Redesign" },
    { title: "AI summary shared", actor: "CollabSpace Assist", time: "18m ago", context: "Backend API Development" },
    { title: "New stakeholder added", actor: "Jordan Lee", time: "42m ago", context: "Marketing Campaign" },
    { title: "Dependency resolved", actor: "Priya Shah", time: "1h ago", context: "Database Migration" }
  ];

  const upcomingMilestones = [
    { title: "Sprint 18 Demo", due: "Tomorrow · 10:00", owner: "Product Squad" },
    { title: "Security review handoff", due: "Dec 6 · 14:30", owner: "Infrastructure" },
    { title: "Campaign creative lock", due: "Dec 9 · 09:00", owner: "Growth Team" },
    { title: "API contract sign-off", due: "Dec 12 · 16:00", owner: "Platform Guild" }
  ];

  const resourceSignals = [
    { title: "AI Assist usage", value: "124 prompts", change: "+12%" },
    { title: "Focus hours protected", value: "38 hrs", change: "+6%" },
    { title: "Cross-team handoffs", value: "9", change: "-2" },
    { title: "Resolved risks", value: "5", change: "+3" }
  ];

  const highestUtilizationTeam = teamFocus.reduce((top, team) => (team.utilization > top.utilization ? team : top), teamFocus[0]);
  const projectNeedingAttention = projectPipeline.find((project) => project.status === "Critical Watch")
    || projectPipeline.find((project) => project.status === "At Risk")
    || projectPipeline[0];
  const nearestMilestone = upcomingMilestones[0];
  const leadingSignal = resourceSignals[0];

  const insightSummary = [
    {
      label: "Next milestone",
      value: nearestMilestone.title,
      meta: nearestMilestone.due
    },
    {
      label: "Watch closely",
      value: projectNeedingAttention.name,
      meta: projectNeedingAttention.status
    },
    {
      label: "Capacity leader",
      value: `${highestUtilizationTeam.name}`,
      meta: `${highestUtilizationTeam.utilization}% utilisation`
    },
    {
      label: "Assist signal",
      value: leadingSignal.title,
      meta: leadingSignal.value
    }
  ];

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "On Track":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "Needs Alignment":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "At Risk":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Critical Watch":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/40";
    }
  };

  const getSentimentBadgeStyle = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Steady":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      case "Alert":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

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

        <Card className="mb-10 p-6 bg-card/50 backdrop-blur-sm border-border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">CollabSpace Assist</p>
              <h2 className="text-2xl font-bold mt-1">Today's operational briefing</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                Stay aligned with the moments that matter most. These highlights refresh continuously as your teams collaborate.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
              {insightSummary.map((item) => (
                <div key={item.label} className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="text-base font-semibold mt-1">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{item.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-primary">{stat.icon}</div>
                <span className="text-sm text-green-500 font-medium">{stat.trend}</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground/70">{stat.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Project Pipeline</h2>
                <p className="text-sm text-muted-foreground">Live view of your strategic initiatives</p>
              </div>
              <Button size="sm" variant="outline" className="border-primary/40 text-primary" onClick={() => navigate("/projects")}>
                View All
              </Button>
            </div>
            <div className="space-y-5">
              {projectPipeline.map((project, index) => (
                <div key={index} className="rounded-xl border border-border/60 p-4 bg-card/40">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{project.stage}</p>
                    </div>
                    <Badge className={`${getStatusBadgeStyle(project.status)} border`}>{project.status}</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      <p>{project.owner}</p>
                      <p className="text-xs">Target · {project.due}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xl font-bold text-primary">{project.progress}%</p>
                      <p className="text-xs text-muted-foreground">Delivery confidence</p>
                    </div>
                  </div>
                  <Progress value={project.progress} className="h-2 mt-3" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Team Focus & Capacity</h2>
                <p className="text-sm text-muted-foreground">Monitor workload and sentiment across squads</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate("/teams")}>
                Manage Teams
              </Button>
            </div>
            <div className="space-y-5">
              {teamFocus.map((team, index) => (
                <div key={index} className="rounded-xl border border-border/60 p-4 bg-card/40">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">{team.focus}</p>
                    </div>
                    <Badge className={`${getSentimentBadgeStyle(team.sentiment)} border`}>{team.sentiment}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{team.members} members</span>
                    <span>Utilisation · {team.utilization}%</span>
                  </div>
                  <Progress value={team.utilization} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-24 flex flex-col space-y-2">
                  <Plus className="w-6 h-6" />
                  <span>Create Task</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="ctProjectId">Project ID</Label>
                    <Input id="ctProjectId" value={ctProjectId} onChange={(e) => setCtProjectId(e.target.value)} placeholder="Enter project ID" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ctTitle">Title</Label>
                    <Input id="ctTitle" value={ctTitle} onChange={(e) => setCtTitle(e.target.value)} placeholder="Task title" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ctDescription">Description</Label>
                    <Textarea id="ctDescription" value={ctDescription} onChange={(e) => setCtDescription(e.target.value)} placeholder="Optional description" />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="ctAssignee">Assignee (email)</Label>
                      <Input id="ctAssignee" value={ctAssignee} onChange={(e) => setCtAssignee(e.target.value)} placeholder="user@example.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ctDue">Due Date</Label>
                      <Input id="ctDue" type="date" value={ctDueDate} onChange={(e) => setCtDueDate(e.target.value)} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="bg-primary"
                    disabled={!ctProjectId || !ctTitle || ctLoading}
                    onClick={async () => {
                      try {
                        setCtLoading(true);
                        // Create task using new endpoint that checks assignee membership
                        await apiPost(`/projects/${ctProjectId}/tasks`, {
                          title: ctTitle,
                          description: ctDescription,
                          assignee: ctAssignee || null,
                          due_date: ctDueDate || null,
                        });
                        toast({ title: "Task created successfully" });
                        setCreateOpen(false);
                        setCtProjectId("");
                        setCtTitle("");
                        setCtDescription("");
                        setCtAssignee("");
                        setCtDueDate("");
                      } catch (e: any) {
                        toast({ 
                          title: "Failed to create task", 
                          description: e?.message || String(e),
                          variant: "destructive"
                        });
                      } finally {
                        setCtLoading(false);
                      }
                    }}
                  >
                    {ctLoading ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-24 flex flex-col space-y-2">
                  <Users className="w-6 h-6" />
                  <span>Invite Team</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite to Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="invProjectId">Project ID</Label>
                    <Input id="invProjectId" value={invProjectId} onChange={(e) => setInvProjectId(e.target.value)} placeholder="Enter project ID" />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="invEmail">Email</Label>
                      <Input id="invEmail" type="email" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} placeholder="user@example.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invRole">Role</Label>
                      <Select value={invRole} onValueChange={setInvRole}>
                        <SelectTrigger id="invRole">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="bg-primary"
                    disabled={!invProjectId || !invEmail || invLoading}
                    onClick={async () => {
                      try {
                        setInvLoading(true);
                        await apiPost(`/projects/${invProjectId}/invite`, { email: invEmail, role: invRole || "member" });
                        toast({ title: "Invitation sent" });
                        setInviteOpen(false);
                        setInvProjectId("");
                        setInvEmail("");
                        setInvRole("member");
                      } catch (e: any) {
                        toast({ title: "Failed to invite", description: e?.message || String(e) });
                      } finally {
                        setInvLoading(false);
                      }
                    }}
                  >
                    {invLoading ? "Inviting..." : "Invite"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={() => navigate("/reports")} variant="outline" className="h-24 flex flex-col space-y-2">
              <TrendingUp className="w-6 h-6" />
              <span>View Reports</span>
            </Button>
            <Button onClick={() => navigate("/time-tracking")} variant="outline" className="h-24 flex flex-col space-y-2">
              <Clock className="w-6 h-6" />
              <span>Time Tracking</span>
            </Button>
          </div>
        </Card>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Collaboration Feed</h2>
              <Badge className="bg-primary/10 text-primary border border-primary/40">Live</Badge>
            </div>
            <div className="space-y-4">
              {activityFeed.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.actor} · {item.context}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Upcoming Milestones</h2>
                <p className="text-xs text-muted-foreground">Stay ahead of critical delivery moments</p>
              </div>
              <CalendarClock className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {upcomingMilestones.map((item, index) => (
                <div key={index} className="rounded-lg border border-border/60 p-4 bg-card/40">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.due}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Owner · {item.owner}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Resource Signals</h2>
                <p className="text-xs text-muted-foreground">Automated insights from CollabSpace Assist</p>
              </div>
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-3">
              {resourceSignals.map((signal, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 bg-card/40">
                  <div>
                    <p className="text-sm font-semibold">{signal.title}</p>
                    <p className="text-xs text-muted-foreground">{signal.value}</p>
                  </div>
                  <Badge className={`${signal.change.startsWith("-") ? "bg-rose-500/15 text-rose-300 border-rose-500/30" : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"} border`}>{signal.change}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
