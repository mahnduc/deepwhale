// rag-lite/pipeline/stats.stage.ts
import { PipelineStage } from "../../types/pipeline.type";
import { buildStats } from "../index/buildStats";

const statsStage: PipelineStage = {
  name: "stats",
  dependsOn: ["chunks", "index"],

  run(ctx) {
    return buildStats(
      ctx.chunks,
      ctx.index
    );
  }
};

export default statsStage;