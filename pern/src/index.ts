import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __password__, __prod__, __user__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/posts";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  // MikroORM Config
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  // Application
  const app = express();

  // Redis
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  redisClient.on("connect", function () {
    console.log("Connected to Redis");
  });

  redisClient.on("error", function (err) {
    console.log("Error " + err);
  });

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "dsadsadsadsa",
      resave: false,
    })
  );

  // Apollo
  const appoloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  appoloServer.applyMiddleware({ app });

  app.listen(4000, () => console.log("Server started on port 4000"));
};

main().catch((err) => console.log(err));

// const IP = "192.168.1.188";
