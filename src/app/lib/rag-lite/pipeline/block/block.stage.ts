// rag-lite/pipeline/block.stage.ts
import { buildBlocks } from "../block/buildBlocks";
import { Block } from "../../types/type";
import { PipelineStage } from "../../types/pipeline.type";

const blockStage: PipelineStage = {
  name: "blocks",
  dependsOn: ["parse"],

  run(ctx) {
    let blocks: Block[] = buildBlocks(ctx.sections);

    const source = ctx.options?.source;

    if (source) {
      blocks = blocks.map((block) => ({
        ...block,
        source
      }));
    }

    return blocks;
  }
};

export default blockStage;