import { MikroORM } from "@mikro-orm/core";
import { __password__, __prod__, __user__ } from "./constants";
import { Post } from "./entities/Post";
import path from "path";
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname + "/migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: "lireddit",
  type: "postgresql",
  user: __user__,
  password: __password__,
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
