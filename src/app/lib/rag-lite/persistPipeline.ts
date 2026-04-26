// rag-lite/persist/persistPipeline.ts

import { opfsApi } from "../opfs/opfsApis";
import { PipelineContext } from "./types/pipeline.type";

export async function persistPipeline(
  ctx: PipelineContext,
  datasetId: string
) {
  // Gốc bắt đầu từ /knowledge
  const base = `/knowledge/${datasetId}`;

  await ensureFolders(base);

  // sections
  if (ctx.sections) {
    await opfsApi.save(
      `${base}/sections/sections.json`,
      JSON.stringify(ctx.sections, null, 2)
    );
  }

  // blocks
  if (ctx.blocks) {
    await opfsApi.save(
      `${base}/blocks/blocks.json`,
      JSON.stringify(ctx.blocks, null, 2)
    );
  }

  // chunks
  if (ctx.chunks) {
    for (const chunk of ctx.chunks) {
      await opfsApi.save(
        `${base}/chunks/${chunk.id}.json`,
        JSON.stringify(chunk, null, 2)
      );
    }
  }

  // keywords
  if (ctx.keywords) {
    await opfsApi.save(
      `${base}/keywords/keywords.json`,
      JSON.stringify(ctx.keywords, null, 2)
    );
  }

  // knowledge
  if (ctx.knowledge) {
    await opfsApi.save(
      `${base}/knowledge/knowledge.json`,
      JSON.stringify(ctx.knowledge, null, 2)
    );
  }

  // index
  if (ctx.index) {
    await opfsApi.save(
      `${base}/index/inverted_index.json`,
      JSON.stringify(ctx.index, null, 2)
    );
  }

  // stats
  if (ctx.stats) {
    await opfsApi.save(
      `${base}/stats/stats.json`,
      JSON.stringify(ctx.stats, null, 2)
    );
  }

  // manifest
  await saveManifest(base, ctx);
}

/**
 * Tạo folder theo thứ tự cha → con
 * OPFS không hỗ trợ recursive mkdir
 */
async function ensureFolders(base: string) {
  const datasetId = base.split("/").pop();

  const folders = [
    "/knowledge",
    `/knowledge/${datasetId}`,

    `${base}/sections`,
    `${base}/blocks`,
    `${base}/chunks`,
    `${base}/keywords`,
    `${base}/knowledge`,
    `${base}/index`,
    `${base}/stats`,
    `${base}/manifest`
  ];

  for (const folder of folders) {
    const exists = await opfsApi.exists(folder);

    if (!exists) {
      await opfsApi.createFolder(folder);
    }
  }
}

async function saveManifest(
  base: string,
  ctx: PipelineContext
) {
  const manifest = {
    dataset: base.split("/").pop(),

    createdAt: Date.now(),

    counts: {
      sections: ctx.sections?.length ?? 0,
      blocks: ctx.blocks?.length ?? 0,
      chunks: ctx.chunks?.length ?? 0,
      knowledge: ctx.knowledge?.length ?? 0,
      keywords: Object.keys(ctx.keywords ?? {}).length,
      indexTerms: Object.keys(ctx.index ?? {}).length
    },

    runtime: ctx.runtime ?? null
  };

  await opfsApi.save(
    `${base}/manifest/manifest.json`,
    JSON.stringify(manifest, null, 2)
  );
}