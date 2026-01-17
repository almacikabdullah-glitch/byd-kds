/**
 * BYD KDS - Logger Configuration
 * Winston logger with console and file transports
 */
const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${stack ? '\n' + stack : ''}`;
    })
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        })
    ]
});

// Production'da dosyaya da yaz
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error'
    }));
    logger.add(new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log')
    }));
}

module.exports = logger;
