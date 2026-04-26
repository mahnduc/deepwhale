// rag-lite/pipeline/stages/parse.stage.ts
import { PipelineStage } from "../../types/pipeline.type";
import { parseAndCleanMarkdown } from "./parseAndCleanMarkdown";


const parseStage: PipelineStage = {
  name: "parse",

  run(ctx) {
    return parseAndCleanMarkdown(ctx.md);
  },

  inject(ctx, result) {
    ctx.sections = result.sections;
    ctx.parseStats = result.parseStats;
  }
};

export default parseStage;