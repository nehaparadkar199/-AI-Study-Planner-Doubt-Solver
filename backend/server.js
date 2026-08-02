import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import plannerRoutes from './routes/plannerRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all domains or specific client URL
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Root landing route for Render HTTP health probes
app.get('/', (req, res) => {
    res.json({
        name: 'AuraStudy AI API',
        status: 'running',
        endpoints: ['/api/planner', '/api/chat', '/api/progress', '/health']
    });
});

// Server health check route
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Register API Routes
app.use('/api/planner', plannerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server listening on 0.0.0.0 for Render compatibility
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AuraStudy Server running on port ${PORT} (host: 0.0.0.0)`);
});
