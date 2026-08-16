import { NextRequest, NextResponse } from "next/server";

// ZAI config — no filesystem access for Vercel compatibility
async function getZAI() {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  return new ZAI({
    baseUrl: "https://internal-api.z.ai/v1",
    apiKey: "Z.ai",
  });
}

function parseJSON(content: string): Record<string, unknown> | null {
  let jsonStr = content;

  // Remove markdown code blocks
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
      .replace(/"value"\s+"/g, '"value": "')
      .replace(/"label"\s+"/g, '"label": "')
      .replace(/"status"\s+"/g, '"status": "')
      .replace(/"title"\s+"/g, '"title": "')
      .replace(/"name"\s+"/g, '"name": "')
      .replace(/"description"\s+"/g, '"description": "')
      .replace(/"percentage"\s+(\d)/g, '"percentage": $1')
      .replace(/"score"\s+(\d)/g, '"score": $1')
      .replace(/"overallScore"\s+(\d)/g, '"overallScore": $1')
      .replace(/"icon"\s+"/g, '"icon": "')
      .replace(/"recommendation"\s+"/g, '"recommendation": "')
      .replace(/"visualAnalysis"\s+"/g, '"visualAnalysis": "')
      .replace(/"author"\s+"/g, '"author": "')
      .replace(/"text"\s+"/g, '"text": "')
      .replace(/"source"\s+"/g, '"source": "')
      .replace(/"date"\s+"/g, '"date": "')
      .replace(/"sentimentSummary"\s+"/g, '"sentimentSummary": "')
      .replace(/"placeName"\s+"/g, '"placeName": "')
      .replace(/"placeUrl"\s+"/g, '"placeUrl": "')
      .replace(/"growthPlan"\s+"/g, '"growthPlan": "')
      .replace(/"stars"\s+(\d)/g, '"stars": $1')
      .replace(/"count"\s+(\d)/g, '"count": $1')
      .replace(/"totalReviews"\s+(\d)/g, '"totalReviews": $1')
      .replace(/"averageRating"\s+(\d)/g, '"averageRating": $1')
      .replace(/"rating"\s+(\d)/g, '"rating": $1')
      .replace(/"estimatedVolume"\s+"/g, '"estimatedVolume": "')
      .replace(/"cpc"\s+"/g, '"cpc": "')
      .replace(/"trend"\s+"/g, '"trend": "')
      .replace(/"competition"\s+"/g, '"competition": "')
      .replace(/"query"\s+"/g, '"query": "')
      .replace(/"(value|label|status|recommendation|visualAnalysis|description|author|text|source|date|sentimentSummary|placeName|placeUrl|growthPlan|estimatedVolume|cpc|query)\s+"/g, '"$1": "')
      // Universal numeric fix
      .replace(/"(stars|count|totalReviews|averageRating|rating|percentage|score|overallScore)"\s+(\d+\.?\d*)/g, '"$1": $2');

    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.log("[JSON parse attempt 2 failed]", (e2 as Error).message);

      fixed = fixed
        .replace(/[\r\n]+/g, " ")
        .replace(/\s{2,}/g, " ");

      try {
        return JSON.parse(fixed);
      } catch (e3) {
        console.log("[JSON parse attempt 3 failed]", (e3 as Error).message);

        try {
          const bizMatch = extracted.match(/"businessName"\s*:\s*"([^"]+)"/);
          const scoreMatch = extracted.match(/"overallScore"\s*:\s*(\d+)/);
          const summaryMatch = extracted.match(/"summary"\s*:\s*"([^"]{10,500})"/);
          if (bizMatch || scoreMatch) {
            return {
              businessName: bizMatch ? bizMatch[1] : "Unknown",
              overallScore: scoreMatch ? parseInt(scoreMatch[1]) : 50,
              summary: summaryMatch ? summaryMatch[1] : "",
              sections: [],
              competitors: [],
              topRecommendations: [],
              targetAudience: { segments: [] },
            };
          }
        } catch {
          // fall through
        }
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

    // Collect geo-service URLs (3 separate fields with checkboxes)
    const geoGoogleMaps = formData.get("geoGoogleMaps") as string | null;
    const geo2gis = formData.get("geo2gis") as string | null;
    const geoYandexMaps = formData.get("geoYandexMaps") as string | null;
    const geoUrls: string[] = [];
    if (geoGoogleMaps) geoUrls.push(`Google Maps: ${geoGoogleMaps}`);
    if (geo2gis) geoUrls.push(`2GIS: ${geo2gis}`);
    if (geoYandexMaps) geoUrls.push(`Yandex Maps: ${geoYandexMaps}`);

    // Collect social links (individual fields with checkboxes)
    const socialKeys = ["instagram", "telegram", "vk", "facebook", "youtube", "tiktok"];
    const socialLinks: string[] = [];
    for (const key of socialKeys) {
      const val = formData.get(`social_${key}`) as string | null;
      if (val) socialLinks.push(`${key}: ${val}`);
    }

    // Collect uploaded photos
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

    // === Step 1: Photo analysis with VLM ===
    let photoAnalysis = "";
    if (photoBas64.length > 0) {
      const photoPrompt = isEn
        ? `You are a marketing expert. Analyze these ${photoBas64.length} photo(s). Provide a concise analysis covering: visual branding, curb appeal, interior ambiance, first impression. Max 300 words.`
        : `Ты — эксперт по маркетингу. Проанализируй ${photoBas64.length} фото бизнес-локации. Дай краткий анализ: визуальный брендинг, привлекательность витрины, атмосфера интерьера, первое впечатление. Максимум 300 слов.`;

      const photoAnalyses: string[] = [];
      for (let i = 0; i < photoBas64.length; i++) {
        try {
          const visionResult = await zai.createChatCompletionVision({
            messages: [
              { role: "user", content: [
                { type: "text", text: `Photo ${i + 1}: ${photoPrompt}` },
                { type: "image_url", image_url: { url: photoBas64[i] } }
              ] }
            ],
            max_tokens: 800,
            temperature: 0.5,
          });
          const vContent = visionResult.choices?.[0]?.message?.content || "";
          if (vContent) photoAnalyses.push(vContent);
        } catch (err) {
          console.error(`Photo ${i + 1} analysis failed:`, err);
        }
      }
      if (photoAnalyses.length > 0) {
        photoAnalysis = photoAnalyses.join("\n\n");
      }
    }

    // === Step 2: System prompt with all analysis structures ===
    const systemPrompt = isEn
      ? `You are an expert AI marketing agent. Conduct a DEEP analysis and return ONLY valid JSON (no markdown).

Structure:
{
  "businessName": "string",
  "overallScore": 1-100,
  "summary": "3-4 sentences with specifics",
  "sections": [
    { "title": "string", "icon": "emoji", "score": 1-100, "items": [{ "label": "string", "value": "string", "status": "good|warning|critical" }], "recommendation": "3-4 sentences" }
  ],
  "geoReviews": {
    "averageRating": 1.0-5.0,
    "totalReviews": number,
    "ratingDistribution": [{"stars": 5, "count": N}, {"stars": 4, "count": N}, {"stars": 3, "count": N}, {"stars": 2, "count": N}, {"stars": 1, "count": N}],
    "recentReviews": [{"author": "string", "rating": 1-5, "text": "min 20 chars", "date": "string", "source": "Google Maps|2GIS|Yandex Maps"}],
    "sentimentSummary": "2-3 sentences",
    "topComplaints": ["str1", "str2", "str3"],
    "topPraises": ["str1", "str2", "str3"],
    "placeName": "string",
    "placeUrl": "string"
  },
  "searchAnalytics": {
    "queries": [{"query": "string", "estimatedVolume": "e.g. 1200-1800", "competition": "low|medium|high", "trend": "growing|stable|declining", "cpc": "e.g. 15-30 RUB", "recommendation": "string"}],
    "summary": "2-3 sentences about search demand",
    "topOpportunities": ["str1", "str2", "str3"]
  },
  "competitors": ["Competitor 1 — description", "Competitor 2", "Competitor 3"],
  "topRecommendations": ["8 items, 15-20+ words each with specific actions"],
  "growthPlan": "COMPREHENSIVE 500+ word plan: 1.Diagnostics 2.Online promotion 3.Review management 4.Social media 5.Local marketing 6.Conversion 7.Timeline 8.Budget",
  "targetAudience": {"segments": [{"name": "string", "description": "detailed", "percentage": N}]},
  "visualAnalysis": "string (if photos provided)"
}

Always include 5 sections: Online Presence (🌐), Social Media (📱), Brand & Positioning (🎨), Conversion & Lead Gen (📈), Content Strategy (📝).
If geo URLs provided: analyze reviews from those geo services, estimate ratings and reviews based on available data.
If search queries provided: analyze each query's search volume, competition, trend, CPC, and SEO/PPC recommendations.
topRecommendations: minimum 8 items.
growthPlan: 500+ words with budget and timeline.`
      : `Ты — экспертный AI-агент маркетингового агентства. Проводи ГЛУБОКИЙ анализ. Возвращай ТОЛЬКО валидный JSON (без markdown).

Структура:
{
  "businessName": "строка",
  "overallScore": 1-100,
  "summary": "3-4 предложения с конкретикой",
  "sections": [
    { "title": "строка", "icon": "emoji", "score": 1-100, "items": [{ "label": "строка", "value": "строка", "status": "good|warning|critical" }], "recommendation": "3-4 предложения" }
  ],
  "geoReviews": {
    "averageRating": 1.0-5.0,
    "totalReviews": число,
    "ratingDistribution": [{"stars": 5, "count": N}, {"stars": 4, "count": N}, {"stars": 3, "count": N}, {"stars": 2, "count": N}, {"stars": 1, "count": N}],
    "recentReviews": [{"author": "строка", "rating": 1-5, "text": "минимум 20 символов", "date": "строка", "source": "Google Maps|2GIS|Яндекс Карты"}],
    "sentimentSummary": "2-3 предложения",
    "topComplaints": ["стр1", "стр2", "стр3"],
    "topPraises": ["стр1", "стр2", "стр3"],
    "placeName": "строка",
    "placeUrl": "строка"
  },
  "searchAnalytics": {
    "queries": [{"query": "строка", "estimatedVolume": "напр. 1200-1800", "competition": "low|medium|high", "trend": "growing|stable|declining", "cpc": "напр. 15-30 руб", "recommendation": "строка"}],
    "summary": "2-3 предложения о поисковом спросе",
    "topOpportunities": ["стр1", "стр2", "стр3"]
  },
  "competitors": ["Конкурент 1 — описание", "Конкурент 2", "Конкурент 3"],
  "topRecommendations": ["8 штук, каждая 15-20+ слов с конкретными действиями"],
  "growthPlan": "РАЗВЁРНУТЫЙ план на 500+ слов: 1.Диагностика 2.Онлайн-продвижение 3.Работа с отзывами 4.Соцсети 5.Локальный маркетинг 6.Конверсия 7.Таймлайн 8.Бюджет",
  "targetAudience": {"segments": [{"name": "строка", "description": "подробно", "percentage": N}]},
  "visualAnalysis": "строка (если есть фото)"
}

Всегда включай 5 секций: Онлайн-присутствие (🌐), Социальные сети (📱), Бренд и позиционирование (🎨), Конверсия и лидогенерация (📈), Контент-стратегия (📝).
Если указаны ссылки на геосервисы: проанализируй отзывы с этих сервисов, оцени рейтинг.
Если указаны поисковые запросы: проанализируй каждый запрос — объём, конкуренцию, тренд, CPC, рекомендации по SEO/PPC.
topRecommendations: минимум 8 штук.
growthPlan: 500+ слов с бюджетом и таймлайном.`;

    // Build user prompt
    const geoInfo = geoUrls.length > 0 ? `🗺️ Геосервисы:\n${geoUrls.join("\n")}` : "";
    const socialInfo = socialLinks.length > 0 ? `📱 Соцсети:\n${socialLinks.join("\n")}` : "";
    const searchInfo = searchQueries ? `🔍 Поисковые запросы для аналитики:\n${searchQueries}` : "";

    const userPrompt = `${isEn ? "Analyze this business:" : "Проанализируй бизнес:"}
${address ? `📍 Адрес: ${address}` : ""}
${website ? `🔗 Сайт: ${website}` : ""}
${geoInfo}
${socialInfo}
${searchInfo}
${query ? `❓ Запрос клиента: ${query}` : ""}
${photoAnalysis ? `\n📸 РЕЗУЛЬТАТЫ АНАЛИЗА ФОТО:\n${photoAnalysis}` : ""}
${photoAnalysis ? "\nВАЖНО: Включи анализ фото в отчёт. Добавь поле 'visualAnalysis'." : ""}
${geoUrls.length > 0 ? "\nВАЖНО: Заполни объект 'geoReviews' на основе данных с указанных геосервисов." : ""}
${searchQueries ? "\nВАЖНО: Заполни объект 'searchAnalytics' — проанализируй каждый поисковый запрос с оценкой объёма, конкуренции, тренда и CPC." : ""}
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
    console.log("[AI Response] length:", content.length);
    const analysis = parseJSON(content);
    console.log("[Parse result]", analysis ? "SUCCESS" : "FAILED");

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

// GET: placeholder — history requires external DB
export async function GET() {
  return NextResponse.json({ history: [] });
}
