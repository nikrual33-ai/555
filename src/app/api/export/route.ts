import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { analysis, lang } = await request.json();

    const isEn = lang === "en";

    // Build HTML for PDF
    const sectionsHtml = (analysis.sections || [])
      .map(
        (s: Record<string, unknown>) => `
        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="margin: 0; font-size: 14px; color: #1a1a2e;">${s.icon || ""} ${s.title || ""}</h3>
            <span style="font-weight: bold; font-size: 14px; color: ${s.score >= 70 ? "#059669" : s.score >= 40 ? "#d97706" : "#dc2626"};">${s.score}/100</span>
          </div>
          <div style="background: #f3f4f6; border-radius: 6px; height: 6px; margin-bottom: 10px;">
            <div style="background: ${s.score >= 70 ? "#059669" : s.score >= 40 ? "#d97706" : "#dc2626"}; border-radius: 6px; height: 6px; width: ${s.score}%;"></div>
          </div>
          <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6;">
            ${(s.items || []).map((it: Record<string, unknown>) => `
              <li>${it.label}: ${it.value}</li>
            `).join("")}
          </ul>
          <div style="background: #f5f3ff; border-radius: 6px; padding: 8px 12px; margin-top: 8px; font-size: 11px; color: #5b21b6;">
            ${isEn ? "Recommendation" : "Рекомендация"}: ${s.recommendation || ""}
          </div>
        </div>`
      )
      .join("");

    const recommendationsHtml = (analysis.topRecommendations || [])
      .map(
        (r: string, i: number) =>
          `<div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
            <span style="background: #7c3aed; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">${i + 1}</span>
            <span style="font-size: 12px; line-height: 1.6;">${r}</span>
          </div>`
      )
      .join("");

    const competitorsHtml = (analysis.competitors || [])
      .map((c: string) => `<span style="background: #f3f4f6; border-radius: 16px; padding: 4px 12px; font-size: 12px; display: inline-block; margin: 2px;">${c}</span>`)
      .join(" ");

    const visualHtml = analysis.visualAnalysis
      ? `<div style="margin-top: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 14px; margin-bottom: 8px; color: #1a1a2e;">${isEn ? "📸" : "📸"} ${isEn ? "Visual Analysis" : "Визуальный анализ фото"}</h3>
          <p style="font-size: 12px; line-height: 1.6; color: #374151;">${analysis.visualAnalysis}</p>
        </div>`
      : "";

    // Geo Reviews section
    const geoData = analysis.geoReviews;
    const geoHtml = geoData ? `
      <h2 style="font-size: 16px; color: #7c3aed; margin: 20px 0 12px;">${isEn ? "⭐" : "⭐"} ${isEn ? "Geo-service Reviews" : "Отзывы на геосервисах"}</h2>
      ${geoData.placeName ? `<p style="font-size: 13px; margin-bottom: 8px;"><strong>${geoData.placeName}</strong> — ${geoData.totalReviews} ${isEn ? "reviews" : "отзывов"}, avg: ${geoData.averageRating?.toFixed(1)}/5.0</p>` : ""}
      ${geoData.sentimentSummary ? `<p style="font-size: 12px; line-height: 1.6; color: #374151; margin-bottom: 12px;">${geoData.sentimentSummary}</p>` : ""}
      ${(geoData.topComplaints?.length || geoData.topPraises?.length) ? `
        <div style="display: flex; gap: 20px; margin-bottom: 12px;">
          ${geoData.topComplaints?.length ? `
            <div style="flex: 1;">
              <h4 style="font-size: 12px; color: #dc2626; margin-bottom: 6px;">${isEn ? "Top Complaints" : "Основные жалобы"}</h4>
              ${geoData.topComplaints.map((c: string) => `<div style="font-size: 11px; line-height: 1.5; color: #374151; margin-bottom: 3px;">• ${c}</div>`).join("")}
            </div>
          ` : ""}
          ${geoData.topPraises?.length ? `
            <div style="flex: 1;">
              <h4 style="font-size: 12px; color: #059669; margin-bottom: 6px;">${isEn ? "Top Praises" : "Основные похвалы"}</h4>
              ${geoData.topPraises.map((p: string) => `<div style="font-size: 11px; line-height: 1.5; color: #374151; margin-bottom: 3px;">• ${p}</div>`).join("")}
            </div>
          ` : ""}
        </div>
      ` : ""}
      ${geoData.recentReviews?.length ? `
        <h4 style="font-size: 12px; margin-bottom: 8px;">${isEn ? "Recent Reviews" : "Последние отзывы"}</h4>
        ${geoData.recentReviews.slice(0, 5).map((r: Record<string, unknown>) => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
              <strong>${r.author}</strong>
              <span style="color: #6b7280;">${r.rating}/5 · ${r.source || ""} · ${r.date || ""}</span>
            </div>
            <p style="font-size: 11px; line-height: 1.5; color: #374151; margin: 0;">${r.text}</p>
          </div>
        `).join("")}
      ` : ""}
    ` : "";

    // Growth plan section
    const growthPlan = (analysis as Record<string, unknown>).growthPlan;
    const growthHtml = growthPlan ? `
      <h2 style="font-size: 16px; color: #059669; margin: 20px 0 12px;">${isEn ? "🚀" : "🚀"} ${isEn ? "Growth Plan" : "План роста"}</h2>
      <div style="font-size: 12px; line-height: 1.7; color: #374151; white-space: pre-line;">${String(growthPlan)}</div>
    ` : "";

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; }
  .score-circle { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; margin: 0 auto 12px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 16px; color: #7c3aed; margin: 20px 0 12px; }
</style></head>
<body>
  <div class="header">
    <h1>${analysis.businessName || (isEn ? "Business Analysis" : "Анализ бизнеса")}</h1>
    <p style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">${isEn ? "AI Marketing Analysis Report" : "Отчёт AI-анализа маркетинга"} — ${new Date().toLocaleDateString(isEn ? "en-US" : "ru-RU")}</p>
    <div class="score-circle" style="color: ${analysis.overallScore >= 70 ? "#059669" : analysis.overallScore >= 40 ? "#d97706" : "#dc2626"};">${analysis.overallScore}</div>
    <p style="font-size: 12px; color: #6b7280;">${isEn ? "Overall Score" : "Общий балл"}</p>
  </div>

  <p style="font-size: 13px; line-height: 1.7; margin-bottom: 24px; color: #374151;">${analysis.summary || ""}</p>

  ${visualHtml}

  <h2>${isEn ? "Detailed Analysis" : "Детальный анализ"}</h2>
  ${sectionsHtml}

  <h2>${isEn ? "Target Audience" : "Целевая аудитория"}</h2>
  <div style="font-size: 12px; margin-bottom: 20px;">
    ${(analysis.targetAudience?.segments || []).map((s: Record<string, unknown>) =>
      `<div style="display: inline-flex; align-items: center; gap: 4px; background: #f3f4f6; border-radius: 16px; padding: 4px 12px; margin: 2px; font-size: 12px;">
        <span style="font-weight: 500;">${s.name}</span> — ${s.percentage}%
      </div>`
    ).join(" ")}
  </div>

  <h2>${isEn ? "Competitors" : "Конкуренты"}</h2>
  <div style="margin-bottom: 20px;">${competitorsHtml}</div>

  ${geoHtml}

  <h2>${isEn ? "Top Recommendations" : "Топ-рекомендации"}</h2>
  ${recommendationsHtml}

  ${growthHtml}

  <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af;">
    BizAnalyzer AI — ${isEn ? "Generated by AI Marketing Agent" : "Сгенерировано AI маркетинговым агентом"}
  </div>
</body></html>`;

    return NextResponse.json({ html });
  } catch (error: unknown) {
    console.error("Export error:", error);
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
