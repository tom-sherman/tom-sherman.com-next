import { Chip } from "@/components/chip/chip";
import { PostList } from "@/components/post-list";

interface Props {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateMetadata(props: Props) {
  const params = await props.params;
  return {
    title: `Posts tagged with ${params.tag}`,
  };
}

export default async function Tag(props: Props) {
  const params = await props.params;
  return (
    <>
      <h1>
        Posts tagged with <Chip>{params.tag}</Chip>
      </h1>
      <PostList tag={params.tag} />
    </>
  );
}
