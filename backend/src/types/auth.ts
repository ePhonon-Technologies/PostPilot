import { Provider, Role } from "@prisma/client";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export type RegistrInputType = {
  email: string;
  role?:  Role; 
  password?: string; // Optional if using OAuth providers, but required for local
  providerName: Provider;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
};

export type LoginInputType = {
  email: string;
  password?: string; // Optional if using OAuth providers, but required for local
};

export interface AuthedRequest extends Request {
    auth?: JwtPayload;
}