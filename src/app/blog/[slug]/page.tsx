import { getPathSlugMappings, getPostByPath } from "@/blog-data";
import { notFound, redirect } from "next/navigation";
import readingTime from "reading-time";
import Markdown from "@/components/markdown";
import { ChipList, Chip } from "@/components/chip/chip";
import Link from "next/link";
import { Suspense, memo } from "react";
import { CodeBlock } from "@/components/code-block";
import type { Metadata } from "next";

async function getPost(slug: string) {
  const { slugToPath } = await getPathSlugMappings();
  const path = slugToPath.get(slug);
  if (!path) {
    notFound();
  }
  return getPostByPath(path);
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug);

  if (!post) {
    const slug = (await getPathSlugMappings()).pathToSlug.get(params.slug);
    if (slug) {
      redirect(`/blog/${slug}`);
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
