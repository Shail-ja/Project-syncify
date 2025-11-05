import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import testRoutes from "./routes/test";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import boardRoutes from "./routes/boards";
import chatRoutes from "./routes/chat";
import fileRoutes from "./routes/files";
import analyticsRoutes from "./routes/analytics";
import calendarRoutes from "./routes/calendar";
import teamRoutes from "./routes/teams";
import activityRoutes from "./routes/activity";
import assistantRoutes from "./routes/assistant";

import realtime from "./sockets/realtime";
import { startReminderWorker } from "./utils/reminders";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// --- Redirect email confirmation links to frontend
// This handles cases where Supabase redirect URL is misconfigured
// Note: Hash fragments (#access_token) are only available client-side
app.get("/", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
  // Send HTML that redirects to frontend and preserves the hash
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting...</title>
        <script>
          // Preserve hash fragment and redirect to frontend
          const hash = window.location.hash;
          window.location.href = "${frontendUrl}/auth/callback" + hash;
        </script>
      </head>
      <body>
        <p>Redirecting to frontend...</p>
        <script>
          // Fallback if JavaScript is disabled
          setTimeout(() => {
            window.location.href = "${frontendUrl}/auth/callback";
          }, 1000);
        </script>
      </body>
    </html>
  `);
});

// --- Test route
app.use("/test", testRoutes);

// --- Main API routes
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/boards", boardRoutes);
app.use("/chat", chatRoutes);
app.use("/files", fileRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/calendar", calendarRoutes);
app.use("/teams", teamRoutes);
app.use("/activity", activityRoutes);
app.use("/assistant", assistantRoutes);

// --- Initialize real-time events
realtime(io);

// --- Background worker (optional)
startReminderWorker();

// --- Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
