// rag-lite/pipeline/stages/knowledge.stage.ts
import { PipelineStage } from "../../types/pipeline.type";
import { buildKnowledge } from "../knowledge/buildKnowledge";

const knowledgeStage: PipelineStage = {
  name: "knowledge",
  dependsOn: ["chunks"],

  run(ctx) {
    return buildKnowledge(ctx.chunks);
  }
};

export default knowledgeStage;