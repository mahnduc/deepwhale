"use client";

import { Search } from "lucide-react";

type Props = {
  markdown: string;
};

export default function PreviewPane({ markdown }: Props) {
  return (
    <div className="flex-1 overflow-y-auto bg-[var(--color-ui-bg)]/30 custom-scrollbar p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="p-6 bg-[var(--color-ui-card)] border rounded-lg font-mono text-[13px] whitespace-pre-wrap">
          {markdown ? (
            markdown
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Search size={32} />
              <p className="mt-2">No content to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}