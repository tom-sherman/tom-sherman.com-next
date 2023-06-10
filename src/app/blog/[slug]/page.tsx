import { GitHubBlogData, blog } from "@/blog-data";
import { notFound, redirect } from "next/navigation";
import { request as githubRequest } from "@octokit/request";
import { GITHUB_TOKEN } from "@/server-constants";
import readingTime from "reading-time";
import Markdown from "@/components/markdown";
import { ChipList, Chip } from "@/components/chip/chip";
import Link from "next/link";
import { Suspense, memo } from "react";
import { CodeBlock } from "@/components/code-block";

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await blog().getPost(params.slug);

  if (!post) {
    const github = new GitHubBlogData(
      githubRequest.defaults({
        headers: {
          authorization: `token ${GITHUB_TOKEN}`,
          accept: "application/vnd.github.v3+json",
        },
      })
    );

    try {
      const resolvedSlug = await github.getPostSlugByPath(
        `posts/${params.slug}`
      );
      redirect(`/blog/${resolvedSlug}`);
    } catch (e) {
      if ((e as any)?.status !== 404) {
        throw e;
      }
      console.log(e);
    }

    notFound();
  }

  const createdAt = new Date(post.createdAt);

  return (
    <>
      <small>
        {new Intl.DateTimeFormat("en-GB", {
          dateStyle: "long",
        }).format(createdAt)}{" "}
        - {readingTime(post.content).text}
      </small>

      <Markdown content={post.content} components={markdownComponents} />

      <ChipList>
        {post.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/blog/tags/${tag}`}>
              <Chip>{tag}</Chip>
            </Link>
          </li>
        ))}
      </ChipList>
    </>
  );
}

interface Preprops {
  children: string;
  "data-language"?: string;
}

const markdownComponents = {
  pre: memo(function Pre({ children, "data-language": language }: Preprops) {
    const fallback = (
      <pre>
        <code>{children}</code>
      </pre>
    );

    if (!language) {
      return fallback;
    }

    // TODO: light/dark theme depending on user preference
    return (
      <Suspense fallback={fallback}>
        <CodeBlock code={children} lang={language} theme="github-dark" />
      </Suspense>
    );
  }),
};
