// rag-lite/pipeline/index.stage.ts
import { PipelineStage } from "../../types/pipeline.type";
import { buildIndex } from "../index/buildIndex";

const indexStage: PipelineStage = {
  name: "index",
  dependsOn: ["chunks"],

  run(ctx) {
    return buildIndex(ctx.chunks);
  }
};

export default indexStage;