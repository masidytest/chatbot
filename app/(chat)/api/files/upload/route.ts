import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { saveDocument } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size should be less than 10MB",
    })
    .refine(
      (file) =>
        [
          "image/jpeg",
          "image/png",
          "application/pdf",
          "text/plain",
          "text/markdown",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type),
      {
        message: "Supported formats: JPEG, PNG, PDF, TXT, MD, DOC, DOCX",
      }
    ),
});

// Extract text from uploaded file for RAG
async function extractText(file: Blob, filename: string): Promise<string> {
  const type = file.type;

  // Plain text / markdown
  if (type === "text/plain" || type === "text/markdown") {
    return await file.text();
  }

  // PDF — extract text using basic parsing
  if (type === "application/pdf") {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Extract readable text from PDF bytes (basic extraction)
      const text = new TextDecoder("latin1").decode(bytes);
      // Pull out text between BT/ET markers (basic PDF text extraction)
      const matches = text.match(/BT[\s\S]*?ET/g) ?? [];
      const extracted = matches
        .join(" ")
        .replace(/\(([^)]+)\)\s*Tj/g, "$1 ")
        .replace(/\(([^)]+)\)\s*TJ/g, "$1 ")
        .replace(/[^\x20-\x7E\n]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return extracted.length > 100 ? extracted : `[PDF: ${filename}]`;
    } catch {
      return `[PDF: ${filename}]`;
    }
  }

  return `[File: ${filename}]`;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const filename = (formData.get("file") as File).name;
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileBuffer = await file.arrayBuffer();
    const isImage = file.type.startsWith("image/");

    try {
      // Upload to Vercel Blob
      const data = await put(safeName, fileBuffer, { access: "public" });

      // For non-image files, extract text and save as a document for RAG
      if (!isImage) {
        const fileBlob = new Blob([fileBuffer], { type: file.type });
        const extractedText = await extractText(fileBlob, filename);

        if (extractedText && extractedText.length > 10) {
          await saveDocument({
            id: generateUUID(),
            title: filename,
            kind: "text",
            content: extractedText,
            userId: session.user.id,
          });
        }
      }

      return NextResponse.json({
        ...data,
        isDocument: !isImage,
        filename,
      });
    } catch (_error) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
