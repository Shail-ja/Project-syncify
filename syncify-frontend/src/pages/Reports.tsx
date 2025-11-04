import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiGet } from "@/lib/api";

const Reports = () => {
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ tasks: number; messages: number; files: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await apiGet<{ tasks: number; messages: number; files: number }>(`/analytics/project/${projectId}/summary`);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-6">Reports</h1>
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border mb-6">
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input id="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Enter project ID" />
            </div>
            <Button disabled={!projectId || loading} onClick={fetchSummary} className="bg-primary shadow-glow-primary">
              {loading ? "Loading..." : "View Summary"}
            </Button>
          </div>
        </Card>
        {error && (
          <Card className="p-6 bg-destructive/10 border-destructive text-destructive mb-6">{error}</Card>
        )}
        {data && (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <div className="text-sm text-muted-foreground mb-2">Tasks</div>
              <div className="text-3xl font-bold">{data.tasks}</div>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <div className="text-sm text-muted-foreground mb-2">Messages</div>
              <div className="text-3xl font-bold">{data.messages}</div>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <div className="text-sm text-muted-foreground mb-2">Files</div>
              <div className="text-3xl font-bold">{data.files}</div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;


