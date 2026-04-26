export type Section = {
  id: string; 
  level: number;
  title: string;
  content: string;
};

export type Block = {
  id: string;
  title: string;
  content: string;

  level: number;        
  sectionId?: string;   
  source?: string;      
};

export type Chunk = {
  id: string;
  blockId: string;
  text: string;
  tokens: number;

  metadata: {
    title: string;        
    level: number;        
    sectionId?: string;   
    keywords?: string[];  
    source?: string;      
    position?: number;
  };
};

export type Knowledge = {
  chunkId: string;
  facts: string[];
  concepts: string[];
};

export type Index = Record<string, string[]>;

export type Stats = {
  totalDocs: number;
  avgDocLen: number;
  docLengths: Record<string, number>;
  df: Record<string, number>;
};