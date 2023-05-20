import { Me } from "@/components/about-me/about-me";
import Link from "next/link";

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
      <nav className="container blog-nav">
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
      <main className="post-content">{children}</main>
      <section className="container">
        <article>
          <Me />
        </article>
      </section>
    </>
  );
}
