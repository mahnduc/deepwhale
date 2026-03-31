// course.service.ts

export interface CourseMeta {
  id: string;
  displayName: string;
  description: string;
  createdAt: number;
}

const baseDir = async () => {
  const root = await navigator.storage.getDirectory();
  const docsify = await root.getDirectoryHandle("docsify", { create: true });
  return await docsify.getDirectoryHandle("courses", { create: true });
};

// Lấy danh sách khóa học
export const getCourses = async (): Promise<CourseMeta[]> => {
  const coursesDir = await baseDir();
  const list: CourseMeta[] = [];

  // @ts-ignore
  for await (const entry of coursesDir.values()) {
    if (entry.kind === "directory") {
      try {
        const subDir = await coursesDir.getDirectoryHandle(entry.name);
        const metaFile = await subDir.getFileHandle("metadata.json");
        const file = await metaFile.getFile();
        const meta = JSON.parse(await file.text());
        list.push(meta);
      } catch {
        list.push({
          id: entry.name,
          displayName: entry.name,
          description: "Dữ liệu cục bộ",
          createdAt: Date.now()
        });
      }
    }
  }

  return list.sort((a, b) => b.createdAt - a.createdAt);
};

// Import template từ GitHub
export const importTemplate = async () => {
  const username = "mahnduc";
  const repo = "docsify-template-repo";
  const branch = "main";

  const files = ["index.html", "README.md", ".nojekyll", "_sidebar.md"];

  const courseId = `tpl_${Date.now()}`;
  const coursesDir = await baseDir();
  const thisCourseDir = await coursesDir.getDirectoryHandle(courseId, { create: true });

  for (const fileName of files) {
    const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${fileName}`;
    try {
      const res = await fetch(rawUrl);
      if (!res.ok) continue;

      const blob = await res.blob();
      const handle = await thisCourseDir.getFileHandle(fileName, { create: true });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch {}
  }

  const meta = {
    id: courseId,
    displayName: "Docsify Starter",
    description: `${username}/${repo}`,
    createdAt: Date.now()
  };

  const metaHandle = await thisCourseDir.getFileHandle("metadata.json", { create: true });
  const writable = await metaHandle.createWritable();
  await writable.write(JSON.stringify(meta));
  await writable.close();
};

// Upload folder
export const uploadCourseFolder = async (files: FileList) => {
  const fileList = Array.from(files);
  const courseId = `course_${Date.now()}`;
  const originalName = fileList[0].webkitRelativePath.split("/")[0];

  const coursesDir = await baseDir();
  const thisCourseDir = await coursesDir.getDirectoryHandle(courseId, { create: true });

  for (const file of fileList) {
    const parts = file.webkitRelativePath.split("/");
    let current = thisCourseDir;

    for (let i = 1; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i], { create: true });
    }

    const handle = await current.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await handle.createWritable();
    await writable.write(file);
    await writable.close();
  }

  const meta = {
    id: courseId,
    displayName: originalName,
    description: "Uploaded",
    createdAt: Date.now()
  };

  const metaHandle = await thisCourseDir.getFileHandle("metadata.json", { create: true });
  const writable = await metaHandle.createWritable();
  await writable.write(JSON.stringify(meta));
  await writable.close();
};

// Update metadata
export const updateCourseMeta = async (id: string, name: string, desc: string) => {
  const coursesDir = await baseDir();
  const subDir = await coursesDir.getDirectoryHandle(id);

  const meta = {
    id,
    displayName: name,
    description: desc,
    createdAt: Date.now()
  };

  const handle = await subDir.getFileHandle("metadata.json", { create: true });
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(meta));
  await writable.close();
};

// Delete
export const deleteCourseById = async (id: string) => {
  const coursesDir = await baseDir();
  await coursesDir.removeEntry(id, { recursive: true });
};