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
import taskRoutes from "./routes/tasks";
import realtime from "./sockets/realtime";
import { startReminderWorker } from "./utils/reminders";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Basic logger (optional)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});


// ✅ Email confirmation redirect handler
app.get("/", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Redirecting...</title></head>
      <body>
        <p>Redirecting...</p>
        <script>
          const hash = window.location.hash;
          window.location.href = "${frontendUrl}/auth/callback" + hash;
        </script>
      </body>
    </html>
  `);
});

// ✅ Route mounting
app.use("/test", testRoutes);
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

// ✅ Socket events
realtime(io);

// ✅ Background reminders
startReminderWorker();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
