import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { AuthedRequest } from "../types/auth";

export const requireAuth = (
    req: AuthedRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    try {
        const decoded = verifyToken(token);

        if (!decoded) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        req.auth = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};