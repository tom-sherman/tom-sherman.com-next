import { listAllPosts } from "@/blog-data";

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
            <code>{formattedDate}</code> {post.title}
          </li>
        );
      })}
    </ul>
  );
}
