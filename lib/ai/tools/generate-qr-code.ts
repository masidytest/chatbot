import { tool } from "ai";
import { z } from "zod";

export const generateQRCode = tool({
  description: "Generate a QR code for any text or URL.",
  inputSchema: z.object({
    content: z.string().describe("Text or URL to encode as QR code"),
  }),
  execute: async (input) => {
    try {
      const encoded = encodeURIComponent(input.content.trim());
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;

      return {
        url: qrUrl,
        content: input.content,
        message: `QR code generated for: "${input.content}"`,
      };
    } catch (error) {
      return {
        error: "Failed to generate QR code",
      };
    }
  },
});
