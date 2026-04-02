// types/tool.types.ts 
import { ReactNode } from "react";

export interface ToolItem {
  id: number;
  name: string;
  path: string;
  description: string;
  icon: ReactNode; 
}