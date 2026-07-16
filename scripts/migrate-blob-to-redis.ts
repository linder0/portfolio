/* ---------------------------------------------------------------------------
   One-time migration: copy each mutable JSON document out of Vercel Blob and
   into its Upstash Redis hash (notes, posts, comments, pages, subscribers).
   Idempotent — re-running just overwrites the same fields.

   Run once after provisioning Upstash and pulling env vars locally:

     vercel env pull .env.local
     npx dotenv-cli -e .env.local -- npx tsx scripts/migrate-blob-to-redis.ts

   (Node scripts don't auto-load .env.local the way Next.js does, hence
   dotenv-cli. Needs both the Blob token and the Upstash vars in .env.local.)
   ------------------------------------------------------------------------- */
import { get } from "@vercel/blob";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "",
  token:
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "",
});

// [Blob document path, Redis hash key]
const DOCUMENTS: [path: string, key: string][] = [
  ["content/notes.json", "notes"],
  ["content/posts.json", "posts"],
  ["content/comments.json", "comments"],
  ["content/pages.json", "pages"],
  ["content/subscribers.json", "subscribers"],
];

async function readBlobDocument(
  path: string,
): Promise<Record<string, unknown>> {
  try {
    const result = await get(path, { access: "private" });
    if (result?.statusCode !== 200) return {};
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as Record<string, unknown>;
  } catch (error) {
    console.warn(`! could not read ${path}:`, error);
    return {};
  }
}

async function main() {
  for (const [path, key] of DOCUMENTS) {
    const doc = await readBlobDocument(path);
    const entries = Object.entries(doc);
    if (entries.length === 0) {
      console.log(`- ${key}: nothing to migrate`);
      continue;
    }
    await redis.hset(key, Object.fromEntries(entries));
    console.log(`- ${key}: migrated ${entries.length} record(s)`);
  }
  console.log("Migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
