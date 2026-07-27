import { Response, NextFunction } from "express";
import { prisma } from "../../config/db";
import { AppError } from "../../middleware/error.middleware";
import { AuthedRequest } from "../../types/auth";

export const createProfile = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    const profile = await prisma.profile.create({
      data: {
        userId: req.auth!.userId,
        firstName: data.firstName,
        lastName:data.lastName,
      },
    });

    res.status(201).json({ profile });
  } catch (err) {
    next(err);
  }
};

export const getProfiles = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.profile.findMany({
      where: { userId: req.auth!.userId },
      include: { accounts: true },
    });

    res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
};

export const getProfileById = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);

    const profile = await prisma.profile.findFirst({
      where: {id, userId: req.auth!.userId },
      include: { accounts: true },
    });

    if (!profile) {
      throw new AppError("Profile not found", 404);
    }

    res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
};

export const deleteProfile = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params?.id)

    const profile = await prisma.profile.findFirst({
      where: { id, userId: req.auth!.userId },
    });

    if (!profile) {
      throw new AppError("Profile not found", 404);
    }

    await prisma.profile.delete({ where: { id } });

    res.status(200).json({ message: "Profile deleted" });
  } catch (err) {
    next(err);
  }
};
