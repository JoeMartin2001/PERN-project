import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(@Ctx() { em }: MyContext, @Arg("id") id: number): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Ctx() { em }: MyContext,
    @Arg("title") title: String
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Ctx() { em }: MyContext,
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });

    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }

    return post;
  }

  @Mutation(() => Boolean, { nullable: true })
  async deletePost(
    @Ctx() { em }: MyContext,
    @Arg("id") id: number
  ): Promise<boolean> {
    try {
      await em.nativeDelete(Post, { id });
      return true;
    } catch (error) {
      return false;
    }
  }
}
