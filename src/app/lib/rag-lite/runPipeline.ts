// rag-lite/pipeline/engine/runPipeline.ts

import { stageRegistry } from "./stageRegistry";
import { PipelineContext, PipelineOptions, PipelineStage } from "./types/pipeline.type";

function validateStages(stages: PipelineStage[]) {
  const names = new Set<string>();

  for (const stage of stages) {
    if (!stage.name?.trim()) { throw new Error("Pipeline stage missing name"); }
    if (names.has(stage.name)) { throw new Error(`Duplicate stage name \"${stage.name}\"`); }
    names.add(stage.name);
  }
}

function sortStages(stages: PipelineStage[]): PipelineStage[] {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const sorted: PipelineStage[] = [];

  function visit(stage: PipelineStage) {
    if (visited.has(stage.name)) { return; }
    if (visiting.has(stage.name)) { throw new Error(`Circular dependency detected at \"${stage.name}\"`);}
    visiting.add(stage.name);

    for (const dep of stage.dependsOn || []) {
      const dependency = stages.find((s) => s.name === dep);
      if (!dependency) { throw new Error(`Missing dependency \"${dep}\" for stage \"${stage.name}\"`);}
      visit(dependency);
    }

    visiting.delete(stage.name);
    visited.add(stage.name);
    sorted.push(stage);
  }

  for (const stage of stages) {visit(stage);}

  return sorted;
}

export async function runPipeline( md: string, options: PipelineOptions = {}): Promise<PipelineContext> {
  validateStages(stageRegistry);
  const ctx: PipelineContext = { md, options, runtime: { startedAt: Date.now(), completedStages: [], errors: [] }};
  const sortedStages = sortStages(stageRegistry);

  for (const stage of sortedStages) {
    try {
      const result = await stage.run(ctx);

      if (stage.inject) {
        stage.inject(ctx, result);
      } else {
        ctx[stage.name] = result;
      }

      ctx.runtime.completedStages.push(stage.name);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown pipeline error";

      ctx.runtime.errors.push({
        stage: stage.name,
        message
      });

      if (!options.continueOnError) {
        throw new Error(
          `Pipeline failed at stage \"${stage.name}\": ${message}`
        );
      }
    }
  }

  ctx.runtime.finishedAt = Date.now();

  return ctx;
}
