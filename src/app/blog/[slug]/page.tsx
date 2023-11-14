import { getPathSlugMappings, getPostByPath, listAllPosts } from "@/blog-data";
import { notFound, redirect } from "next/navigation";
import readingTime from "reading-time";
import Markdown from "@/components/markdown";
import { ChipList, Chip } from "@/components/chip/chip";
import Link from "next/link";
import { Suspense, createElement, memo } from "react";
import type { Metadata } from "next";
import { CodeBlock } from "react-perfect-syntax-highlighter";
import { Tweet } from "react-tweet";

async function getPost(slug: string) {
  const { slugToPath } = await getPathSlugMappings();
  const path = slugToPath.get(slug);
  return path ? await getPostByPath(path) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) {
    const slug = (await getPathSlugMappings()).pathToSlug.get(
      `posts/${params.slug}`,
    );

    if (slug) {
      redirect(`/blog/${slug}`);
    }
    return {};
  }

  const imgUrl = new URL(
    "https://og-image-worker.tomsherman.workers.dev/img/og-blog",
  );
  imgUrl.searchParams.set("title", post.title);

  return {
    title: post.title,
    description: post.description ?? undefined,
    authors: {
      name: "Tom Sherman",
    },
    openGraph: {
      title: post.title,
      description: post.description ?? undefined,
      images: imgUrl.toString(),
    },
    twitter: {
      title: post.title,
      description: post.description ?? undefined,
      images: imgUrl.toString(),
      card: "summary_large_image",
    },
  };
}

interface Params {
  slug: string;
}

interface Props {
  params: Params;
}

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await listAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug);

  if (!post) {
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

const makeHeadingComponent = (level: number) =>
  memo(function HeadingWithLevel(props: {
    id: string;
    children: React.ReactNode;
  }) {
    return <Heading level={level} {...props} />;
  });

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

  Tweet: memo(function TweetComponent({
    link,
    id,
  }: {
    link: string;
    id: string;
  }) {
    return (
      <div className="tweet" data-tweet-href={link}>
        <Tweet id={id} />
      </div>
    );
  }),

  h1: makeHeadingComponent(1),
  h2: makeHeadingComponent(2),
  h3: makeHeadingComponent(3),
  h4: makeHeadingComponent(4),
  h5: makeHeadingComponent(5),
  h6: makeHeadingComponent(6),
};

function Heading({
  level,
  children,
  id,
}: {
  level: number;
  children: React.ReactNode;
  id: string;
}) {
  const headingElement = createElement(`h${level}`, { id }, children);
  return headingElement;
}
