import { listAllPosts } from "@/blog-data";
import Link from "next/link";
import { Chip } from "./chip/chip";

interface PostListProps {
  tag?: string;
}

export async function PostList({ tag }: PostListProps) {
  let posts = await listAllPosts();

  if (tag) {
    posts = posts.filter((post) => post.tags.includes(tag));
  }

  if (posts.length === 0) {
    return <p>No posts found</p>;
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
            <Link href={`/blog/${post.slug}`}>
              <code>{formattedDate}</code>{" "}
              {post.status === "draft" ? (
                <strong>
                  <Chip>draft</Chip>
                </strong>
              ) : null}{" "}
              {post.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
