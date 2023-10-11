import { getSlugFromPath } from "@/blog-data";
import { BLOG_WEBHOOK_SECRET } from "@/server-constants";
import { verify } from "@octokit/webhooks-methods";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = request.headers.get("x-hub-signature-256");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await request.clone().text();

  const verified = await verify(BLOG_WEBHOOK_SECRET, body, signature);

  if (!verified) {
    return new Response("Not authorised", { status: 403 });
  }

  const parseResult = pushEventSchema.safeParse(JSON.parse(body));
  if (!parseResult.success) {
    return new Response("Invalid payload", { status: 400 });
  }

  // Always revalidate the index page
  revalidatePath("/");

  for (const path of getChangedPaths(parseResult.data)) {
    if (!pathIsPost(path)) {
      continue;
    }

    const slug = getSlugFromPath(path);

    revalidatePath(`/blog/${slug}`);
  }

  return new Response("OK");
}

function pathIsPost(path: string) {
  return path.startsWith("posts/") && path.endsWith(".md");
}

function getChangedPaths(event: PushEvent) {
  const paths = new Set<string>();

  for (const commit of event.commits) {
    for (const path of commit.added) {
      paths.add(path);
    }

    for (const path of commit.modified) {
      paths.add(path);
    }

    for (const path of commit.removed) {
      paths.add(path);
    }
  }

  return paths;
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
