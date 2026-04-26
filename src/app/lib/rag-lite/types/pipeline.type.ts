// rag-lite/types/pipeline.type.ts

export type PipelineContext = {
  md: string;
  options: PipelineOptions;

  [key: string]: any;
};

export type PipelineStage = {
  name: string;
  dependsOn?: string[];

  run: (ctx: PipelineContext) => any;

  inject?: (
    ctx: PipelineContext,
    result: any
  ) => void;
};

export type PipelineOptions = {
  chunkSize?: number;
  overlap?: number;
  source?: string;

  continueOnError?: boolean;
};