
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IntroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const root = await navigator.storage.getDirectory();

        const systemProfileDir = await root.getDirectoryHandle('system-profile');
        const fileHandle = await systemProfileDir.getFileHandle('info.json');

        const file = await fileHandle.getFile();
        const text = await file.text();

        const data = JSON.parse(text);

        if (data) {
          router.replace('/dashboard');
          return;
        }
      } catch {
        // chưa có profile → cho vào intro
      }

      setLoading(false);
    };

    checkProfile();
  }, [router]);

  if (loading) {
    return <div className="w-screen h-screen bg-white" />;
  }

  return <>{children}</>;
}