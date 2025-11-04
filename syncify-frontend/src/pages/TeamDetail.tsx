import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Hash, Home, NotebookText, BookOpen, ClipboardList, GraduationCap, ChevronDown, Send, Paperclip, Image } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const TeamDetail = () => {
  const params = useParams();
  const teamName = decodeURIComponent(params.id || "Team");

  const channels = [
    { label: "Home page", icon: Home },
    { label: "Class Notebook", icon: NotebookText },
    { label: "Classwork", icon: BookOpen },
    { label: "Assignments", icon: ClipboardList },
    { label: "Grades", icon: GraduationCap },
    { label: "Reflect", icon: NotebookText },
  ];

  // Demo boards per team slug; replace with backend data later
  const boards = useMemo(() => {
    return {
      "social-media-marketing-team": {
        displayName: "Social Media Team",
        columns: [
          {
            key: "not-started",
            title: "Not Started",
            accent: "bg-muted text-foreground",
            items: [
              { title: "Looking for Sponsors", date: "July 28, 2025", priority: "Medium", tags: ["Poster"] },
              { title: "The website is live", date: "August 3, 2025", priority: "Medium", tags: ["Poster"] },
              { title: "CP", date: "July 30, 2025", priority: "Medium", tags: ["Poster"] },
              { title: "GL", date: "July 30, 2025", priority: "Medium", tags: ["Poster"] },
            ],
          },
          {
            key: "in-progress",
            title: "In Progress",
            accent: "bg-blue-900/60 text-blue-100",
            items: [
              { title: "Coming soon", date: "July 12, 2025", priority: "High", tags: ["Poster", "Reel(s)", "Memes", "Twitter Posts"] },
            ],
          },
          {
            key: "for-review",
            title: "For Review",
            accent: "bg-yellow-900/60 text-yellow-100",
            items: [
              { title: "Pre Registrations", date: "July 25, 2025", priority: "High", tags: ["Poster", "Reels", "Form", "Memes", "Twitter Posts"] },
            ],
          },
          {
            key: "completed",
            title: "Completed",
            accent: "bg-emerald-900/60 text-emerald-100",
            items: [
              { title: "Guess who's back?", date: "July 10, 2025", priority: "High", tags: ["Poster", "Reel"] },
              { title: "Organising Team Induction July 15", date: "July 25, 2025", priority: "Medium", tags: ["Poster", "Twitter Posts", "Form - Content Team"] },
              { title: "Recap", date: "July 20, 2025", priority: "High", tags: ["Reel"] },
            ],
          },
        ],
      },
      "metworking": {
        displayName: "NETOWRKING PROJECT",
        columns: [
          { key: "not-started", title: "Not Started", accent: "bg-muted text-foreground", items: [
            { title: "Define network topology", date: "Aug 1, 2025", priority: "Medium", tags: ["Design", "Docs"] },
          ]},
          { key: "in-progress", title: "In Progress", accent: "bg-blue-900/60 text-blue-100", items: [
            { title: "Cisco lab setup", date: "Aug 5, 2025", priority: "High", tags: ["Switching", "Routing"] },
          ]},
          { key: "for-review", title: "For Review", accent: "bg-yellow-900/60 text-yellow-100", items: [
            { title: "VLSM plan review", date: "Aug 10, 2025", priority: "Medium", tags: ["Subnetting"] },
          ]},
          { key: "completed", title: "Completed", accent: "bg-emerald-900/60 text-emerald-100", items: [
            { title: "Hardware procurement", date: "Jul 20, 2025", priority: "Low", tags: ["Inventory"] },
          ]},
        ],
      },
      "cs2075-data-structures-laboratory": {
        displayName: "CS2075 Data Structures Laboratory",
        columns: [
          { key: "not-started", title: "Not Started", accent: "bg-muted text-foreground", items: [
            { title: "Set up project skeleton", date: "Aug 2, 2025", priority: "Medium", tags: ["Boilerplate"] },
          ]},
          { key: "in-progress", title: "In Progress", accent: "bg-blue-900/60 text-blue-100", items: [
            { title: "Implement Linked List", date: "Aug 6, 2025", priority: "High", tags: ["C++", "Unit Tests"] },
          ]},
          { key: "for-review", title: "For Review", accent: "bg-yellow-900/60 text-yellow-100", items: [
            { title: "AVL Tree rotations", date: "Aug 12, 2025", priority: "High", tags: ["Balancing"] },
          ]},
          { key: "completed", title: "Completed", accent: "bg-emerald-900/60 text-emerald-100", items: [
            { title: "Stack & Queue", date: "Jul 18, 2025", priority: "Medium", tags: ["Generics"] },
          ]},
        ],
      },
      "data-structures": {
        displayName: "Data Structures",
        columns: [
          { key: "not-started", title: "Not Started", accent: "bg-muted text-foreground", items: [
            { title: "Syllabus review", date: "Aug 3, 2025", priority: "Low", tags: ["Reading"] },
          ]},
          { key: "in-progress", title: "In Progress", accent: "bg-blue-900/60 text-blue-100", items: [
            { title: "Graph algorithms", date: "Aug 8, 2025", priority: "High", tags: ["BFS", "DFS"] },
          ]},
          { key: "for-review", title: "For Review", accent: "bg-yellow-900/60 text-yellow-100", items: [
            { title: "Hash tables notes", date: "Aug 14, 2025", priority: "Medium", tags: ["Docs"] },
          ]},
          { key: "completed", title: "Completed", accent: "bg-emerald-900/60 text-emerald-100", items: [
            { title: "Sorting complexity", date: "Jul 22, 2025", priority: "Low", tags: ["Big-O"] },
          ]},
        ],
      },
      "cs1010-programming-for-problem-solving-spring": {
        displayName: "CS1010 - Programming for Problem Solving - Spring",
        columns: [
          { key: "not-started", title: "Not Started", accent: "bg-muted text-foreground", items: [
            { title: "Intro to C", date: "Aug 1, 2025", priority: "Low", tags: ["Lecture Prep"] },
          ]},
          { key: "in-progress", title: "In Progress", accent: "bg-blue-900/60 text-blue-100", items: [
            { title: "Loops & arrays lab", date: "Aug 5, 2025", priority: "Medium", tags: ["Lab"] },
          ]},
          { key: "for-review", title: "For Review", accent: "bg-yellow-900/60 text-yellow-100", items: []},
          { key: "completed", title: "Completed", accent: "bg-emerald-900/60 text-emerald-100", items: [
            { title: "Hello World setup", date: "Jul 15, 2025", priority: "Low", tags: ["Tooling"] },
          ]},
        ],
      },
      "data-communication-cs3001": {
        displayName: "Data Communication (CS3001)",
        columns: [
          { key: "not-started", title: "Not Started", accent: "bg-muted text-foreground", items: [
            { title: "OSI vs TCP/IP slides", date: "Aug 4, 2025", priority: "Medium", tags: ["Slides"] },
          ]},
          { key: "in-progress", title: "In Progress", accent: "bg-blue-900/60 text-blue-100", items: [
            { title: "Stop-and-wait ARQ demo", date: "Aug 9, 2025", priority: "High", tags: ["Simulation"] },
          ]},
          { key: "for-review", title: "For Review", accent: "bg-yellow-900/60 text-yellow-100", items: []},
          { key: "completed", title: "Completed", accent: "bg-emerald-900/60 text-emerald-100", items: [
            { title: "Encoding techniques", date: "Jul 21, 2025", priority: "Medium", tags: ["NRZ", "Manchester"] },
          ]},
        ],
      },
      "cs2006-design-analysis-of-algorithm-spring-2025": {
        displayName: "CS2006 Design & Analysis of Algorithm SPRING 2025",
        columns: [
          { key: "not-started", title: "Not Started", accent: "bg-muted text-foreground", items: [
            { title: "Greedy vs DP overview", date: "Aug 2, 2025", priority: "Medium", tags: ["Lecture"] },
          ]},
          { key: "in-progress", title: "In Progress", accent: "bg-blue-900/60 text-blue-100", items: [
            { title: "Knapsack implementations", date: "Aug 7, 2025", priority: "High", tags: ["DP", "C++"] },
          ]},
          { key: "for-review", title: "For Review", accent: "bg-yellow-900/60 text-yellow-100", items: []},
          { key: "completed", title: "Completed", accent: "bg-emerald-900/60 text-emerald-100", items: [
            { title: "Divide & Conquer", date: "Jul 19, 2025", priority: "Low", tags: ["Recurrence"] },
          ]},
        ],
      },
      "2025-operating-systems-cs3009": {
        displayName: "2025 Operating Systems (CS3009)",
        columns: [
          { key: "not-started", title: "Not Started", accent: "bg-muted text-foreground", items: [
            { title: "Process states lecture", date: "Aug 1, 2025", priority: "Low", tags: ["Slides"] },
          ]},
          { key: "in-progress", title: "In Progress", accent: "bg-blue-900/60 text-blue-100", items: [
            { title: "CPU scheduling lab", date: "Aug 6, 2025", priority: "High", tags: ["FCFS", "SJF"] },
          ]},
          { key: "for-review", title: "For Review", accent: "bg-yellow-900/60 text-yellow-100", items: []},
          { key: "completed", title: "Completed", accent: "bg-emerald-900/60 text-emerald-100", items: [
            { title: "Intro & setup", date: "Jul 16, 2025", priority: "Low", tags: ["Tooling"] },
          ]},
        ],
      },
      "cs2066-algorithm-design-laboratory": {
        displayName: "CS2066 Algorithm Design Laboratory",
        columns: [
          { key: "not-started", title: "Not Started", accent: "bg-muted text-foreground", items: [
            { title: "Heuristics reading", date: "Aug 3, 2025", priority: "Low", tags: ["Docs"] },
          ]},
          { key: "in-progress", title: "In Progress", accent: "bg-blue-900/60 text-blue-100", items: [
            { title: "Metaheuristics demo", date: "Aug 9, 2025", priority: "Medium", tags: ["GA", "SA"] },
          ]},
          { key: "for-review", title: "For Review", accent: "bg-yellow-900/60 text-yellow-100", items: []},
          { key: "completed", title: "Completed", accent: "bg-emerald-900/60 text-emerald-100", items: [
            { title: "Brute force baseline", date: "Jul 23, 2025", priority: "Low", tags: ["Baseline"] },
          ]},
        ],
      },
      "clarion-bpd-sessions": {
        displayName: "Clarion BPD Sessions",
        columns: [
          { key: "not-started", title: "Not Started", accent: "bg-muted text-foreground", items: [
            { title: "Agenda planning", date: "Aug 5, 2025", priority: "Medium", tags: ["Workshop"] },
          ]},
          { key: "in-progress", title: "In Progress", accent: "bg-blue-900/60 text-blue-100", items: [
            { title: "Speaker outreach", date: "Aug 9, 2025", priority: "High", tags: ["Outreach"] },
          ]},
          { key: "for-review", title: "For Review", accent: "bg-yellow-900/60 text-yellow-100", items: []},
          { key: "completed", title: "Completed", accent: "bg-emerald-900/60 text-emerald-100", items: [
            { title: "Venue booking", date: "Jul 28, 2025", priority: "Medium", tags: ["Logistics"] },
          ]},
        ],
      },
    } as Record<string, { displayName: string; columns: { key: string; title: string; accent: string; items: { title: string; date: string; priority: "High" | "Medium" | "Low"; tags: string[] }[] }[] }>;
  }, []);

  const activeBoard = boards[params.id || ""];
  const [activeTab, setActiveTab] = useState<"status" | "work" | "assignments">("status");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-8 px-0 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-0 border-t border-border">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-3 border-r border-border bg-card/40 backdrop-blur-sm">
            <div className="px-4 py-3 text-sm text-muted-foreground">All teams</div>
            <div className="px-4 py-2 flex items-center justify-between">
              <div className="font-semibold">{activeBoard?.displayName || teamName}</div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="px-4 space-y-1 pb-4">
              {channels.map((c) => (
                <div key={c.label} className="flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-muted/50 cursor-pointer">
                  <c.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{c.label}</span>
                </div>
              ))}
            </div>

            <div className="px-4 text-sm text-muted-foreground">Main Channels</div>
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary">
                <Hash className="w-4 h-4" />
                <span>General</span>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="col-span-12 md:col-span-9 lg:col-span-9 xl:col-span-9">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-muted-foreground" />
                <div className="text-lg font-semibold">{activeBoard?.displayName || "General"}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex items-center gap-2">
              <Button size="sm" variant={activeTab === "status" ? "default" : "outline"} onClick={() => setActiveTab("status")} className={activeTab === "status" ? "bg-primary shadow-glow-primary" : ""}>Status Board</Button>
              <Button size="sm" variant={activeTab === "work" ? "default" : "outline"} onClick={() => setActiveTab("work")}>Work</Button>
              <Button size="sm" variant={activeTab === "assignments" ? "default" : "outline"} onClick={() => setActiveTab("assignments")}>Person Assignments</Button>
            </div>

            {activeTab === "status" && (
              <div className="p-6 overflow-x-auto">
                <div className="min-w-full grid grid-flow-col auto-cols-[minmax(280px,320px)] gap-4">
                  {(activeBoard?.columns || []).map((col) => (
                    <Card key={col.key} className="p-0 bg-card/50 backdrop-blur-sm border-border">
                      <div className="px-4 py-3 flex items-center justify-between">
                        <Badge className="text-xs" variant="secondary">{col.title}</Badge>
                      </div>
                      <div className="px-3 pb-3 space-y-3">
                        {col.items.map((it, idx) => (
                          <Card key={idx} className={`p-4 ${col.accent} border-border/50`}>
                            <div className="font-semibold mb-2">{it.title}</div>
                            <div className="text-xs text-muted-foreground mb-3">{it.date}</div>
                            <div className="mb-3">
                              <Badge variant="destructive" className={it.priority === "High" ? "bg-red-600" : it.priority === "Medium" ? "bg-amber-600" : "bg-emerald-600"}>{it.priority}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {it.tags.map((t) => (
                                <Badge key={t} variant="outline" className="border-border/50">{t}</Badge>
                              ))}
                            </div>
                          </Card>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full justify-start">+ New item</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab !== "status" && (
              <div className="p-6 text-sm text-muted-foreground">This section is coming soon.</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default TeamDetail;


