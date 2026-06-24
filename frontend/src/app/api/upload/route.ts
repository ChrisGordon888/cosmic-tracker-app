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

function isUploadFile(value: unknown): value is UploadFile {
  if (!value || typeof value !== 'object') return false;

  return (
    'name' in value &&
    'size' in value &&
    'type' in value &&
    'arrayBuffer' in value &&
    typeof (value as { name?: unknown }).name === 'string' &&
    typeof (value as { size?: unknown }).size === 'number' &&
    typeof (value as { type?: unknown }).type === 'string' &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === 'function'
  );
}

function slugifyFileName(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'upload'
  );
}

function sanitizePathSegment(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'release-world'
  );
}

function getUploadFolder(kind: string) {
  if (kind === 'audio') return 'release-audio';
  if (kind === 'cover') return 'release-covers';
  if (kind === 'image') return 'release-images';
  if (kind === 'video') return 'release-videos';
  if (kind === 'document') return 'release-documents';
  return 'release-assets';
}

export async function POST(request: Request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          error:
            'Missing BLOB_READ_WRITE_TOKEN in server environment. Check Vercel Project Settings → Environment Variables and redeploy.',
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();

    const fileValue = formData.get('file');
    const releaseWorldId = sanitizePathSegment(
      String(formData.get('releaseWorldId') || 'release-world'),
    );
    const kind = sanitizePathSegment(String(formData.get('kind') || 'asset'));

    if (!isUploadFile(fileValue)) {
      return NextResponse.json(
        { error: 'No file was provided.' },
        { status: 400 },
      );
    }

    const file = fileValue;

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
      token,
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

    return NextResponse.json({ error: message }, { status: 500 });
  }
}