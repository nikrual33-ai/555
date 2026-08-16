"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BarChart3,
  Zap,
  Bot,
  History,
  Globe,
  Languages,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisForm } from "@/components/dashboard/analysis-form";
import { AnalysisResults } from "@/components/dashboard/analysis-results";
import {
  type BusinessAnalysis,
  type AnalysisHistoryItem,
  type LangStrings,
  ru,
  en,
} from "@/types/analysis";

export default function Home() {
  const [analysisData, setAnalysisData] = useState<BusinessAnalysis | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<LangStrings>(ru);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/analyze");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch {
      // silent
    }
    setLoadingHistory(false);
  }, []);

  const toggleLang = () => {
    setLang((prev) => (prev === ru ? en : ru));
  };

  const handleAnalysisComplete = (data: BusinessAnalysis) => {
    setAnalysisData(data);
    loadHistory();
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewHistory = (item: AnalysisHistoryItem) => {
    setAnalysisData(item.result);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-violet-500/[0.03] to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-bold">{lang.title}</h1>
              <p className="text-[11px] text-muted-foreground">
                {lang.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Language toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLang}
              className="hidden gap-1 text-xs sm:flex"
            >
              <Languages className="h-3.5 w-3.5" />
              {lang === ru ? "EN" : "RU"}
            </Button>
            {/* History toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(!historyOpen)}
              className="gap-1.5 text-xs"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lang.history}</span>
              {history.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 h-4 min-w-4 px-1 text-[10px]"
                >
                  {history.length}
                </Badge>
              )}
            </Button>
            {/* New analysis */}
            {analysisData && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewAnalysis}
                className="hidden gap-1.5 text-xs sm:flex"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                {lang.newAnalysis}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setHistoryOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-14 right-0 bottom-0 z-50 w-full max-w-sm border-l bg-background shadow-xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <History className="h-4 w-4 text-violet-500" />
                    {lang.history}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setHistoryOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="space-y-2 p-4">
                    {loadingHistory ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton
                            key={i}
                            className="h-16 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    ) : history.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        {lang.noHistory}
                      </p>
                    ) : (
                      history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleViewHistory(item)}
                          className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-sm font-bold text-violet-600">
                            {item.overallScore}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {item.businessName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.website || item.address}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          {!analysisData ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="space-y-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/30"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {lang.heroTitle1}{" "}
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {lang.heroTitleHighlight}
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mx-auto max-w-xl text-muted-foreground"
                >
                  {lang.heroDesc}
                </motion.p>
              </div>

              {/* Feature cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
                {lang.features.map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-col items-center gap-1.5 rounded-xl border bg-card/50 px-3 py-4 text-center"
                  >
                    <span className="text-2xl">{f.icon}</span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {f.label}
                    </span>
                  </div>
                ))}
              </motion.div>

              <Separator className="opacity-50" />

              {/* Form */}
              <AnalysisForm
                onAnalysisComplete={handleAnalysisComplete}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
                error={error}
                setError={setError}
                lang={lang}
              />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnalysisResults data={analysisData} lang={lang} />

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleNewAnalysis}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-purple-700"
                >
                  <Sparkles className="h-5 w-5" />
                  {lang.anotherBusiness}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <span>
            BizAnalyzer AI —{" "}
            {lang === ru
              ? "Маркетинговый дашборд"
              : "Marketing Dashboard"}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-3 w-3" />
              {lang === ru ? "English" : "Русский"}
            </button>
            <span className="flex items-center gap-1">
              Powered by <Zap className="h-3 w-3 text-violet-500" /> AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
