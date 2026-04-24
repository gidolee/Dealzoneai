import { NextFunction, Request, Response } from "express";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error"
  });
}
