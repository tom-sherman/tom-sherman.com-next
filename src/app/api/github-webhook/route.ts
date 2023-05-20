import { verify } from "@octokit/webhooks-methods";
import { request as githubRequest } from "@octokit/request";
import { kv } from "@vercel/kv";
import { BLOG_WEBHOOK_SECRET, GITHUB_TOKEN } from "@/server-constants";
import { z } from "zod";
import { GitHubBlogData, VercelKvBlogData } from "@/blog-data";

export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("x-hub-signature-256");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await request.text();

  const verified = await verify(BLOG_WEBHOOK_SECRET, body, signature);

  if (!verified) {
    return new Response("Not authorised", { status: 403 });
  }

  const parseResult = pushEventSchema.safeParse(JSON.parse(body));
  if (!parseResult.success) {
    return new Response("Invalid payload", { status: 400 });
  }

  const changes = flattenChanges(parseResult.data);

  const db = new VercelKvBlogData(kv);
  const github = new GitHubBlogData(
    githubRequest.defaults({
      headers: {
        authorization: `token ${GITHUB_TOKEN}`,
        accept: "application/vnd.github.v3+json",
      },
    })
  );

  console.log("Processing changes", changes);

  // The following is not parrelised in case a file exists in both filesToAddOrModify and filesToRemove
  // Running this serially ensures that the database always ends up in a consistent state given the same push event
  await db.deletePostsByPath(changes.filesToRemove);
  const postsToUpsert = await Promise.all(
    changes.filesToAddOrModify.map((path) => github.getPostByPath(path))
  );
  await db.upsertPosts(postsToUpsert);

  return new Response("OK", { status: 200 });
}

function pathIsPost(path: string) {
  return path.startsWith("posts/") && path.endsWith(".md");
}

function flattenChanges(event: PushEvent) {
  const filesToAddOrModify = new Set<string>();
  const filesToRemove = new Set<string>();

  for (const commit of event.commits) {
    for (const file of commit.added.concat(commit.modified)) {
      if (!pathIsPost(file)) continue;
      filesToAddOrModify.add(file);
    }

    for (const file of commit.removed) {
      if (!pathIsPost(file)) continue;
      filesToRemove.add(file);
      filesToAddOrModify.delete(file);
    }
  }

  return {
    filesToAddOrModify: [...filesToAddOrModify],
    filesToRemove: [...filesToRemove],
  };
}

type PushEvent = z.infer<typeof pushEventSchema>;

const pushEventSchema = z.object({
  ref: z.string(),
  commits: z.array(
    z.object({
      id: z.string(),
      added: z.array(z.string()),
      removed: z.array(z.string()),
      modified: z.array(z.string()),
    })
  ),
});
