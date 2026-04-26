// rag-lite/pipeline/stageRegistry.ts
import blockStage from "./pipeline/block/block.stage";
import chunkStage from "./pipeline/chunk/chunk.stage";
import indexStage from "./pipeline/index/index.stage";
import statsStage from "./pipeline/index/stats.stage";
import keywordStage from "./pipeline/keyword/keyword.stage";
import knowledgeStage from "./pipeline/knowledge/knowledge.stage";
import parseStage from "./pipeline/parse-clean/parse-clean.stage";
import { PipelineStage } from "./types/pipeline.type";

export const stageRegistry: PipelineStage[] = [
  parseStage,
  blockStage,
  chunkStage,
  keywordStage,
  knowledgeStage,
  indexStage,
  statsStage
];