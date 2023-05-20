import { Chip } from "@/components/chip/chip";
import { PostList } from "@/components/post-list";

export default function Tag({
  params,
}: {
  params: {
    tag: string;
  };
}) {
  return (
    <>
      <h1>
        Posts tagged with <Chip>{params.tag}</Chip>
      </h1>
      {/* @ts-expect-error server component */}
      <PostList tag={params.tag} />
    </>
  );
}
