// rag-lite/pipeline/chunk.stage.ts
import { PipelineStage } from "../../types/pipeline.type";
import { chunkBlocks } from "../chunk/chunkBlocks";

const chunkStage: PipelineStage = {
  name: "chunks",
  dependsOn: ["blocks"],

  run(ctx) {
    const {
      chunkSize = 300,
      overlap = 50
    } = ctx.options || {};

    return chunkBlocks(
      ctx.blocks,
      chunkSize,
      overlap
    );
  }
};

export default chunkStage;