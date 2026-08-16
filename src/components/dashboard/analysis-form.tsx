"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  MapPin,
  Navigation,
  Compass,
  Share2,
  MessageSquare,
  Sparkles,
  X,
  Loader2,
  Building2,
  Camera,
  Upload,
  Map,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BusinessAnalysis, LangStrings } from "@/types/analysis";
import type { LucideIcon } from "lucide-react";

interface AnalysisFormProps {
  onAnalysisComplete: (data: BusinessAnalysis) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
  error: string | null;
  setError: (v: string | null) => void;
  lang: LangStrings;
}

interface GeoService {
  key: string;
  name: string;
  icon: LucideIcon;
  enabled: boolean;
  url: string;
}

interface SocialItem {
  key: string;
  name: string;
  enabled: boolean;
  url: string;
}

const socialPlaceholders: Record<string, string> = {
  instagram: "instagram.com/...",
  telegram: "t.me/...",
  vk: "vk.com/...",
  facebook: "facebook.com/...",
  youtube: "youtube.com/...",
  tiktok: "tiktok.com/...",
};

interface PhotoPreview {
  file: File;
  preview: string;
  category: string;
}

export function AnalysisForm({
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing,
  error,
  setError,
  lang,
}: AnalysisFormProps) {
  const isEn = lang.subtitle === "Marketing AI Assistant";

  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [searchQueries, setSearchQueries] = useState("");
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState(0);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [geoServices, setGeoServices] = useState<GeoService[]>([
    { key: "googleMaps", name: "Google Maps", icon: MapPin, enabled: true, url: "" },
    { key: "2gis", name: "2GIS", icon: Navigation, enabled: false, url: "" },
    { key: "yandexMaps", name: isEn ? "Yandex Maps" : "Яндекс Карты", icon: Compass, enabled: false, url: "" },
  ]);

  const [socials, setSocials] = useState<SocialItem[]>([
    { key: "instagram", name: "Instagram", enabled: true, url: "" },
    { key: "telegram", name: "Telegram", enabled: false, url: "" },
    { key: "vk", name: "VK", enabled: false, url: "" },
    { key: "facebook", name: "Facebook", enabled: false, url: "" },
    { key: "youtube", name: "YouTube", enabled: false, url: "" },
    { key: "tiktok", name: "TikTok", enabled: false, url: "" },
  ]);

  const photoCategories = [
    lang?.facade || "Фасад",
    lang?.interior || "Интерьер",
    lang?.exterior || "Экстерьер",
  ];

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const newPhotos: PhotoPreview[] = [];
      let catIdx = 0;
      Array.from(files)
        .slice(0, 6)
        .forEach((file) => {
          const preview = URL.createObjectURL(file);
          newPhotos.push({
            file,
            preview,
            category: photoCategories[catIdx % 3] || photoCategories[0],
          });
          catIdx++;
        });
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 6));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [photoCategories]
  );

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updatePhotoCategory = (index: number, category: string) => {
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, category } : p))
    );
  };

  const toggleGeo = (key: string) => {
    setGeoServices((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const updateGeoUrl = (key: string, url: string) => {
    setGeoServices((prev) =>
      prev.map((s) => (s.key === key ? { ...s, url } : s))
    );
  };

  const toggleSocial = (key: string) => {
    setSocials((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const updateSocialUrl = (key: string, url: string) => {
    setSocials((prev) =>
      prev.map((s) => (s.key === key ? { ...s, url } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!website && !address) {
      setError(lang.errorRequired);
      return;
    }
    setIsAnalyzing(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("address", address);
      formData.append("website", website);
      formData.append("lang", isEn ? "en" : "ru");

      // Geo services — only send enabled ones
      geoServices.forEach((s) => {
        if (s.enabled && s.url.trim()) {
          const fieldName =
            s.key === "googleMaps"
              ? "geoGoogleMaps"
              : s.key === "2gis"
                ? "geo2gis"
                : "geoYandexMaps";
          formData.append(fieldName, s.url.trim());
        }
      });

      // Social links — only send enabled ones
      socials.forEach((s) => {
        if (s.enabled && s.url.trim()) {
          formData.append(`social_${s.key}`, s.url.trim());
        }
      });

      // Search queries
      if (searchQueries.trim()) {
        formData.append("searchQueries", searchQueries.trim());
      }

      formData.append("query", query);

      photos.forEach((p) => {
        formData.append(`photo_${p.category}`, p.file);
      });

      let response: Response;
      try {
        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } catch (fetchErr) {
        throw new Error(
          isEn
            ? "Network error: make sure the server is running (npm run dev)"
            : "Ошибка сети: убедитесь, что сервер запущен (npm run dev)"
        );
      }

      const text = await response.text();
      if (!text || text.startsWith("<") || text.startsWith("<!")) {
        throw new Error(
          isEn
            ? "Server error: the API endpoint returned HTML instead of JSON. Try restarting the dev server (npm run dev)."
            : "Ошибка сервера: API вернул HTML вместо JSON. Перезапустите сервер (npm run dev)."
        );
      }
      let data: { analysis?: BusinessAnalysis; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          isEn
            ? "Invalid response from server. Try again."
            : "Некорректный ответ сервера. Попробуйте снова."
        );
      }
      if (!response.ok) throw new Error(data.error || "Error");
      if (!data.analysis) throw new Error(isEn ? "No analysis data in response" : "Нет данных анализа в ответе");

      setProgress(100);
      clearInterval(progressInterval);
      setTimeout(() => {
        onAnalysisComplete(data.analysis);
        setIsAnalyzing(false);
      }, 500);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-dashed border-muted-foreground/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {isEn ? "Enter business data" : "Введите данные бизнеса"}
              </CardTitle>
              <CardDescription>
                {isEn
                  ? "AI agent will analyze and provide recommendations"
                  : "AI-агент проанализирует бизнес и выдаст рекомендации"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Address & Website */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {lang.address}
                </Label>
                <Input
                  id="address"
                  placeholder={
                    isEn
                      ? "New York, 5th Avenue"
                      : "Москва, ул. Тверская, 1"
                  }
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="website"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {lang.website} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required={!address}
                  className="h-11"
                />
              </div>
            </div>

            {/* Geo Services — 3 rows with checkboxes */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Map className="h-4 w-4 text-muted-foreground" />
                {isEn ? "Geo Services" : "Геосервисы"}
              </Label>
              <div className="space-y-2">
                {geoServices.map((service) => {
                  const IconComp = service.icon;
                  return (
                    <div
                      key={service.key}
                      className="flex items-center gap-3"
                    >
                      <Checkbox
                        checked={service.enabled}
                        onCheckedChange={() => toggleGeo(service.key)}
                        className="cursor-pointer"
                        aria-label={service.name}
                      />
                      <IconComp
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          service.enabled
                            ? "text-violet-500"
                            : "text-muted-foreground/50"
                        }`}
                      />
                      <Input
                        placeholder={
                          service.key === "googleMaps"
                            ? lang.googleMapsPlaceholder
                            : service.key === "2gis"
                              ? isEn
                                ? "2GIS link (e.g.: 2gis.ru/...)"
                                : "Ссылка на 2GIS (например: 2gis.ru/...)"
                              : isEn
                                ? "Yandex Maps link (e.g.: yandex.ru/maps/...)"
                                : "Ссылка на Яндекс Карты (например: yandex.ru/maps/...)"
                        }
                        value={service.url}
                        onChange={(e) =>
                          updateGeoUrl(service.key, e.target.value)
                        }
                        disabled={!service.enabled}
                        className={`h-10 transition-colors ${
                          !service.enabled
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social Media — 6 predefined rows with checkboxes */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                {lang.socials}
              </Label>
              <div className="space-y-2">
                {socials.map((social) => (
                  <div
                    key={social.key}
                    className="flex items-center gap-3"
                  >
                    <Checkbox
                      checked={social.enabled}
                      onCheckedChange={() => toggleSocial(social.key)}
                      className="cursor-pointer"
                      aria-label={social.name}
                    />
                    <span
                      className={`w-20 shrink-0 text-sm font-medium transition-colors ${
                        social.enabled
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {social.name}
                    </span>
                    <Input
                      placeholder={socialPlaceholders[social.key] || "URL..."}
                      value={social.url}
                      onChange={(e) =>
                        updateSocialUrl(social.key, e.target.value)
                      }
                      disabled={!social.enabled}
                      className={`h-10 transition-colors ${
                        !social.enabled
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Camera className="h-4 w-4 text-muted-foreground" />
                {lang.photos}
              </Label>
              <p className="text-xs text-muted-foreground">{lang.photosDesc}</p>
              <AnimatePresence>
                {photos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    {photos.map((photo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative overflow-hidden rounded-lg border"
                      >
                        <img
                          src={photo.preview}
                          alt={photo.category}
                          className="h-24 w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                          <select
                            value={photo.category}
                            onChange={(e) =>
                              updatePhotoCategory(index, e.target.value)
                            }
                            className="h-6 w-full rounded border-0 bg-white/90 text-[10px] font-medium text-foreground"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {photoCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {photos.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 border-dashed text-sm"
                >
                  <Upload className="h-4 w-4 text-violet-500" />
                  {lang.uploadPhotos}
                  <span className="text-muted-foreground">
                    ({photos.length}/6)
                  </span>
                </Button>
              )}
            </div>

            {/* Search Queries Analytics */}
            <div className="space-y-2">
              <Label
                htmlFor="searchQueries"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                {isEn
                  ? "🔍 Search Queries"
                  : "🔍 Поисковые запросы"}
              </Label>
              <Textarea
                id="searchQueries"
                placeholder={
                  isEn
                    ? "Enter search queries separated by commas or new lines, e.g.: \"furniture store in New York\", \"best coffee near me\", \"car repair Brooklyn\""
                    : "Введите поисковые запросы через запятую или с новой строки, например: \"стройка во Владимире\", \"купить диван в Твери\", \"автосервис Мытищи\""
                }
                value={searchQueries}
                onChange={(e) => setSearchQueries(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {isEn
                  ? "These queries will be used to analyze local search demand for your products or services"
                  : "Эти запросы будут использованы для анализа локального поискового спроса на ваши товары или услуги"}
              </p>
            </div>

            {/* Query textarea */}
            <div className="space-y-2">
              <Label
                htmlFor="query"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                {lang.queryLabel}
              </Label>
              <Textarea
                id="query"
                placeholder={lang.queryPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isAnalyzing}
              className="h-12 w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-base font-semibold shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-purple-700 disabled:opacity-70"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {lang.analyzing}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  {lang.analyze}
                </>
              )}
            </Button>

            {/* Progress bar with scan stages */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{lang.progressLabel}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lang.steps.map((step, i) => (
                      <motion.span
                        key={step}
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: progress > i * 20 ? 1 : 0.3,
                        }}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs"
                      >
                        {step}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
