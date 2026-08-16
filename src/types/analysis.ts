export interface AnalysisItem {
  label: string;
  value: string;
  status: "good" | "warning" | "critical";
}

export interface AnalysisSection {
  title: string;
  icon: string;
  score: number;
  items: AnalysisItem[];
  recommendation: string;
}

export interface AudienceSegment {
  name: string;
  description: string;
  percentage: number;
}

export interface GeoReview {
  author: string;
  rating: number;
  text: string;
  date: string;
  source: string;
}

export interface GeoReviewsData {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { stars: number; count: number }[];
  recentReviews: GeoReview[];
  sentimentSummary: string;
  topComplaints: string[];
  topPraises: string[];
  placeUrl?: string;
  placeName?: string;
}

export interface SearchQueryData {
  queries: {
    query: string;
    estimatedVolume: string; // e.g. "1200-1800", "500-1000"
    competition: "low" | "medium" | "high";
    trend: "growing" | "stable" | "declining";
    cpc: string; // e.g. "15-30 ₽"
    recommendation: string;
  }[];
  summary: string;
  topOpportunities: string[];
}

export interface BusinessAnalysis {
  businessName: string;
  overallScore: number;
  summary: string;
  sections: AnalysisSection[];
  competitors: string[];
  topRecommendations: string[];
  targetAudience: {
    segments: AudienceSegment[];
  };
  visualAnalysis?: string;
  geoReviews?: GeoReviewsData;
  searchAnalytics?: SearchQueryData;
}

export interface AnalysisHistoryItem {
  id: string;
  businessName: string;
  address: string | null;
  website: string | null;
  overallScore: number;
  createdAt: string;
  result: BusinessAnalysis;
}

export interface AnalysisResponse {
  analysis: BusinessAnalysis;
  error?: string;
}

export interface LangStrings {
  title: string;
  subtitle: string;
  heroTitle1: string;
  heroTitleHighlight: string;
  heroDesc: string;
  address: string;
  website: string;
  googleMaps: string;
  googleMapsPlaceholder: string;
  socials: string;
  addSocial: string;
  queryLabel: string;
  queryPlaceholder: string;
  photos: string;
  photosDesc: string;
  uploadPhotos: string;
  facade: string;
  interior: string;
  exterior: string;
  analyze: string;
  analyzing: string;
  progressLabel: string;
  steps: string[];
  overall: string;
  diagnostics: string;
  diagnosticsDesc: string;
  audience: string;
  audienceDesc: string;
  detailed: string;
  competitors: string;
  competitorsDesc: string;
  topRecs: string;
  topRecsDesc: string;
  recommendation: string;
  visualAnalysis: string;
  newAnalysis: string;
  anotherBusiness: string;
  exportPdf: string;
  history: string;
  noHistory: string;
  viewReport: string;
  features: { icon: string; label: string }[];
  errorRequired: string;
  scoreLabels: Record<string, string>;
  geoReviews: string;
  geoReviewsDesc: string;
  avgRating: string;
  totalReviews: string;
  sentiment: string;
  complaints: string;
  praises: string;
  recentReviews: string;
  viewOnMaps: string;
  growthPlan: string;
  growthPlanDesc: string;
  geoGoogleMaps: string;
  geo2gis: string;
  geoYandexMaps: string;
  geoGooglePlaceholder: string;
  geo2gisPlaceholder: string;
  geoYandexPlaceholder: string;
  socialInstagram: string;
  socialTelegram: string;
  socialVk: string;
  socialFacebook: string;
  socialYoutube: string;
  socialTiktok: string;
  searchQueries: string;
  searchQueriesPlaceholder: string;
  searchAnalytics: string;
  searchAnalyticsDesc: string;
  estimatedVolume: string;
  competition: string;
  trend: string;
  topOpportunities: string;
}

export const ru: LangStrings = {
  title: "BizAnalyzer AI",
  subtitle: "Маркетинговый AI-ассистент",
  heroTitle1: "Анализ бизнеса за",
  heroTitleHighlight: "60 секунд",
  heroDesc: "Введите данные о бизнесе — AI-агент соберёт информацию, проведёт аудит и выдаст персональные рекомендации по росту",
  address: "Адрес бизнеса",
  website: "Сайт",
  googleMaps: "Google Maps / 2GIS",
  googleMapsPlaceholder: "Ссылка на Google Maps или 2GIS (например: maps.google.com/...)",
  socials: "Социальные сети",
  addSocial: "Добавить соцсеть",
  queryLabel: "Что нужно проанализировать?",
  queryPlaceholder: "Например: проанализируй целевую аудиторию, найди слабые места в маркетинге, предложи стратегию продвижения...",
  photos: "Фото бизнеса",
  photosDesc: "Прикрепите фото для анализа фасада, интерьера и экстерьера",
  uploadPhotos: "Загрузить фото",
  facade: "Фасад",
  interior: "Интерьер",
  exterior: "Экстерьер",
  analyze: "Запустить AI-анализ",
  analyzing: "Анализируем бизнес...",
  progressLabel: "Сканирование и анализ...",
  steps: ["Сбор данных", "Анализ сайта", "Проверка соцсетей", "Отзывы на картах", "Оценка бренда", "Формирование отчёта"],
  overall: "Общий балл",
  diagnostics: "Диагностика по направлениям",
  diagnosticsDesc: "Оценка по 5 ключевым метрикам маркетинга",
  audience: "Целевая аудитория",
  audienceDesc: "Сегменты аудитории бизнеса",
  detailed: "Детальный анализ",
  competitors: "Конкуренты",
  competitorsDesc: "Основные конкуренты в вашей нише",
  topRecs: "Топ-рекомендации",
  topRecsDesc: "Приоритетные действия для роста бизнеса",
  recommendation: "Рекомендация",
  visualAnalysis: "Визуальный анализ фото",
  newAnalysis: "Новый анализ",
  anotherBusiness: "Проанализировать другой бизнес",
  exportPdf: "Экспорт PDF",
  history: "История",
  noHistory: "Нет предыдущих анализов",
  viewReport: "Открыть отчёт",
  features: [
    { icon: "🌐", label: "Аудит сайта" },
    { icon: "📱", label: "Анализ соцсетей" },
    { icon: "⭐", label: "Отзывы на картах" },
    { icon: "🎯", label: "Целевая аудитория" },
    { icon: "📸", label: "Фото-анализ" },
  ],
  errorRequired: "Укажите хотя бы адрес или ссылку на сайт",
  scoreLabels: { excellent: "Отлично", good: "Хорошо", average: "Средне", weak: "Слабо", critical: "Критично" },
  geoReviews: "Отзывы на геосервисах",
  geoReviewsDesc: "Анализ отзывов с Google Maps и других геоплатформ",
  avgRating: "Средний рейтинг",
  totalReviews: "Всего отзывов",
  sentiment: "Настроение отзывов",
  complaints: "Основные жалобы",
  praises: "Основные похвалы",
  recentReviews: "Последние отзывы",
  viewOnMaps: "Открыть на картах",
  growthPlan: "План роста",
  growthPlanDesc: "Развернутая стратегия развития бизнеса с конкретными шагами и действиями",
  geoGoogleMaps: "Google Maps",
  geo2gis: "2GIS",
  geoYandexMaps: "Яндекс Карты",
  geoGooglePlaceholder: "maps.google.com/...",
  geo2gisPlaceholder: "2gis.ru/...",
  geoYandexPlaceholder: "yandex.ru/maps/...",
  socialInstagram: "Instagram",
  socialTelegram: "Telegram",
  socialVk: "VK",
  socialFacebook: "Facebook",
  socialYoutube: "YouTube",
  socialTiktok: "TikTok",
  searchQueries: "Поисковые запросы",
  searchQueriesPlaceholder: "Введите запросы через запятую или с новой строки (например: стройка во Владимире, ремонт квартир, купить диван в Твери)",
  searchAnalytics: "Аналитика поисковых запросов",
  searchAnalyticsDesc: "Оценка спроса и конкуренции по ключевым запросам в вашем регионе",
  estimatedVolume: "Оценочный объём",
  competition: "Конкуренция",
  trend: "Тренд",
  topOpportunities: "Лучшие возможности",
};

export const en: LangStrings = {
  title: "BizAnalyzer AI",
  subtitle: "Marketing AI Assistant",
  heroTitle1: "Business analysis in",
  heroTitleHighlight: "60 seconds",
  heroDesc: "Enter business data — the AI agent will gather information, conduct an audit, and provide personalized growth recommendations",
  address: "Business address",
  website: "Website",
  googleMaps: "Google Maps / 2GIS",
  googleMapsPlaceholder: "Google Maps or 2GIS link (e.g.: maps.google.com/...)",
  socials: "Social media",
  addSocial: "Add social",
  queryLabel: "What to analyze?",
  queryPlaceholder: "e.g.: analyze target audience, find marketing weaknesses, suggest a promotion strategy...",
  photos: "Business photos",
  photosDesc: "Attach photos for facade, interior and exterior analysis",
  uploadPhotos: "Upload photos",
  facade: "Facade",
  interior: "Interior",
  exterior: "Exterior",
  analyze: "Launch AI analysis",
  analyzing: "Analyzing business...",
  progressLabel: "Scanning and analyzing...",
  steps: ["Data collection", "Website analysis", "Social media check", "Geo reviews", "Brand evaluation", "Report generation"],
  overall: "Overall score",
  diagnostics: "Diagnostics by area",
  diagnosticsDesc: "Rating across 5 key marketing metrics",
  audience: "Target audience",
  audienceDesc: "Business audience segments",
  detailed: "Detailed analysis",
  competitors: "Competitors",
  competitorsDesc: "Main competitors in your niche",
  topRecs: "Top recommendations",
  topRecsDesc: "Priority actions for business growth",
  recommendation: "Recommendation",
  visualAnalysis: "Photo visual analysis",
  newAnalysis: "New analysis",
  anotherBusiness: "Analyze another business",
  exportPdf: "Export PDF",
  history: "History",
  noHistory: "No previous analyses",
  viewReport: "View report",
  features: [
    { icon: "🌐", label: "Website audit" },
    { icon: "📱", label: "Social media" },
    { icon: "⭐", label: "Geo reviews" },
    { icon: "🎯", label: "Target audience" },
    { icon: "📸", label: "Photo analysis" },
  ],
  errorRequired: "Provide at least an address or website",
  scoreLabels: { excellent: "Excellent", good: "Good", average: "Average", weak: "Weak", critical: "Critical" },
  geoReviews: "Geo-service reviews",
  geoReviewsDesc: "Analysis of reviews from Google Maps and other geo platforms",
  avgRating: "Average rating",
  totalReviews: "Total reviews",
  sentiment: "Review sentiment",
  complaints: "Top complaints",
  praises: "Top praises",
  recentReviews: "Recent reviews",
  viewOnMaps: "View on maps",
  growthPlan: "Growth plan",
  growthPlanDesc: "Comprehensive business growth strategy with concrete steps and actions",
  geoGoogleMaps: "Google Maps",
  geo2gis: "2GIS",
  geoYandexMaps: "Yandex Maps",
  geoGooglePlaceholder: "maps.google.com/...",
  geo2gisPlaceholder: "2gis.ru/...",
  geoYandexPlaceholder: "yandex.ru/maps/...",
  socialInstagram: "Instagram",
  socialTelegram: "Telegram",
  socialVk: "VK",
  socialFacebook: "Facebook",
  socialYoutube: "YouTube",
  socialTiktok: "TikTok",
  searchQueries: "Search queries",
  searchQueriesPlaceholder: "Enter queries separated by commas or new lines (e.g.: construction Vladimir, buy sofa Tver)",
  searchAnalytics: "Search query analytics",
  searchAnalyticsDesc: "Demand and competition analysis for key queries in your region",
  estimatedVolume: "Est. volume",
  competition: "Competition",
  trend: "Trend",
  topOpportunities: "Top opportunities",
};
