"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // Prisma errors
    if (err.code?.startsWith('P')) {
        statusCode = 400;
        switch (err.code) {
            case 'P2002':
                message = 'Unique constraint violation. This record already exists.';
                break;
            case 'P2025':
                message = 'Record not found.';
                statusCode = 404;
                break;
            case 'P2003':
                message = 'Foreign key constraint violation.';
                break;
            default:
                message = 'Database operation failed.';
        }
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token.';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired.';
    }
    // Validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed.';
    }
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map