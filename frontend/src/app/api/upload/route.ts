import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type UploadFile = {
  name: string;
  size: number;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function isUploadFile(value: FormDataEntryValue | null): value is UploadFile {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'name' in value &&
      'size' in value &&
      'type' in value &&
      'arrayBuffer' in value,
  );
}

function slugifyFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getUploadFolder(kind: string) {
  if (kind === 'audio') return 'release-audio';
  if (kind === 'cover') return 'release-covers';
  if (kind === 'image') return 'release-images';
  return 'release-assets';
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get('file');
    const releaseWorldId = String(formData.get('releaseWorldId') || 'release-world');
    const kind = String(formData.get('kind') || 'asset');

    if (!isUploadFile(file)) {
      return NextResponse.json(
        { error: 'No file was provided.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.` },
        { status: 400 },
      );
    }

    const safeName = slugifyFileName(file.name || 'upload');
    const folder = getUploadFolder(kind);
    const pathname = `${folder}/${releaseWorldId}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
      fileName: file.name,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown upload error.';

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}