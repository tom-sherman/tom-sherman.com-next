import { Me } from "@/components/about-me/about-me";
import Link from "next/link";
import styles from "./layout.module.css";
import clsx from "clsx";

export const runtime = "edge";

export const metadata = {
  title: "Blog | Tom Sherman",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className={clsx("container", styles.blogNav)}>
        <ul>
          <li>
            <strong>Tom's blog</strong>
          </li>
        </ul>
        <ul>
          <li>
            <Link href="/blog">All posts</Link>
          </li>
          <li>
            <Link href="/">
              <span role="img" aria-label="Home">
                🏠
              </span>
            </Link>
          </li>
        </ul>
      </nav>
      <main className={styles.postContent}>{children}</main>
      <section className="container">
        <article>
          <Me />
        </article>
      </section>
    </>
  );
}
