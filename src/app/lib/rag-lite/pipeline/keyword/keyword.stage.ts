// rag-lite/pipeline/keyword.stage.ts
import { PipelineStage } from "../../types/pipeline.type";
import { extractKeywords } from "../keyword/extractKeywords";

const keywordStage: PipelineStage = {
  name: "keywords",
  dependsOn: ["chunks"],

  run(ctx) {
    return extractKeywords(ctx.chunks);
  }
};

export default keywordStage;