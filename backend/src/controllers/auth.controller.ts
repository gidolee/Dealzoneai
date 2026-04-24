import { Request, Response } from "express";
import { prisma } from "../config/db";

export async function register(req: Request, res: Response): Promise<void> {
  const { email, fullName, password, role } = req.body as {
    email?: string;
    fullName?: string;
    password?: string;
    role?: "CUSTOMER" | "MERCHANT" | "ADMIN";
  };

  if (!email || !fullName || !password) {
    res.status(400).json({ message: "email, fullName, and password are required" });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash: password,
      role: role ?? "CUSTOMER"
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true
    }
  });

  res.status(201).json(user);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.passwordHash !== password) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  res.status(200).json({
    token: `demo-token-${user.id}`,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  });
}
