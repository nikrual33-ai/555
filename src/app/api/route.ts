import { NextRequest, NextResponse } from "next/server";

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

function parseJSON(content: string): Record<string, unknown> | null {
  let jsonStr = content;
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }
  let start = jsonStr.indexOf("{");
  let end = jsonStr.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  let extracted = jsonStr.substring(start, end + 1);
  try {
    return JSON.parse(extracted);
  } catch (e1) {
    console.log("[JSON parse attempt 1 failed]", (e1 as Error).message);
    let fixed = extracted
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/"(value|label|status|recommendation|visualAnalysis|description|author|text|source|date|sentimentSummary|placeName|placeUrl|growthPlan|estimatedVolume|cpc|query)"\s+"/g, '"$1": "')
      .replace(/"(stars|count|totalReviews|averageRating|rating|percentage|score|overallScore)"\s+(\d+\.?\d*)/g, '"$1": $2');
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.log("[JSON parse attempt 2 failed]", (e2 as Error).message);
      fixed = fixed.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ");
      try {
        return JSON.parse(fixed);
      } catch {
        return null;
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const address = formData.get("address") as string | null;
    const website = formData.get("website") as string | null;
    const query = formData.get("query") as string | null;
    const searchQueries = (formData.get("searchQueries") as string) || "";
    const lang = (formData.get("lang") as string) || "ru";
    const geoGoogleMaps = formData.get("geoGoogleMaps") as string | null;
    const geo2gis = formData.get("geo2gis") as string | null;
    const geoYandexMaps = formData.get("geoYandexMaps") as string | null;
    const geoUrls: string[] = [];
    if (geoGoogleMaps) geoUrls.push(`Google Maps: ${geoGoogleMaps}`);
    if (geo2gis) geoUrls.push(`2GIS: ${geo2gis}`);
    if (geoYandexMaps) geoUrls.push(`Yandex Maps: ${geoYandexMaps}`);
    const socialKeys = ["instagram", "telegram", "vk", "facebook", "youtube", "tiktok"];
    const socialLinks: string[] = [];
    for (const key of socialKeys) {
      const val = formData.get(`social_${key}`) as string | null;
      if (val) socialLinks.push(`${key}: ${val}`);
    }
    const photoBas64: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("photo") && value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const ext = value.name.split(".").pop() || "jpg";
        const mimeType = value.type || `image/${ext}`;
        photoBas64.push(`data:${mimeType};base64,${base64}`);
      }
    }
    if (!website && !address) {
      return NextResponse.json(
        { error: lang === "en" ? "Provide at least an address or website" : "Укажите хотя бы адрес или ссылку на сайт" },
        { status: 400 }
      );
    }

    const zai = await getZAI();
    const isEn = lang === "en";

    let photoAnalysis = "";
    if (photoBas64.length > 0) {
      const photoPrompt = isEn
        ? `Analyze these ${photoBas64.length} photo(s): visual branding, curb appeal, interior, first impression. Max 300 words.`
        : `Проанализируй ${photoBas64.length} фото: визуальный брендинг, витрина, интерьер, первое впечатление. Максимум 300 слов.`;
      const photoAnalyses: string[] = [];
      for (let i = 0; i < photoBas64.length; i++) {
        try {
          const visionResult = await zai.createChatCompletionVision({
            messages: [{ role: "user", content: [
              { type: "text", text: `Photo ${i + 1}: ${photoPrompt}` },
              { type: "image_url", image_url: { url: photoBas64[i] } }
            ]}],
            max_tokens: 800,
            temperature: 0.5,
          });
          const vContent = visionResult.choices?.[0]?.message?.content || "";
          if (vContent) photoAnalyses.push(vContent);
        } catch (err) {
          console.error(`Photo ${i + 1} failed:`, err);
        }
      }
      if (photoAnalyses.length > 0) photoAnalysis = photoAnalyses.join("\n\n");
    }

    const systemPrompt = isEn
      ? `You are an expert AI marketing agent. Return ONLY valid JSON.
Structure: {"businessName":"string","overallScore":1-100,"summary":"3-4 sentences","sections":[{"title":"string","icon":"emoji","score":1-100,"items":[{"label":"string","value":"string","status":"good|warning|critical"}],"recommendation":"3-4 sentences"}],"geoReviews":{"averageRating":1.0-5.0,"totalReviews":N,"ratingDistribution":[{"stars":5,"count":N},{"stars":4,"count":N},{"stars":3,"count":N},{"stars":2,"count":N},{"stars":1,"count":N}],"recentReviews":[{"author":"string","rating":1-5,"text":"min 20 chars","date":"string","source":"Google Maps|2GIS|Yandex Maps"}],"sentimentSummary":"2-3 sentences","topComplaints":["str1","str2","str3"],"topPraises":["str1","str2","str3"],"placeName":"string","placeUrl":"string"},"searchAnalytics":{"queries":[{"query":"string","estimatedVolume":"e.g. 1200-1800","competition":"low|medium|high","trend":"growing|stable|declining","cpc":"e.g. 15-30 RUB","recommendation":"string"}],"summary":"2-3 sentences","topOpportunities":["str1","str2","str3"]},"competitors":["Competitor 1 - description","Competitor 2","Competitor 3"],"topRecommendations":["8 items, 15-20+ words each"],"growthPlan":"500+ word plan: 1.Diagnostics 2.Online 3.Reviews 4.Social 5.Local 6.Conversion 7.Timeline 8.Budget","targetAudience":{"segments":[{"name":"string","description":"detailed","percentage":N}]},"visualAnalysis":"string"}
5 sections: Online Presence, Social Media, Brand, Conversion, Content. topRecommendations: 8+. growthPlan: 500+ words.`
      : `Ты - экспертный AI-маркетолог. Верни ТОЛЬКО валидный JSON.
Структура: {"businessName":"строка","overallScore":1-100,"summary":"3-4 предложения","sections":[{"title":"строка","icon":"emoji","score":1-100,"items":[{"label":"строка","value":"строка","status":"good|warning|critical"}],"recommendation":"3-4 предложения"}],"geoReviews":{"averageRating":1.0-5.0,"totalReviews":N,"ratingDistribution":[{"stars":5,"count":N},{"stars":4,"count":N},{"stars":3,"count":N},{"stars":2,"count":N},{"stars":1,"count":N}],"recentReviews":[{"author":"строка","rating":1-5,"text":"мин 20 символов","date":"строка","source":"Google Maps|2GIS|Яндекс Карты"}],"sentimentSummary":"2-3 предложения","topComplaints":["стр1","стр2","str3"],"topPraises":["стр1","стр2","str3"],"placeName":"строка","placeUrl":"строка"},"searchAnalytics":{"queries":[{"query":"строка","estimatedVolume":"напр. 1200-1800","competition":"low|medium|high","trend":"growing|stable|declining","cpc":"напр. 15-30 руб","recommendation":"строка"}],"summary":"2-3 предложения","topOpportunities":["стр1","стр2","стр3"]},"competitors":["Конкурент 1 - описание","Конкурент 2","Конкурент 3"],"topRecommendations":["8 штук по 15-20+ слов"],"growthPlan":"500+ слов: 1.Диагностика 2.Онлайн 3.Отзывы 4.Соцсети 5.Локальный 6.Конверсия 7.Таймлайн 8.Бюджет","targetAudience":{"segments":[{"name":"строка","description":"подробно","percentage":N}]},"visualAnalysis":"строка"}
5 секций: Онлайн-присутствие, Соцсети, Бренд, Конверсия, Контент. topRecommendations: 8+. growthPlan: 500+ слов.`;

    const geoInfo = geoUrls.length > 0 ? `Геосервисы:\n${geoUrls.join("\n")}` : "";
    const socialInfo = socialLinks.length > 0 ? `Соцсети:\n${socialLinks.join("\n")}` : "";
    const searchInfo = searchQueries ? `Поисковые запросы:\n${searchQueries}` : "";

    const userPrompt = `${isEn ? "Analyze this business:" : "Проанализируй бизнес:"}
 ${address ? `Адрес: ${address}` : ""}
 ${website ? `Сайт: ${website}` : ""}
 ${geoInfo}
 ${socialInfo}
 ${searchInfo}
 ${query ? `Запрос клиента: ${query}` : ""}
 ${photoAnalysis ? `\nАНАЛИЗ ФОТО:\n${photoAnalysis}\nДобавь поле visualAnalysis.` : ""}
 ${geoUrls.length > 0 ? "\nЗаполни geoReviews на основе геосервисов." : ""}
 ${searchQueries ? "\nЗаполни searchAnalytics для каждого запроса." : ""}
 ${isEn ? "Return JSON." : "Верни JSON."}`;

    const result = await zai.createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 5000,
    });

    const content = result.choices?.[0]?.message?.content || "";
    const analysis = parseJSON(content);

    if (!analysis) {
      return NextResponse.json(
        { error: isEn ? "Failed to process AI response" : "Не удалось обработать ответ AI" },
        { status: 500 }
      );
    }
    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ history: [] });
}
