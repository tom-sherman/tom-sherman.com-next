import { listAllPosts } from "@/blog-data";
import { Chip } from "@/components/chip/chip";
import { ChipList } from "@/components/chip/chip";
import { PostList } from "@/components/post-list";
import Link from "next/link";

export const runtime = "edge";

export const metadata = {
  description: "Tom Sherman's mostly incoherent ramblings.",
};

export default async function Blog() {
  const allTags = [
    ...new Set((await listAllPosts()).flatMap((post) => post.tags)),
  ].sort();

  return (
    <>
      <h1>Tom's Blog</h1>
      <p>A space for my mostly incoherent ramblings.</p>
      <p>
        Got a question?{" "}
        <a href="https://github.com/tom-sherman/blog/discussions/new?category=AMA">
          Create a discussion
        </a>{" "}
        or <a href="https://twitter.com/tomus_sherman">DM me</a>!
      </p>

      {/* @ts-expect-error server component */}
      <PostList />

      <h2>Tags</h2>
      <ChipList>
        {allTags.map((tag) => (
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
