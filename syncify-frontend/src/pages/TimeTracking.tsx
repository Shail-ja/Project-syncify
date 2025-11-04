import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useRef, useState } from "react";

type Entry = {
  id: string;
  projectId: string;
  taskTitle: string;
  startedAt: number;
  stoppedAt: number | null;
};

const STORAGE_KEY = "syncify_time_entries";

const TimeTracking = () => {
  const [projectId, setProjectId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [runningEntry, setRunningEntry] = useState<Entry | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const tick = useRef<number | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: Entry[] = JSON.parse(raw);
        setEntries(parsed);
        const active = parsed.find((e) => e.stoppedAt === null) || null;
        setRunningEntry(active);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (runningEntry) {
      tick.current = window.setInterval(() => force((v) => v + 1), 1000);
      return () => {
        if (tick.current) window.clearInterval(tick.current);
      };
    }
  }, [runningEntry]);

  const elapsed = useMemo(() => {
    if (!runningEntry) return 0;
    const end = Date.now();
    return Math.floor((end - runningEntry.startedAt) / 1000);
  }, [runningEntry, entries]);

  const start = () => {
    if (!projectId || !taskTitle || runningEntry) return;
    const entry: Entry = {
      id: crypto.randomUUID(),
      projectId,
      taskTitle,
      startedAt: Date.now(),
      stoppedAt: null,
    };
    setEntries((e) => [entry, ...e]);
    setRunningEntry(entry);
  };

  const stop = () => {
    if (!runningEntry) return;
    setEntries((es) => es.map((e) => (e.id === runningEntry.id ? { ...e, stoppedAt: Date.now() } : e)));
    setRunningEntry(null);
  };

  const format = (sec: number) => {
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-6">Time Tracking</h1>
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border mb-6">
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div>
              <Label htmlFor="projectId">Project ID</Label>
              <Input id="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Enter project ID" />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="title">Task</Label>
              <Input id="title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task name" />
            </div>
            <div className="flex gap-2">
              <Button onClick={start} disabled={!projectId || !taskTitle || !!runningEntry} className="bg-primary shadow-glow-primary w-full">
                Start
              </Button>
              <Button onClick={stop} variant="outline" disabled={!runningEntry} className="w-full">
                Stop
              </Button>
            </div>
          </div>
          <div className="mt-4 text-muted-foreground">{runningEntry ? `Running: ${format(elapsed)}` : "Idle"}</div>
        </Card>

        <div className="grid gap-4">
          {entries.map((e) => {
            const dur = Math.floor(((e.stoppedAt ?? Date.now()) - e.startedAt) / 1000);
            return (
              <Card key={e.id} className="p-4 bg-card/50 backdrop-blur-sm border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{e.taskTitle}</div>
                    <div className="text-sm text-muted-foreground">Project: {e.projectId}</div>
                  </div>
                  <div className="text-sm">{format(dur)}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TimeTracking;


