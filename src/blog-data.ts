import { request as githubRequest } from "@octokit/request";
import { GITHUB_TOKEN } from "./server-constants";
import { z } from "zod";

const github = githubRequest.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
    accept: "application/vnd.github.v3+json",
  },
});

export async function listAllPosts() {
  const data = await getContents();
  return (
    await Promise.all(data.map((item) => getPostByPath(item.path)))
  ).filter((post) => post.status === "published");
}

export async function getPostByPath(path: string) {
  const slug = getSlugFromPath(path); // fail fast if path is invalid
  const res = await github(`GET /repos/{owner}/{repo}/contents/{path}`, {
    owner: "tom-sherman",
    repo: "blog",
    path,
    headers: {
      accept: "application/vnd.github.v3.raw",
    },
  });

  if (typeof res.data !== "string") {
    throw new Error("Failed to get contents");
  }

  const content = res.data as string;
  const fontMatter = parseFrontMatter(content);

  return {
    content: content.slice(fontMatter.contentStart),
    slug,
    ...fontMatter.attributes,
  };
}

type ReadonlyMap<K, V> = Omit<Map<K, V>, "set" | "delete">;

export async function getPathSlugMappings() {
  const data = await getContents();

  const pathToSlugEntries = data.map(
    (item) => [item.path, getSlugFromPath(item.path)] as const
  );

  return {
    pathToSlug: new Map(pathToSlugEntries) as ReadonlyMap<string, string>,
    slugToPath: new Map(
      pathToSlugEntries.map(([path, slug]) => [slug, path])
    ) as ReadonlyMap<string, string>,
  };
}

async function getContents() {
  const res = await github(`GET /repos/{owner}/{repo}/contents/{path}`, {
    owner: "tom-sherman",
    repo: "blog",
    path: "posts",
  });

  if (!Array.isArray(res.data)) {
    throw new Error("Failed to get contents");
  }
  return res.data;
}

function getSlugFromPath(path: string) {
  const match = /^posts\/\d+-(.+)\.md$/gi.exec(path)?.[1];
  if (!match) {
    throw new Error(`Failed to get slug from path: ${path}`);
  }

  return match;
}

const frontMatterTagsSchema = z.array(z.string());
const frontMatterStatusSchema = z.union([
  z.literal("unlisted"),
  z.literal("published"),
]);
const frontMatterSchema = z.object({
  title: z.string(),
  createdAt: z.string(),
  tags: frontMatterTagsSchema.default([]),
  status: frontMatterStatusSchema.default("published"),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
});
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
