import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { hash, verify } from "argon2";

// Username and password fields
@InputType()
class UsernamePasswordFields {
  @Field()
  username: string;

  @Field()
  password: string;
}

// Field error
@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

// User response
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

// UserResolver
@Resolver()
export class UserResolver {
  // ME
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });

    return user;
  }

  // REGISTER
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em, req }: MyContext,
    @Arg("options") options: UsernamePasswordFields
  ): Promise<UserResponse> {
    const { username, password } = options;
    const hashedPassword = await hash(password);

    if (username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "username length must be greater 2",
          },
        ],
      };
    }

    if (password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "password length must be greater 2",
          },
        ],
      };
    }

    const user = em.create(User, { username, password: hashedPassword });

    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "already taken",
            },
          ],
        };
      }
    }

    // keep the user logged in by setting a cookie
    req.session.userId = user.id;

    return { user };
  }

  // UPDATE
  @Mutation(() => User, { nullable: true })
  async updateUser(
    @Ctx() { em }: MyContext,
    @Arg("id") id: number,
    @Arg("password") password: string
  ) {
    const user = await em.findOne(User, { id });

    if (!user) return null;

    if (password) {
      user.password = password;
      em.persistAndFlush(user);
    }

    return user;
  }

  // DELETE
  @Mutation(() => Boolean)
  async deleteUser(
    @Ctx() { em }: MyContext,
    @Arg("id") id: number
  ): Promise<boolean> {
    const user = await em.findOne(User, { id });

    if (user) {
      em.nativeDelete(User, { id });

      return true;
    }

    return false;
  }

  // USERS
  @Query(() => [User])
  async users(@Ctx() { em }: MyContext): Promise<User[]> {
    const users = await em.find(User, {});
    return users;
  }

  // USER
  @Query(() => User, { nullable: true })
  async user(@Ctx() { em }: MyContext, @Arg("id") id: number) {
    const user = await em.findOne(User, { id });
    if (!user) {
      return null;
    }

    return user;
  }

  // LOGIN
  @Mutation(() => UserResponse)
  async login(
    @Ctx() { em, req }: MyContext,
    @Arg("options") options: UsernamePasswordFields
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username doesn't exist!",
          },
        ],
      };
    }

    const isValid = await verify(user.password, options.password);

    if (!isValid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }
}
