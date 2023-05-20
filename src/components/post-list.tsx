import { listAllPosts } from "@/blog-data";
import Link from "next/link";

interface PostListProps {
  tag?: string;
}

export async function PostList({ tag }: PostListProps) {
  let posts = await listAllPosts();

  if (tag) {
    posts = posts.filter((post) => post.tags.includes(tag));
  }

  return (
    <ul>
      {posts.map((post) => {
        const formattedDate = new Intl.DateTimeFormat("fr-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(post.createdAt));

        return (
          <li key={post.slug}>
            <code>{formattedDate}</code>{" "}
            <Link href={`/blog/${post.slug}`}>
              <PostTitle title={post.title} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function PostTitle({
  title,
  as: asElement,
}: {
  title: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  const Element = asElement ?? "span";

  return <Element>{title}</Element>;
}
