"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import GiftQuiz, { QuizData } from "./GiftQuiz";
import axios from "axios";

interface GiftFinderProps {
  onResults: (
    suggestions: string,
    products: any[],
    formData: QuizData,
    styleAnalysis?: any,
  ) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

const GiftFinder: React.FC<GiftFinderProps> = ({
  onResults,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const { t } = useTranslation();
  const [useQuizMode, setUseQuizMode] = useState(true);
  const [styleAnalysis, setStyleAnalysis] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [cosmicParticles, setCosmicParticles] = useState<
    Array<{
      id: number;
      left: number;
      top: number;
      delay: number;
      duration: number;
    }>
  >([]);

  // Generate cosmic particles only on client-side
  useEffect(() => {
    setIsMounted(true);
    setCosmicParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 8,
      })),
    );
  }, []);

  const loadingMessages = [
    "🔍 お客様の情報を分析中...",
    "🎯 AIが何千もの商品を検索中...",
    "💡 適合性を比較・評価中...",
    "✨個人の好みに合わせてカスタマイズ中...",
    "🎁 完了！素晴らしい結果を準備中...",
  ];

  const handleQuizComplete = async (quizData: QuizData) => {
    setIsLoading(true);
    setLoadingMessage(loadingMessages[0]);

    // Loading message animation
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex++;
      if (messageIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[messageIndex]);
      }
    }, 1200);

    try {
      let analysisResult = null;

      // Step 1: Analyze style image if provided
      if (quizData.styleImage) {
        setLoadingMessage("📸 画像を分析中...");

        const reader = new FileReader();
        const imageBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(quizData.styleImage!);
        });

        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
          const analysisResponse = await axios.post(
            `${apiUrl}/api/analyze_style`,
            { image: imageBase64 },
            { timeout: 30000 }, // 30 second timeout
          );
          analysisResult = analysisResponse.data;
          setStyleAnalysis(analysisResult);
        } catch (error: any) {
          console.error("Image analysis error:", error);
          // Set fallback analysis result
          analysisResult = {
            analysis:
              "画像分析中にエラーが発生しました。デフォルト設定で続行します。",
            style_data: {
              style: "モダン",
              colors: ["ブルー", "ホワイト"],
              interests: ["ファッション", "ライフスタイル"],
              age_range: "20-30代",
              gift_categories: [
                "アクセサリー",
                "ファッション小物",
                "ライフスタイルグッズ",
              ],
            },
          };
          setStyleAnalysis(analysisResult);
        }
      }

      // Step 2: Get AI suggestions
      const suggestParams = {
        age: quizData.age,
        gender: quizData.gender,
        relationship: quizData.relationship,
        hobby: quizData.hobby,
        budget: quizData.budget,
        occasion: quizData.occasion,
        ...(analysisResult && {
          style_analysis: JSON.stringify(analysisResult.style_data),
        }),
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await axios.get(`${apiUrl}/api/suggest`, {
        params: suggestParams,
      });

      clearInterval(messageInterval);
      setIsLoading(false);

      onResults(
        response.data.suggestions,
        response.data.products,
        quizData,
        analysisResult,
      );
    } catch (error) {
      clearInterval(messageInterval);
      setIsLoading(false);
      console.error("Error:", error);
      onResults(
        "提案の検索中にエラーが発生しました。もう一度お試しください！",
        [],
        quizData,
      );
    }
  };

  return (
    <div className="relative py-16">
      {/* Cosmic Glow Background */}
      <div className="absolute inset-0 cosmic-glow pointer-events-none z-0" />

      {/* Floating Cosmic Particles */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {cosmicParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-[#FFD700] rounded-full animate-float-cosmic opacity-40"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Mode Toggle - Glassmorphism */}
      <motion.div
        className="max-w-2xl mx-auto mb-8 flex justify-center relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card rounded-full p-1.5 inline-flex gap-2 shimmer">
          <button
            onClick={() => setUseQuizMode(true)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              useQuizMode
                ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#001f3f] shadow-md gold-glow"
                : "text-gray-300 hover:text-white"
            }`}
          >
            🎯 {t("giftFinder.quizMode")}
          </button>
          <button
            onClick={() => setUseQuizMode(false)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              !useQuizMode
                ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#001f3f] shadow-md gold-glow"
                : "text-gray-300 hover:text-white"
            }`}
          >
            📝 {t("giftFinder.formMode")}
          </button>
        </div>
      </motion.div>

      {useQuizMode ? (
        <GiftQuiz onComplete={handleQuizComplete} isLoading={isLoading} />
      ) : (
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <p className="text-gray-300 text-lg">
              {t("giftFinder.formModeComingSoon")}
            </p>
          </div>
        </motion.div>
      )}

      {styleAnalysis && !isLoading && (
        <motion.div
          className="max-w-2xl mx-auto mt-8 p-6 glass-card-strong rounded-2xl border-beam relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 gold-text-glow">
            <span className="text-2xl gold-glow">🎨</span>
            {t("giftFinder.styleAnalysis")}
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">{styleAnalysis.analysis}</p>
            {styleAnalysis.style_data && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {styleAnalysis.style_data.style && (
                  <div className="glass-card px-3 py-2 rounded-lg">
                    <span className="font-medium text-[#FFD700]">
                      スタイル:
                    </span>{" "}
                    <span className="text-gray-200">
                      {styleAnalysis.style_data.style}
                    </span>
                  </div>
                )}
                {styleAnalysis.style_data.age_range && (
                  <div className="glass-card px-3 py-2 rounded-lg">
                    <span className="font-medium text-[#FFD700]">年齢層:</span>{" "}
                    <span className="text-gray-200">
                      {styleAnalysis.style_data.age_range}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GiftFinder;
