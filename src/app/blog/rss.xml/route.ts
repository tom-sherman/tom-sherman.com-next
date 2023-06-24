import { listAllPosts } from "@/blog-data";

export async function GET(request: Request) {
  const posts = await listAllPosts();
  const blogUrl = new URL("/blog", request.url).toString();

  const rss = `
    <rss xmlns:blogChannel="${blogUrl}" version="2.0">
      <channel>
        <title>Tom Sherman Blog</title>
        <link>${blogUrl}</link>
        <description>Tom Sherman's blog</description>
        <language>en-gb</language>
        <generator>Remix</generator>
        <ttl>40</ttl>
        ${posts
          .map((post) =>
            `
            <item>
              <title>${cdata(post.title)}</title>
              <description>${cdata(
                post.description ?? "A new post on Tom's blog."
              )}</description>
              <pubDate>${new Intl.DateTimeFormat("fr-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(new Date(post.createdAt))}</pubDate>
              <link>${blogUrl}/${post.slug}</link>
              <guid>${blogUrl}/${post.slug}</guid>
            </item>
          `.trim()
          )
          .join("\n")}
      </channel>
    </rss>
  `.trim();

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Length": String(new TextEncoder().encode(rss).length),
    },
  });
}

function cdata(s: string) {
  return `<![CDATA[${s}]]>`;
}
