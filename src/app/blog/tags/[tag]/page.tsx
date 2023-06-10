import { Chip } from "@/components/chip/chip";
import { PostList } from "@/components/post-list";

interface Props {
  params: {
    tag: string;
  };
}

export function generateMetadata({ params }: Props) {
  return {
    title: `Posts tagged with ${params.tag}`,
  };
}

export default function Tag({ params }: Props) {
  return (
    <>
      <h1>
        Posts tagged with <Chip>{params.tag}</Chip>
      </h1>
      <PostList tag={params.tag} />
    </>
  );
}
