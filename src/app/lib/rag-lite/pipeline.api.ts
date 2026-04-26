// rag-lite/pipeline/api/pipeline.api.ts

import { runPipeline } from "./runPipeline";
import { PipelineContext, PipelineOptions } from "./types/pipeline.type";

export const pipelineApi = {
  async run(
    markdown: string,
    options?: PipelineOptions
  ): Promise<PipelineContext> {
    return await runPipeline(markdown, options);
  },

  async buildDataset(
    markdown: string,
    datasetId: string,
    options?: PipelineOptions
  ) {
    const ctx = await runPipeline(markdown, options);

    return {
      datasetId,

      counts: {
        sections: ctx.sections?.length ?? 0,
        blocks: ctx.blocks?.length ?? 0,
        chunks: ctx.chunks?.length ?? 0,
        knowledge: ctx.knowledge?.length ?? 0,
        keywords: Object.keys(ctx.keywords ?? {}).length,
        indexTerms: Object.keys(ctx.index ?? {}).length
      },

      runtime: ctx.runtime
    };
  }
};