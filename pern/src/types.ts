import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import session from "express-session";

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session?: session.Session & Partial<session.SessionData> };
  res: Response;
};

declare module "express-session" {
  export interface SessionData {
    userId: number;
  }
}
