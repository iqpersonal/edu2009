"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const auth_simple_1 = __importDefault(require("./routes/auth-simple"));
const schools_simple_1 = __importDefault(require("./routes/schools-simple"));
const users_simple_1 = __importDefault(require("./routes/users-simple"));
const students_simple_1 = __importDefault(require("./routes/students-simple"));
const assessments_simple_1 = __importDefault(require("./routes/assessments-simple"));
const analytics_simple_1 = __importDefault(require("./routes/analytics-simple"));
const ai_simple_1 = __importDefault(require("./routes/ai-simple"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(rateLimiter_1.rateLimiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
// API routes
app.use('/api/auth', auth_simple_1.default);
app.use('/api/schools', schools_simple_1.default);
app.use('/api/users', users_simple_1.default);
app.use('/api/students', students_simple_1.default);
app.use('/api/assessments', assessments_simple_1.default);
app.use('/api/analytics', analytics_simple_1.default);
app.use('/api/ai', ai_simple_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Demo Login: admin@demo.com / password123`);
});
exports.default = app;
//# sourceMappingURL=index.js.map