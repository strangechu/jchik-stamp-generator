import { NextRequest, NextResponse } from "next/server";
import { getReferenceImages } from "@/lib/references";
import { checkGlobalLimit, checkIpLimit } from "@/lib/rate-limiter";
import { buildPrompt } from "@/lib/prompt-builder";


// Gemini API endpoint for image generation
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, apiKey: userApiKey } = body as {
      scenario?: string;
      apiKey?: string;
    };

    // --- Validate input ---
    if (!scenario || scenario.trim().length === 0) {
      return NextResponse.json(
        { error: "請輸入情境描述" },
        { status: 400 }
      );
    }

    // --- Resolve API key ---
    const usingDefaultKey = !userApiKey;
    const apiKey = userApiKey || process.env.NANO_BANANA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "未設定 API Key。請輸入您的 Gemini API Key，或請管理員設定環境變數。" },
        { status: 401 }
      );
    }

    // --- Rate limiting (only when using default key) ---
    if (usingDefaultKey) {
      // 第一層：全域每日總量上限（300 次/天）
      const globalCheck = checkGlobalLimit();
      if (!globalCheck.allowed) {
        return NextResponse.json(
          {
            error: "今日服務已達使用上限，請明天再試，或輸入自己的 API Key 以繼續使用。",
            remaining: 0,
          },
          { status: 429 }
        );
      }

      // 第二層：單一 IP 每日上限（10 次/天）
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const ipCheck = checkIpLimit(ip);
      if (!ipCheck.allowed) {
        return NextResponse.json(
          {
            error: "已達每日使用上限（10 次）。請輸入自己的 API Key 以解除限制。",
            remaining: 0,
          },
          { status: 429 }
        );
      }
    }

    // --- Build prompt ---
    const prompt = buildPrompt(scenario);

    // --- Load reference images as base64 ---
    const referenceImages = getReferenceImages();

    // --- Build Gemini API request payload ---
    // Parts: text prompt + reference images as inline_data
    const parts: Array<
      | { text: string }
      | { inline_data: { mime_type: string; data: string } }
    > = [];

    // Add reference images first (style references)
    for (const ref of referenceImages) {
      parts.push({
        inline_data: {
          mime_type: ref.mimeType,
          data: ref.base64,
        },
      });
    }

    // Add text prompt
    parts.push({ text: prompt });

    const geminiPayload = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    };

    // --- Call Gemini API ---
    const apiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Gemini API error:", apiResponse.status, errorText);
      return NextResponse.json(
        {
          error: `Gemini API 錯誤 (${apiResponse.status})`,
          detail: errorText,
        },
        { status: apiResponse.status }
      );
    }

    const result = await apiResponse.json();

    // --- Debug: log full Gemini response structure ---
    console.log("Gemini API response:", JSON.stringify(result, null, 2).substring(0, 2000));

    // --- Extract generated image from response ---
    const candidates = result.candidates || [];
    const candidateParts = candidates[0]?.content?.parts || [];

    let imageBase64 = "";
    let imageMimeType = "image/png";
    let responseText = "";

    for (const part of candidateParts) {
      // Gemini API returns camelCase "inlineData" (not snake_case "inline_data")
      const inlineData = part.inlineData || part.inline_data;
      if (inlineData) {
        imageBase64 = inlineData.data;
        imageMimeType = inlineData.mimeType || "image/png";
      }
      if (part.text) {
        responseText = part.text;
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        {
          error: "API 未返回圖片。可能是內容安全過濾導致，請嘗試不同的情境描述。",
          responseText,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt,
      imageBase64,
      imageMimeType,
      responseText,
      referenceCount: referenceImages.length,
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "伺服器內部錯誤" },
      { status: 500 }
    );
  }
}
