import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Teams = () => {
  const navigate = useNavigate();
  const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const items = [
    { id: "METWORKING", title: "NETOWRKING PROJECT", color: "bg-yellow-500", initials: "🐧", people: 38, projects: 12 },
    { id: "Social Media Marketing Team", title: "Social Media Marketing Team", color: "bg-indigo-600", initials: "SM", people: 18, projects: 8 },
    { id: "CS2075 Data Structures Laboratory", title: "CS2075 Data Structures Laboratory", color: "bg-pink-600", initials: "CD", people: 42, projects: 9 },
    { id: "Data Structures", title: "Data Structures", color: "bg-yellow-400", initials: "🙂", people: 28, projects: 6 },
    { id: "CS1010 - Programming for Problem Solving - Spring", title: "CS1010 - Programming for Problem Solving - Spring", color: "bg-blue-600", initials: "CP", people: 55, projects: 14 },
    { id: "Data Communication (CS3001)", title: "Data Communication (CS3001)", color: "bg-cyan-600", initials: "DC", people: 31, projects: 7 },
    { id: "CS2006 Design & Analysis of Algorithm SPRING 2025", title: "CS2006 Design & Analysis of Algorithm SPRING 2025", color: "bg-fuchsia-600", initials: "😊", people: 47, projects: 11 },
    { id: "2025 Operating Systems (CS3009)", title: "2025 Operating Systems (CS3009)", color: "bg-teal-700", initials: "OS", people: 36, projects: 10 },
    { id: "CS2066 Algorithm Design Laboratory", title: "CS2066 Algorithm Design Laboratory", color: "bg-green-600", initials: "🍁", people: 24, projects: 5 },
  ].map((i) => ({ ...i, slug: toSlug(i.id) }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">Classes</h1>
          <Button variant="outline">Join or create team</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {items.map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(`/teams/${item.slug}`)}
              className="p-6 h-44 cursor-pointer bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-md flex items-center justify-center text-white text-lg font-semibold ${item.color}`}>{item.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-base">{item.title}</div>
                  <div className="mt-2 text-xs text-muted-foreground truncate">{item.projects} projects · {item.people} people involved</div>
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

        <div className="mt-8">
          <h2 className="text-sm text-muted-foreground mb-2">Teams</h2>
          <Card className="p-5 bg-card/50 backdrop-blur-sm border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-pink-600 text-white flex items-center justify-center font-semibold">CB</div>
              <div className="font-medium">Clarion BPD Sessions</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate(`/teams/${toSlug("Clarion BPD Sessions")}`)}>Open</Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Teams;
