import "server-only";
import { z } from "zod";
import type { request as githubRequest } from "@octokit/request";
import { type VercelKV, kv } from "@vercel/kv";
import { cache } from "react";

const frontMatterTagsSchema = z.array(z.string());
const frontMatterStatusSchema = z.union([
  z.literal("unlisted"),
  z.literal("published"),
]);

const frontMatterSchema = z.object({
  title: z.string(),
  createdAt: z.string(),
  tags: frontMatterTagsSchema.default([]),
  slug: z.string(),
  status: frontMatterStatusSchema.default("published"),
  description: z
    .string()
    .optional()
    .transform((value) => value ?? null),
});

interface PostMeta extends z.TypeOf<typeof frontMatterSchema> {
  path: string;
}

interface BlogPost extends PostMeta {
  content: string;
  lastModifiedAt: string | null;
}

export interface BlogData {
  getPost: (slug: string) => Promise<BlogPost | null>;
  listAllPosts: () => Promise<PostMeta[]>;
}

type GitHubClient = ReturnType<
  typeof githubRequest.defaults<{
    headers: {
      authorization: string;
      accept: string;
    };
  }>
>;

export class GitHubBlogData implements BlogData {
  #gh: GitHubClient;

  constructor(gh: GitHubClient) {
    this.#gh = gh;
  }

  async getPost(slug: string) {
    return (
      (await this.#listAllPostsWithContents()).find(
        (post) => post.slug === slug
      ) ?? null
    );
  }

  async listAllPosts() {
    return (await this.#listAllPostsWithContents())
      .map(({ content, ...meta }) => meta)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async #getPostDataByPath(path: string) {
    const content = await this.#getRawFileContents(path);
    const fontMatter = parseFrontMatter(content);

    return {
      content: content.slice(fontMatter.contentStart),
      ...fontMatter.attributes,
    };
  }

  async getPostSlugByPath(path: string) {
    const postData = await this.#getPostDataByPath(path);
    return postData.slug;
  }

  async getPostByPath(path: string) {
    const postData = await this.#getPostDataByPath(path);

    const commits = await this.#gh(`GET /repos/{owner}/{repo}/commits`, {
      owner: "tom-sherman",
      repo: "blog",
      path,
    });

    return {
      path,
      ...postData,
      lastModifiedAt:
        commits.data.length < 2
          ? null
          : commits.data[0]?.commit.committer?.date ?? null,
    };
  }

  async #listAllPostsWithContents() {
    const result = await this.#gh(`GET /repos/{owner}/{repo}/contents/posts/`, {
      owner: "tom-sherman",
      repo: "blog",
    });

    const files = z
      .array(
        z.object({
          type: z.literal("file"),
          path: z.string(),
          sha: z.string(),
        })
      )
      .parse(result.data);

    return Promise.all(files.map(({ path }) => this.getPostByPath(path)));
  }

  async #getRawFileContents(path: string) {
    const contents = await this.#gh(
      `GET /repos/{owner}/{repo}/contents/{path}`,
      {
        owner: "tom-sherman",
        repo: "blog",
        path,
        headers: {
          accept: "application/vnd.github.v3.raw",
        },
      }
    );

    return parseContentsResponse(contents);
  }
}

export class VercelKvBlogData implements BlogData {
  #kv: VercelKV;

  constructor(kv: VercelKV) {
    this.#kv = kv;
  }

  getPost(slug: string): Promise<BlogPost | null> {
    throw new Error("Method not implemented.");
  }
  listAllPosts(): Promise<PostMeta[]> {
    throw new Error("Method not implemented.");
  }

  async deletePostsByPath(paths: string[]) {
    await this.#kv.del(...paths);
  }

  async upsertPosts(posts: BlogPost[]) {
    const tx = this.#kv.multi();

    for (const post of posts) {
      tx.set(post.path, JSON.stringify(post));
    }

    await tx.exec();
  }
}

export const blog = cache(() => new VercelKvBlogData(kv));

type ContentsApiResponse = Awaited<
  ReturnType<typeof githubRequest<"GET /repos/{owner}/{repo}/contents/{path}">>
>;

function parseContentsResponse(res: ContentsApiResponse) {
  if (typeof res.data === "string") {
    return res.data as string;
  }

  throw new Error("Failed to get contents");
}

const frontMatterRe = /^---$(?<frontMatter>.*?)^---$/ms;
const frontMatterKeyValueRe = /^(?<key>[^:]+):(?<value>.*)$/m;
function parseFrontMatter(input: string) {
  const match = input.match(frontMatterRe);
  const frontMatterContent = match?.groups?.frontMatter?.trim();

  if (frontMatterContent == null) {
    throw new Error("Failed to parse front matter");
  }

  const contentStart = 2 * "---\n".length + frontMatterContent.length;

  const frontMatter = Object.fromEntries(
    frontMatterContent.split("\n").map((line, index) => {
      const match = line.match(frontMatterKeyValueRe);
      const key = match?.groups?.key;
      const value = match?.groups?.value;

      if (!key || !value) {
        throw new Error(
          `Failed to parse front matter at line ${index + 1}: "${line}"`
        );
      }

      return [key, JSON.parse(value)];
    })
  );

  return {
    contentStart,
    attributes: frontMatterSchema.parse(frontMatter),
  };
}
