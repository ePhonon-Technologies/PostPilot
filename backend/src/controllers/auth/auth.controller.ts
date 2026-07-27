import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/db";
import {
  hashPassword,
  comparePassword,
  generateToken,
  MAX_AGE,
} from "../../utils/auth";
import { AppError } from "../../middleware/error.middleware";
import {
  type RegistrInputType,
  type LoginInputType,
  AuthedRequest,
} from "../../types/auth";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {

  try {
    // Explicit type casting from req.body
    const data = req.body as RegistrInputType;

    // Manual basic validation checks since schemas aren't being used
    if (!data.email || !data.providerName) {
      throw new AppError("Email and Provider Name are required fields", 400);
    }

    if (data.providerName === "LOCAL" && !data.password) {
      throw new AppError("Password is required fields", 400);
    }
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    console.log('existing user',existing);

    if (existing) {
      throw new AppError("Email already in use", 409);
    }

    // Safety fallback logic for local vs social authentication passwords
    let hashedPassword = "";
    if (data.password) {
      hashedPassword = await hashPassword(data?.password);
    } else if (data.providerName === "LOCAL") {
      throw new AppError("Password is required for local registration", 400);
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        providerName: data.providerName ?? "LOCAL",
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            avatarUrl: data.avatarUrl,
          },
        },
      },
      include:{
        profile: true,
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE, // 7 days, match your JWT expiry
    });

    // Sanitized response: no password hash, no token in body since it's now in the cookie
     res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile:{
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName,
          avatarUrl: user.profile?.avatarUrl,
          phoneNumber: user.profile?.phoneNumber
        }
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Explicit type casting from req.body
    const data = req.body as LoginInputType;

    if (!data.email || !data.password) {
      throw new AppError("Email and Password are required fields", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    if (user.providerName !== "LOCAL" || !user.password) {
      throw new AppError(`Please sign in using ${user.providerName}`, 400);
    }
    const isMatch = await comparePassword(data.password, user.password);

    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    // Fixed type safety by including the required user role structure
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE, // 7 days, match your JWT expiry
    });

    // Sanitized response: no password hash, no token in body since it's now in the cookie
     res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile:{
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName,
          avatarUrl: user.profile?.avatarUrl,
          phoneNumber: user.profile?.phoneNumber
        }
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      select: {
        id: true,
        email: true,
        role: true,
        providerName: true,
        profile:{
          select:{
            firstName:true,
            lastName:true,
            avatarUrl:true,
            phoneNumber:true,
          }
        }
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // httpOnly cookies can't be cleared from JavaScript — options here must
    // exactly match how the cookie was originally set (name, httpOnly,
    // secure, sameSite), otherwise the browser won't clear it.
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
