import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
  "video/mp4",
  "application/pdf",
];

export async function POST(request: Request): Promise<NextResponse> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Missing BLOB_READ_WRITE_TOKEN in server environment. Check Vercel Project Settings → Environment Variables and redeploy.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        return {
          allowedContentTypes,
          addRandomSuffix: true,
          tokenPayload: clientPayload ?? "",
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Blob upload completed:", {
          pathname: blob.pathname,
          url: blob.url,
          tokenPayload,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown upload error.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
