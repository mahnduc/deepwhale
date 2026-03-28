// types.ts
export type EntryType = 'file' | 'directory';

export interface OPFSEntry {
  name: string;
  kind: EntryType;
  handle: FileSystemHandle;
  path: string;
}

export interface WriteOptions {
  create?: boolean;
  overwrite?: boolean;
}