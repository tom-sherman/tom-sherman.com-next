import { Me } from "@/components/about-me/about-me";
import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./home.module.css";
import Link from "next/link";
import { ErrorBoundary } from "react-error-boundary";
import { listAllPosts } from "@/blog-data";
import type { Metadata } from "next";
import { MASTODON_URL } from "@/constants";
import meImg from "@/components/about-me/me.jpg";
import { Chip } from "@/components/chip/chip";

export const metadata: Metadata = {
  title: "Tom Sherman",
  description: "Tom Sherman is a Senior Software Engineer @ OVO",
  openGraph: {
    siteName: "Tom Sherman | Software Engineer",
    title: "Tom Sherman | Software Engineer",
    description: "Tom Sherman is a Senior Software Engineer @ OVO",
    images: meImg as any,
  },
  twitter: {
    site: "@tomus_sherman",
    title: "Tom Sherman",
    card: "summary",
    description: "Twiddling bits, suspending views, managing state.",
    images: meImg as any,
  },
  verification: {
    me: MASTODON_URL,
  },
  other: {
    "msapplication-TileColor": "#9b4dca",
  },
};

export default function Home() {
  return (
    <>
      <section className={clsx("container", styles.homeHero)}>
        <Me imagePriority />
      </section>

      <main className="container">
        <h2>Recent blog posts</h2>
        <Link href="/blog">View all blog posts</Link>

        <ErrorBoundary fallback={<p>Oops! Failed to load blog posts</p>}>
          <RecentBlogPosts />
        </ErrorBoundary>

        <h2>Projects</h2>

        <Project
          name="Serverless XState"
          url="https://github.com/tom-sherman/serverless-xstate"
          description={
            <p>
              An architecture and example implementation for building serverless
              applications using{" "}
              <a href="https://github.com/statelyai/xstate">XState</a>.
            </p>
          }
        />
        <Project
          name="immurl"
          url="https://github.com/tom-sherman/immurl"
          description={
            <p>
              🔗 A tiny ({"<"} 500B), 0-dependency, immutable URL library,
              backed by the native whatwg URL. 🎉 Now with immutable{" "}
              <code>Headers</code> support!
            </p>
          }
        />
        <Project
          name="fetch-multipart"
          url="https://github.com/tom-sherman/fetch-multipart"
          description={
            <>
              <p>
                Standards-inspired <code>multipart/*</code> parsing. It's like
                <code>response.text()</code> but for multipart bodies!
              </p>
              <ul>
                <li>
                  100% standards compliant and isomorphic. Use it in the
                  browser, Cloudflare Workers, Deno, and whatever new JS
                  environment was created last week
                </li>
                <li>
                  Support all multipart bodies: <code>multipart/form-data</code>
                  ,<code>multipart/mixed</code>, <code>multipart/digest</code>,
                  and
                  <code>multipart/parallel</code>
                </li>
                <li>Support nested multipart bodies</li>
              </ul>
            </>
          }
        />
      </main>
    </>
  );
}

interface ProjectProps {
  name: string;
  url: string;
  description: ReactNode;
}

function Project({ name, url, description }: ProjectProps) {
  return (
    <article className="project">
      <h3>
        <a href={url}>{name}</a>
      </h3>
      {description}
    </article>
  );
}

async function RecentBlogPosts() {
  const posts = (await listAllPosts()).slice(0, 3);

  return (
    <div className={clsx("grid", styles.recentPosts)}>
      {posts.map((post) => (
        <article key={post.slug}>
          <header>
            {post.status === "draft" ? (
              <strong>
                <Chip>draft</Chip>
              </strong>
            ) : null}{" "}
            {new Intl.DateTimeFormat("en-gb", {
              dateStyle: "long",
            }).format(new Date(post.createdAt))}{" "}
          </header>
          <Link href={`/blog/${post.slug}`}>
            <h3>{post.title}</h3>
          </Link>
        </article>
      ))}
    </div>
  );
}
