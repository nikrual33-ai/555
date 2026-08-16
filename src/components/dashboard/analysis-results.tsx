"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Users,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileDown,
  Camera,
  Star,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Rocket,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import type { BusinessAnalysis, GeoReviewsData, SearchQueryData, LangStrings } from "@/types/analysis";

interface AnalysisResultsProps {
  data: BusinessAnalysis;
  lang: LangStrings;
}

const PIE_COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 40) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

function StatusIcon({ status }: { status: "good" | "warning" | "critical" }) {
  if (status === "good")
    return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (status === "warning")
    return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
  return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />;
}

function getScoreLabel(score: number, labels: Record<string, string>): string {
  if (score >= 80) return labels.excellent;
  if (score >= 60) return labels.good;
  if (score >= 40) return labels.average;
  if (score >= 20) return labels.weak;
  return labels.critical;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const starSize = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${starSize} ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function GeoReviewsCard({ data: geoData, lang }: { data: GeoReviewsData; lang: LangStrings }) {
  const isEn = lang.subtitle === "Marketing AI Assistant";
  const barData = (geoData.ratingDistribution || [])
    .map((d) => ({ stars: `${d.stars}`, count: d.count }))
    .reverse();
  const maxCount = Math.max(...barData.map((d) => d.count), 1);

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <MapPin className="h-4 w-4 text-amber-500" />
            </div>
            {lang.geoReviews}
          </CardTitle>
          {geoData.placeUrl && (
            <a
              href={geoData.placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {lang.viewOnMaps}
            </a>
          )}
        </div>
        {geoData.placeName && (
          <p className="text-sm text-muted-foreground">{geoData.placeName}</p>
        )}
        <CardDescription>{lang.geoReviewsDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Rating Summary */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl font-bold text-amber-500">{geoData.averageRating?.toFixed(1) || "—"}</span>
            <StarRating rating={geoData.averageRating || 0} size="md" />
            <span className="text-xs text-muted-foreground">
              {lang.totalReviews}: {geoData.totalReviews || 0}
            </span>
          </div>
          <div className="flex-1 space-y-1.5">
            {barData.map((d) => (
              <div key={d.stars} className="flex items-center gap-2">
                <span className="w-3 text-xs text-muted-foreground">{d.stars}</span>
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-muted-foreground">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment */}
        {geoData.sentimentSummary && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                {isEn ? "📊" : "📊"} {lang.sentiment}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{geoData.sentimentSummary}</p>
            </div>
          </>
        )}

        {/* Complaints & Praises */}
        {(geoData.topComplaints?.length || geoData.topPraises?.length) && (
          <>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              {geoData.topComplaints?.length ? (
                <div>
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-red-500">
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {lang.complaints}
                  </h4>
                  <ul className="space-y-1.5">
                    {geoData.topComplaints.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {geoData.topPraises?.length ? (
                <div>
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-emerald-500">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {lang.praises}
                  </h4>
                  <ul className="space-y-1.5">
                    {geoData.topPraises.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </>
        )}

        {/* Recent Reviews */}
        {geoData.recentReviews?.length ? (
          <>
            <Separator />
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                {isEn ? "💬" : "💬"} {lang.recentReviews}
              </h4>
              <div className="space-y-3">
                {geoData.recentReviews.slice(0, 5).map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-card/50 p-3"
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{r.author}</span>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        {r.source && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {r.source}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "growing")
    return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
  if (trend === "declining")
    return <ArrowDownRight className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-amber-500" />;
}

function CompetitionBadge({ level }: { level: string }) {
  const isEn2 = level === "low" || level === "medium" || level === "high";
  const colors = {
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    high: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  const labels: Record<string, string> = {
    low: "Низкая",
    medium: "Средняя",
    high: "Высокая",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors[level as keyof typeof colors] || colors.medium}`}>
      {labels[level] || level}
    </span>
  );
}

function SearchAnalyticsCard({ data, lang }: { data: SearchQueryData; lang: LangStrings }) {
  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <Search className="h-4 w-4 text-blue-500" />
          </div>
          {lang.searchAnalytics}
        </CardTitle>
        <CardDescription>{lang.searchAnalyticsDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.summary && (
          <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
        )}

        {/* Query table */}
        {data.queries?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Запрос</th>
                  <th className="pb-2 font-medium">{lang.estimatedVolume}</th>
                  <th className="pb-2 font-medium">{lang.competition}</th>
                  <th className="pb-2 font-medium">{lang.trend}</th>
                  <th className="pb-2 font-medium">CPC</th>
                </tr>
              </thead>
              <tbody>
                {data.queries.map((q, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2.5">
                      <span className="font-medium">{q.query}</span>
                      {q.recommendation && (
                        <p className="mt-1 text-xs text-muted-foreground">{q.recommendation}</p>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                        {q.estimatedVolume}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <CompetitionBadge level={q.competition} />
                    </td>
                    <td className="py-2.5">
                      <TrendIcon trend={q.trend} />
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">{q.cpc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Top opportunities */}
        {data.topOpportunities?.length ? (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-blue-600">
                <Rocket className="h-3.5 w-3.5" />
                {lang.topOpportunities}
              </h4>
              <ul className="space-y-1.5">
                {data.topOpportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AnalysisResults({ data, lang }: AnalysisResultsProps) {
  const [growthOpen, setGrowthOpen] = useState(false);
  const radarData = data.sections.map((s) => ({
    metric: s.title.length > 14 ? s.title.slice(0, 14) + "..." : s.title,
    score: s.score,
  }));

  const audienceData =
    data.targetAudience?.segments?.map((s) => ({
      name: s.name,
      value: s.percentage,
    })) || [];

  const isEn = lang.subtitle === "Marketing AI Assistant";

  const handleExportPdf = async () => {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: data, lang: isEn ? "en" : "ru" }),
      });
      const { html } = await response.json();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        });
      }
    } catch {
      // silent
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{data.businessName}</h2>
                  <Badge
                    variant="outline"
                    className={`${getScoreBg(data.overallScore)} border`}
                  >
                    {getScoreLabel(data.overallScore, lang.scoreLabels)}
                  </Badge>
                </div>
                <p className="max-w-2xl text-muted-foreground leading-relaxed">
                  {data.summary}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPdf}
                  className="gap-1.5 text-xs"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {lang.exportPdf}
                </Button>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-violet-500/30 bg-violet-500/5">
                  <span
                    className={`text-3xl font-bold ${getScoreColor(data.overallScore)}`}
                  >
                    {data.overallScore}
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {lang.overall}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visual Analysis (from photos) */}
      {data.visualAnalysis && (
        <motion.div variants={item}>
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="h-4 w-4 text-amber-500" />
                {lang.visualAnalysis}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {data.visualAnalysis}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Geo Reviews Card */}
      {data.geoReviews && (
        <motion.div variants={item}>
          <GeoReviewsCard data={data.geoReviews} lang={lang} />
        </motion.div>
      )}

      {/* Search Analytics */}
      {data.searchAnalytics && (
        <motion.div variants={item}>
          <SearchAnalyticsCard data={data.searchAnalytics} lang={lang} />
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-violet-500" />
                {lang.diagnostics}
              </CardTitle>
              <CardDescription>{lang.diagnosticsDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{
                        fontSize: 9,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-violet-500" />
                {lang.audience}
              </CardTitle>
              <CardDescription>{lang.audienceDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {audienceData.length > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={audienceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {audienceData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `${value}%`}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border))",
                            fontSize: "13px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {data.targetAudience?.segments?.map((seg, i) => (
                      <div
                        key={seg.name}
                        className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        {seg.name} — {seg.percentage}%
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  —
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Section Cards */}
      <motion.div variants={item}>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5 text-violet-500" />
          {lang.detailed}
        </h3>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.sections.map((section) => (
          <motion.div key={section.title} variants={item}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{section.icon}</span>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm font-bold ${getScoreColor(section.score)}`}
                  >
                    {section.score}
                    {section.score >= 50 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                </div>
                <Progress value={section.score} className="h-1.5" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {section.items.map((it) => (
                    <div
                      key={it.label}
                      className="flex items-start gap-2 text-sm"
                    >
                      <StatusIcon status={it.status} />
                      <div className="min-w-0">
                        <span className="font-medium">{it.label}: </span>
                        <span className="text-muted-foreground">
                          {it.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {lang.recommendation}:
                  </span>{" "}
                  {section.recommendation}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Competitors */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {isEn ? "🏢" : "🏢"} {lang.competitors}
            </CardTitle>
            <CardDescription>{lang.competitorsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.competitors.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Recommendations */}
      <motion.div variants={item}>
        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {isEn ? "🚀" : "🚀"} {lang.topRecs}
            </CardTitle>
            <CardDescription>{lang.topRecsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {data.topRecommendations.map((rec, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed">
                    {rec}
                  </span>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                </motion.li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </motion.div>

      {/* Growth Plan */}
      {(data as Record<string, unknown>).growthPlan && (
        <motion.div variants={item}>
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardHeader className="pb-3">
              <button
                onClick={() => setGrowthOpen(!growthOpen)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Rocket className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{lang.growthPlan}</CardTitle>
                    <CardDescription>{lang.growthPlanDesc}</CardDescription>
                  </div>
                </div>
                {growthOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            {growthOpen && (
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {String((data as Record<string, unknown>).growthPlan)
                    .split("\n")
                    .map((line, i) => {
                      // Parse markdown-like headers and bold
                      const isHeader = /^\d+\.\s/.test(line) || /^#{1,3}\s/.test(line);
                      const isBold = /^\*\*/.test(line) && /\*\*$/.test(line);
                      const cleaned = line.replace(/^#{1,3}\s/, "").replace(/\*\*/g, "");

                      if (!line.trim()) return <br key={i} />;
                      if (isHeader)
                        return (
                          <h3 key={i} className="mb-2 mt-4 text-sm font-semibold text-foreground">
                            {cleaned}
                          </h3>
                        );
                      if (isBold)
                        return (
                          <p key={i} className="mb-2 text-sm leading-relaxed">
                            <strong className="text-foreground font-medium">{cleaned}</strong>
                          </p>
                        );
                      return (
                        <p key={i} className="mb-2 text-sm leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
