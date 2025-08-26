import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/secret";

export function decodeUser(req: Request, res: Response, next: NextFunction) {
  let token = req.headers.authorization;
  if (token?.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as any;
    if (decoded.user && decoded.user.id) {
      req.user = { userId: decoded.user.id };
    } else if (decoded.userId) {
      req.user = { userId: decoded.userId };
    } else {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}