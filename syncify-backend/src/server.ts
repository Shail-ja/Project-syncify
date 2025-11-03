import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import authRoutes from './routes/auth';
import projectsRoutes from './routes/projects';
import boardsRoutes from './routes/boards';
import chatRoutes from './routes/chat';
import filesRoutes from './routes/files';
import analyticsRoutes from './routes/analytics';
import calendarRoutes from './routes/calendar';
import teamsRoutes from './routes/teams';
import activityRoutes from './routes/activity';
import { registerRealtimeHandlers } from './sockets/realtime';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/activity', activityRoutes);

registerRealtimeHandlers(io);

const port = Number(process.env.PORT) || 4000;
server.listen(port, () => {
  console.log(`Workhub API listening on http://localhost:${port}`);
});


