import { NextRequest, NextResponse } from "next/server";

// ZAI config — all required fields for Vercel compatibility
async function getZAI() {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  return new ZAI({
    baseUrl: "https://internal-api.z.ai/v1",
    apiKey: "Z.ai",
    chatId: process.env.ZAI_CHAT_ID || "chat-8006de43-decd-4eee-997f-d19d69537c2d",
    token: process.env.ZAI_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDM2ZGU3MGUtNWY0Ny00ODU4LTk5YjQtMmRkZTk3ODFlZjJjIiwiY2hhdF9pZCI6ImNoYXQtODAwNmRlNDMtZGVjZC00ZWVlLTk5N2YtZDE5ZDY5NTM3YzJkIiwicGxhdGZvcm0iOiJ6YWkifQ.ro4rKaT_wY7s0qu8_Mk3jh2uxZhrljocXTExge9R288",
    userId: process.env.ZAI_USER_ID || "036de70e-5f47-4858-99b4-2dde9781ef2c",
  });
}
