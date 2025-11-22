import 'dotenv/config';

import express, { type Request, Response, NextFunction } from "express";
import session from 'express-session';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";

const app = express();

// Добавь CORS ДО всех middleware
// app.use(cors({
//   origin: true, // разрешаем все домены
//   credentials: true // разрешаем куки и сессии
// }));

// ЗАМЕНИ CORS на это:
app.use(cors({
  origin: ["http://localhost:10000", "http://192.168.0.108:10000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, //process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Исправь порт и хост для доступа из интернета
  const port = parseInt(process.env.PORT || '3000', 10);
  
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Сервер запущен на порту ${port}`);
    log(`📍 Локальный доступ: http://localhost:${port}`);
    log(`🌐 Сетевой доступ: http://192.168.0.108:${port}`);
    // log(`serving on http://localhost:${port}`);
    // log(`Доступ из интернета: http://твой-ip:${port}`);
  });
})();








// // server/index.ts
// import 'dotenv/config';

// import express, { type Request, Response, NextFunction } from "express";
// import session from 'express-session';
// import { registerRoutes } from "./routes";
// import { setupVite, serveStatic, log } from "./vite";
// import cors from "cors";

// const app = express();

// declare module 'http' {
//   interface IncomingMessage {
//     rawBody: unknown
//   }
// }
// app.use(express.json({
//   verify: (req, _res, buf) => {
//     req.rawBody = buf;
//   }
// }));

// app.use(express.urlencoded({ extended: false }));

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-secret-key',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { 
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// }));

// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;

//   const originalResJson = res.json;
//   res.json = function (bodyJson, ...args) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };

//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }

//       if (logLine.length > 80) {
//         logLine = logLine.slice(0, 79) + "…";
//       }

//       log(logLine);
//     }
//   });

//   next();
// });

// (async () => {
//   const server = await registerRoutes(app);

//   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//     const status = err.status || err.statusCode || 500;
//     const message = err.message || "Internal Server Error";

//     res.status(status).json({ message });
//     throw err;
//   });

//   // importantly only setup vite in development and after
//   // setting up all the other routes so the catch-all route
//   // doesn't interfere with the other routes
//   if (app.get("env") === "development") {
//     await setupVite(app, server);
//   } else {
//     serveStatic(app);
//   }

//   // ALWAYS serve the app on the port specified in the environment variable PORT
//   // Other ports are firewalled. Default to 5000 if not specified.
//   // this serves both the API and the client.
//   // It is the only port that is not firewalled.
//   // const port = parseInt(process.env.PORT || '5000', 10);
//   const port = parseInt(process.env.PORT || '3000', 10);
//   // server.listen({
//   //   port,
//   //   host: "localhost",  // ← ИЛИ "127.0.0.1"
//   //   reusePort: true,
//   // }, () => {
//   app.listen(port, "0.0.0.0", () => {
//     log(`serving on http://localhost:${port}`);
//   });
// })();
