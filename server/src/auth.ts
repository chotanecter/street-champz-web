// server/src/auth.ts — Bearer-token auth middleware.
// The frontend sends `Authorization: Bearer <token>` on every request (same
// pattern as /games, /friends, etc.). We verify the JWT and attach req.user.

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export interface AuthedUser {
  id: string; // e.g. "user:abc123"
  username?: string;
  role?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

/** Require a valid Bearer token; 401 otherwise. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, ENV.jwtSecret) as Record<string, unknown>;
    const id =
      (payload.id as string) ||
      (payload.sub as string) ||
      (payload.userId as string);
    if (!id) return res.status(401).json({ error: "Invalid token" });
    req.user = {
      id: id.includes(":") ? id : `user:${id}`,
      username: payload.username as string | undefined,
      role: payload.role as string | undefined,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/** Optional auth: attaches req.user if a valid token is present, never blocks. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token) {
    try {
      const payload = jwt.verify(token, ENV.jwtSecret) as Record<string, unknown>;
      const id = (payload.id as string) || (payload.sub as string);
      if (id) req.user = { id: id.includes(":") ? id : `user:${id}`, username: payload.username as string | undefined };
    } catch {
      /* ignore — anonymous */
    }
  }
  next();
}
