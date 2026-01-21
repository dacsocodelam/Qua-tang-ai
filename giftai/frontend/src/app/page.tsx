"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import AboutUs from "../components/AboutUs";
import CardCreator from "../components/CardCreator";
import GiftFinder from "../components/GiftFinder";
import SchoolPride from "../components/SchoolPride";
import dynamic from "next/dynamic";

// Dynamically import 3D Blog Carousel to avoid SSR issues
const BlogCarousel3D = dynamic(() => import("../components/BlogCarousel3D"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-[#0a0a1a]">
      <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
    </div>
  ),
});
import "../i18n";

// Dynamically import AIMascot to avoid SSR issues
const AIMascot = dynamic(() => import("../components/AIMascot"), {
  ssr: false,
});

export default function Home() {
  const { ready } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [connectingParticles, setConnectingParticles] = useState<
    Array<{
      id: number;
      left: number;
      top: number;
      delay: number;
      duration: number;
    }>
  >([]);
  const [formData, setFormData] = useState({
    age: "",
    gender: "女性",
    relationship: "",
    hobby: "",
    budget: "",
    occasion: "",
  });
  const [suggestions, setSuggestions] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [typewriterText, setTypewriterText] = useState("");
  const [showThanks, setShowThanks] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showCardCreator, setShowCardCreator] = useState(false);

  // Premium Services states
  const [selectedServices, setSelectedServices] = useState({
    giftWrap: false,
    handwrittenCard: false,
    fastDelivery: false,
    scheduledDelivery: false,
    surpriseService: false,
  });
  const [customMessage, setCustomMessage] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [showServices, setShowServices] = useState(false);

  // オートスクロール用のRef
  const aiSuggestionsRef = useRef<HTMLDivElement>(null);

  // Generate connecting particles only on client-side
  useEffect(() => {
    setIsMounted(true);
    setConnectingParticles(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 12,
      })),
    );
  }, []);

  // Geminiからのテキストをフォーマットする関数
  const formatGeminiText = (text: string) => {
    if (!text) return "";

    return (
      text
        // 余分な**を削除し、太字テキストをフォーマット
        .replace(
          /\*\*([^*]+)\*\*/g,
          '<strong class="font-bold text-[#FFD700]">$1</strong>',
        )
        .replace(/\*([^*]+)\*/g, '<em class="italic text-slate-200">$1</em>')

        // Format headings
        .replace(
          /### (.+)/g,
          '<h3 class="text-xl font-bold text-white mt-6 mb-3 flex items-center"><span class="text-[#FFD700] mr-2">🎯</span>$1</h3>',
        )
        .replace(
          /## (.+)/g,
          '<h2 class="text-2xl font-bold text-white mt-8 mb-4 flex items-center"><span class="text-[#FFD700] mr-2">✨</span>$1</h2>',
        )

        // Convert URLs to clickable links (trước khi format list items)
        .replace(
          /(https?:\/\/[^\s<>\)\]]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline decoration-blue-400 hover:decoration-blue-600 transition-colors font-medium break-all">$1</a>',
        )

        // 美しいスタイリングでブレットポイントをフォーマット
        .replace(
          /^- (.+)/gm,
          '<li class="flex items-start mb-3"><span class="text-[#FFD700] mr-3 text-lg">•</span><span class="flex-1 text-slate-200">$1</span></li>',
        )
        .replace(
          /^• (.+)/gm,
          '<li class="flex items-start mb-3"><span class="text-[#FFD700] mr-3 text-lg">•</span><span class="flex-1 text-slate-200">$1</span></li>',
        )

        // 番号付きリストをフォーマット
        .replace(
          /^(\d+)\.\s*(.+)/gm,
          '<li class="flex items-start mb-3"><span class="bg-[#FFD700] text-[#020617] rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0 shadow-lg shadow-[#FFD700]/30">$1</span><span class="flex-1 pt-1 text-slate-200">$2</span></li>',
        )

        // Wrap lists
        .replace(/(<li[^>]*>.*?<\/li>)/g, function (match) {
          return match;
        })

        // Format paragraphs
        .split("\n\n")
        .map((paragraph) => {
          if (paragraph.includes("<li>")) {
            return '<ul class="space-y-2 my-6">' + paragraph + "</ul>";
          } else if (paragraph.includes("<h")) {
            return paragraph;
          } else if (paragraph.trim()) {
            return '<p class="mb-4 leading-relaxed">' + paragraph + "</p>";
          }
          return "";
        })
        .join("")

        // Clean up
        .replace(/<p[^>]*><\/p>/g, "")
        .replace(/\n/g, "<br/>")

        // Enhance emojis
        .replace(
          /(🎁|💝|✨|🌟|⭐|💎|🎯|💖|💍|👑|🎀|🌹|💐|🎊|🎉)/g,
          '<span class="text-2xl mr-1">$1</span>',
        )
        .replace(
          /(📱|💻|🎮|📚|👕|👗|💄|👜|⌚|🕶️)/g,
          '<span class="text-xl mr-1">$1</span>',
        )
    );
  };

  // サービス料金計算関数
  const calculateTotal = () => {
    return (
      (selectedServices.giftWrap ? 99 : 0) +
      (selectedServices.handwrittenCard ? 49 : 0) +
      (selectedServices.fastDelivery ? 79 : 0) +
      (selectedServices.scheduledDelivery ? 29 : 0) +
      (selectedServices.surpriseService ? 299 : 0)
    );
  };

  // 提案用のタイプライター効果
  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      setTypewriterText("");
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < suggestions.length) {
          setTypewriterText(suggestions.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 30); // Tốc độ typewriter - 30ms mỗi ký tự (nhanh hơn)

      return () => clearInterval(interval);
    }
  }, [suggestions]);

  // インタラクション用のハンドラー関数
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setShowThanks(true);
      setTimeout(() => setShowThanks(false), 3000); // Ẩn sau 3 giây
    }
  };

  const handleAwesome = () => {
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 3000); // Ẩn sau 3 giây
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return; // Prevent spam clicking

    setIsRegenerating(true);
    setShowThanks(false);
    setIsLiked(false);
    setSuggestions("");
    setTypewriterText("");
    setResults([]);

    // 再生成用の短いローディング効果
    setLoadingMessage("🔄 新しい提案を作成中...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await axios.get(`${apiUrl}/api/suggest`, {
        params: formData,
      });

      setIsRegenerating(false);
      setSuggestions(res.data.suggestions);
      setResults(res.data.products);
    } catch {
      setIsRegenerating(false);
      setError(
        "新しい提案の作成中にエラーが発生しました。もう一度お試しください！",
      );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestions);
    // 一時的な成功メッセージを表示
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 2000);
  };

  return (
    <>
      {/* Fixed 3D AI Mascot - Floats throughout entire page */}
      <AIMascot />

      {!ready ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      ) : (
        <>
          <Header />
          <main id="home" className="flex flex-col">
            {/* Hero Section */}
            <HeroSection />

            <div className="relative -mt-32">
              {/* Connecting Particles - Bridge between Hero and Quiz */}
              {isMounted && (
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ height: "200vh" }}
                >
                  {connectingParticles.map((particle) => (
                    <div
                      key={particle.id}
                      className="absolute w-1 h-1 bg-[#FFD700]/20 rounded-full animate-float-particles"
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
              {/* Main Content */}
              <div className="max-w-6xl mx-auto px-4 py-8 relative z-20">
                {/* Gift Finder with Quiz Mode */}
                <GiftFinder
                  onResults={(suggestions, products, formData) => {
                    setSuggestions(suggestions);
                    setResults(products);
                    setFormData({
                      age: formData.age,
                      gender: formData.gender,
                      relationship: formData.relationship,
                      hobby: formData.hobby,
                      budget: formData.budget,
                      occasion: formData.occasion,
                    });

                    // Scroll to results
                    setTimeout(() => {
                      if (aiSuggestionsRef.current) {
                        aiSuggestionsRef.current.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }, 500);
                  }}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  setLoadingMessage={setLoadingMessage}
                />

                {/* 美しいアニメーション付きローディング表示 */}
                {isLoading && (
                  <div
                    ref={aiSuggestionsRef}
                    className="max-w-2xl mx-auto mt-12 animate-flip-3d relative z-20"
                  >
                    <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-[#FFD700]/10 border border-white/10 text-center animate-pulsate relative overflow-hidden">
                      {/* Shimmer overlay */}
                      <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-50"></div>

                      {/* アニメーションコンテナ */}
                      <div className="relative mb-8 h-32 flex items-center justify-center z-10">
                        {/* 中央のギフトボックス - フローティングアニメーション */}
                        <div className="relative z-10">
                          <div
                            className="text-8xl animate-float-up-down"
                            suppressHydrationWarning
                          >
                            🎁
                          </div>
                        </div>

                        {/* 魔法のスパークル */}
                        <div className="absolute inset-0">
                          <div
                            className="absolute top-4 left-8 text-2xl animate-ping"
                            suppressHydrationWarning
                          >
                            ✨
                          </div>
                          <div
                            className="absolute top-8 right-12 text-xl animate-ping animate-rotate-in"
                            suppressHydrationWarning
                          >
                            💫
                          </div>
                          <div
                            className="absolute bottom-8 left-12 text-xl animate-ping animate-spin-slow"
                            suppressHydrationWarning
                          >
                            ⭐
                          </div>
                          <div
                            className="absolute bottom-4 right-8 text-2xl animate-ping animate-wiggle"
                            suppressHydrationWarning
                          >
                            🌟
                          </div>
                        </div>

                        {/* フローティングハート */}
                        <div
                          className="absolute top-2 left-1/4 text-lg animate-wave"
                          suppressHydrationWarning
                        >
                          💖
                        </div>
                        <div
                          className="absolute top-4 right-1/4 text-lg animate-wave"
                          suppressHydrationWarning
                        >
                          💝
                        </div>
                        <div
                          className="absolute bottom-2 left-1/3 text-lg animate-pulse"
                          suppressHydrationWarning
                        >
                          🎀
                        </div>
                      </div>

                      {/* 動的ローディングメッセージ */}
                      <h3 className="text-2xl font-bold text-white mb-4 animate-neon-glow relative z-10">
                        ✨ AIがあなたのために魔法をかけています！
                      </h3>
                      <p className="text-lg text-slate-200 mb-6 min-h-[28px] transition-all duration-500 animate-text-reveal relative z-10">
                        {loadingMessage}
                      </p>

                      {/* プログレスステップ */}
                      <div className="flex justify-center space-x-3 mb-8">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div
                            key={step}
                            className={`w-4 h-4 rounded-full transition-all duration-500 ${
                              loadingMessage.includes("分析") && step === 1
                                ? "bg-[#FFD700] animate-pulse scale-125"
                                : loadingMessage.includes("検索") && step === 2
                                  ? "bg-[#FFD700] animate-pulse scale-125"
                                  : loadingMessage.includes("比較") &&
                                      step === 3
                                    ? "bg-[#FFD700] animate-pulse scale-125"
                                    : loadingMessage.includes("カスタマイズ") &&
                                        step === 4
                                      ? "bg-[#FFD700] animate-pulse scale-125"
                                      : loadingMessage.includes("完了") &&
                                          step === 5
                                        ? "bg-[#FFD700] animate-pulse scale-125"
                                        : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* 豆知識 */}
                      <div className="bg-white/[0.05] backdrop-blur-md rounded-2xl p-6 text-sm text-slate-300 border border-white/10">
                        <p className="font-medium mb-2">
                          💡 <strong>ご存知ですか？</strong>
                        </p>
                        <p>
                          私たちのAIは
                          <span className="text-[#FFD700] font-bold">
                            10,000
                          </span>
                          以上の商品と
                          <span className="text-[#FFD700] font-bold">50+</span>
                          の心理的要因を分析して、あなたにぴったりのギフトを見つけます！
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* エラー表示 */}
                {error && (
                  <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-center">❌ {error}</p>
                  </div>
                )}

                {/* タイプライター効果付きAI提案表示 - 拡張デザイン */}
                {suggestions && (
                  <div
                    ref={!isLoading ? aiSuggestionsRef : undefined}
                    className="max-w-5xl mx-auto mt-12 relative animate-zoom-in z-20"
                  >
                    {/* 背景グロー効果 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/20 via-[#FFA500]/20 to-[#FFD700]/20 rounded-3xl blur-2xl animate-glow"></div>

                    <div className="relative bg-white/[0.03] backdrop-blur-xl p-1 rounded-3xl shadow-2xl shadow-[#FFD700]/20 border border-white/10">
                      {/* アニメーション付きヘッダー */}
                      <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 backdrop-blur-md p-6 rounded-t-3xl text-white relative overflow-hidden border-b border-[#FFD700]/30">
                        {/* アニメーションパーティクル背景 */}
                        <div className="absolute inset-0">
                          <div className="floating-particle absolute top-4 left-8 w-2 h-2 bg-[#FFD700] rounded-full animate-ping opacity-70"></div>
                          <div className="floating-particle absolute top-8 right-12 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                          <div className="floating-particle absolute bottom-6 left-1/4 w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-float-fast"></div>
                          <div className="floating-particle absolute bottom-4 right-1/3 w-1 h-1 bg-white rounded-full animate-ping"></div>
                          <div className="floating-particle absolute top-1/2 left-16 w-1 h-1 bg-[#FFD700] rounded-full animate-sparkle"></div>
                          <div className="floating-particle absolute top-3 right-20 w-1.5 h-1.5 bg-white rounded-full animate-sparkle"></div>
                        </div>

                        <div className="relative z-10 text-center">
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="relative animate-rotate-in">
                              <div className="text-3xl animate-float-slow">
                                🤖
                              </div>
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full animate-heartbeat"></div>
                            </div>
                            <h2 className="gradient-text text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent animate-scale-up">
                              AIエキスパートからの提案
                            </h2>
                            <div
                              className="text-3xl animate-wiggle"
                              suppressHydrationWarning
                            >
                              ✨
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-[#FFD700] animate-fade-in">
                            <span
                              className="animate-heartbeat"
                              suppressHydrationWarning
                            >
                              🧠
                            </span>
                            <span>心理学とデータサイエンスに基づく分析</span>
                            <span
                              className="animate-heartbeat"
                              suppressHydrationWarning
                            >
                              💡
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* グラデーションボーダー付きコンテンツエリア */}
                      <div className="bg-white/[0.02] backdrop-blur-md p-8 rounded-b-3xl">
                        {/* Status indicator */}
                        <div className="flex items-center gap-3 mb-6 p-4 bg-white/[0.05] backdrop-blur-md rounded-2xl border border-[#FFD700]/30 animate-slide-in-left">
                          <div className="relative">
                            <div className="w-4 h-4 bg-green-500 rounded-full animate-heartbeat"></div>
                            <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-30"></div>
                          </div>
                          <span className="text-[#FFD700] font-medium text-sm">
                            🎯
                            AIが分析し、あなたにぴったりのギフトを見つけました
                          </span>
                        </div>

                        {/* Chat-like design */}
                        <div className="space-y-4">
                          {/* AIアバターとコンテンツ */}
                          <div className="flex gap-4 animate-slide-in-right">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-lg animate-float-slow">
                                <span className="text-xl">🤖</span>
                              </div>
                            </div>

                            <div className="flex-1">
                              {/* Chat bubble */}
                              <div className="chat-bubble bg-white/[0.05] backdrop-blur-xl p-6 rounded-2xl rounded-tl-sm shadow-lg shadow-[#FFD700]/10 border border-white/10 relative">
                                {/* Speech bubble tail */}
                                <div className="absolute left-0 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white/10 -ml-2"></div>

                                <div className="relative">
                                  <div
                                    className="text-justify leading-relaxed text-slate-100 text-lg"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        formatGeminiText(typewriterText) +
                                        (typewriterText.length <
                                        suggestions.length
                                          ? '<span class="typewriter-cursor inline-block w-0.5 h-6 bg-[#FFD700] ml-1"></span>'
                                          : ""),
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Thank you message */}
                              {showThanks && (
                                <div className="mt-4 animate-fade-in">
                                  <div className="bg-white/[0.05] backdrop-blur-md p-4 rounded-2xl border border-[#FFD700]/30">
                                    <div className="flex items-center gap-3">
                                      <div className="text-2xl animate-bounce">
                                        🤖
                                      </div>
                                      <div>
                                        <p className="text-[#FFD700] font-medium">
                                          🙏 ありがとうございます！
                                        </p>
                                        <p className="text-slate-300 text-sm">
                                          あなたのフィードバックでAIがさらに賢くなります
                                          ✨
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 再生成用ローディングメッセージ */}
                              {isRegenerating && (
                                <div className="mt-4 animate-fade-in">
                                  <div className="bg-white/[0.05] backdrop-blur-md p-4 rounded-2xl border border-[#FFD700]/30">
                                    <div className="flex items-center gap-3">
                                      <div className="text-2xl animate-spin">
                                        🔄
                                      </div>
                                      <div>
                                        <p className="text-[#FFD700] font-medium">
                                          新しい提案を作成中...
                                        </p>
                                        <p className="text-slate-300 text-sm">
                                          {loadingMessage}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* タイムスタンプとアクション */}
                              <div className="flex items-center justify-between mt-3 px-2">
                                <div className="flex items-center gap-2 text-xs text-slate-400 animate-fade-in">
                                  <span className="animate-pulse">🕐</span>
                                  <span>完了</span>
                                  <span>•</span>
                                  <span className="text-green-600 font-medium">
                                    ✓ 確認済み
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={handleLike}
                                    className={`p-2 hover:bg-gray-100 rounded-full transition-all duration-300 group transform hover:scale-110 ${
                                      isLiked
                                        ? "bg-[#FFD700]/20 animate-bounce-in"
                                        : ""
                                    }`}
                                    title="この提案をいいね"
                                  >
                                    <span
                                      className={`transition-all duration-300 inline-block ${
                                        isLiked
                                          ? "text-[#FFD700] animate-heartbeat"
                                          : "text-gray-400 group-hover:text-[#FFD700]"
                                      }`}
                                    >
                                      👍
                                    </span>
                                  </button>
                                  <button
                                    onClick={handleRegenerate}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 group transform hover:scale-110"
                                    title="新しい提案を作成"
                                    disabled={isRegenerating}
                                  >
                                    <span
                                      className={`transition-all duration-300 inline-block ${
                                        isRegenerating
                                          ? "animate-spin text-blue-500"
                                          : "text-gray-400 group-hover:text-blue-500 group-hover:animate-wiggle"
                                      }`}
                                    >
                                      🔄
                                    </span>
                                  </button>
                                  <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 group transform hover:scale-110"
                                    title="提案をコピー"
                                  >
                                    <span className="text-gray-400 group-hover:text-green-500 transition-all duration-300 inline-block group-hover:animate-bounce-in">
                                      📋
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AI信頼度と統計 */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/5 to-[#FFD700]/10 rounded-2xl border border-[#FFD700]/20 animate-slide-in-left">
                          <div className="grid md:grid-cols-3 gap-4 text-center">
                            <div className="space-y-2 animate-fade-in">
                              <div className="text-2xl font-bold text-[#001f3f] animate-scale-up">
                                95%
                              </div>
                              <div className="text-sm text-gray-600">
                                AI精度
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] h-2 rounded-full w-[95%] animate-glow"></div>
                              </div>
                            </div>
                            <div className="space-y-2 animate-fade-in">
                              <div className="text-2xl font-bold text-[#001f3f] animate-scale-up">
                                {typewriterText.length > 0
                                  ? Math.min(
                                      100,
                                      Math.round(
                                        (typewriterText.length /
                                          suggestions.length) *
                                          100,
                                      ),
                                    )
                                  : 0}
                                %
                              </div>
                              <div className="text-sm text-gray-600">
                                分析完了
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      typewriterText.length > 0
                                        ? Math.min(
                                            100,
                                            Math.round(
                                              (typewriterText.length /
                                                suggestions.length) *
                                                100,
                                            ),
                                          )
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-2xl font-bold text-[#001f3f]">
                                4.9⭐
                              </div>
                              <div className="text-sm text-gray-600">
                                ユーザー評価
                              </div>
                              <div className="flex justify-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className="text-[#FFD700] animate-pulse"
                                    suppressHydrationWarning
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Call to action */}
                        {typewriterText.length === suggestions.length && (
                          <div className="mt-6 text-center animate-fade-in">
                            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-0.5 rounded-2xl">
                              <div className="bg-white p-4 rounded-2xl">
                                <p className="text-[#001f3f] font-medium mb-3">
                                  💡 この提案はいかがですか？
                                </p>
                                <div className="flex justify-center gap-3">
                                  <button
                                    onClick={handleAwesome}
                                    className="ai-button px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-lg"
                                  >
                                    😍 素晴らしい！
                                  </button>
                                  <button
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                    className={`ai-button px-6 py-2 rounded-xl font-medium shadow-lg ${
                                      isRegenerating
                                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#001f3f]"
                                    }`}
                                  >
                                    {isRegenerating
                                      ? "🔄 作成中..."
                                      : "🔄 他の提案"}
                                  </button>
                                  <button
                                    onClick={() => setShowCardCreator(true)}
                                    className="ai-button px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    🎴 カード作成
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Display */}
                {results.length > 0 && (
                  <div className="max-w-6xl mx-auto mt-12 relative z-20">
                    {/* Create Card CTA Banner */}
                    <div className="mb-8 bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-[#FFD700]/20 shadow-lg shadow-pink-500/10">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">🎴</span>
                          <div>
                            <h4 className="font-bold text-white text-lg">
                              デジタルカードを作成
                            </h4>
                            <p className="text-sm text-slate-300">
                              AIが素敵なメッセージを提案！QRコードで送れます
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowCardCreator(true)}
                          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          <span>✨</span>
                          カードを作成する
                        </button>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-center mb-8 text-white">
                      🛍️ AIおすすめ商品
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {results.map(
                        (
                          prod: {
                            name: string;
                            reason: string;
                            price?: string;
                            description?: string;
                            url?: string;
                          },
                          index: number,
                        ) => (
                          <div
                            key={index}
                            className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl shadow-lg shadow-[#FFD700]/10 hover:shadow-2xl hover:shadow-[#FFD700]/20 hover:scale-105 transition-all duration-300 border border-white/10 hover:border-[#FFD700]/50"
                          >
                            <div className="relative mb-4">
                              <img
                                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                                alt={prod.name}
                                className="w-full h-48 object-cover rounded-xl"
                              />
                              <div className="absolute top-3 right-3 bg-[#FFD700] text-[#001f3f] px-3 py-1 rounded-full text-sm font-bold">
                                AI推奨 ⭐
                              </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-white">
                              {prod.name}
                            </h3>
                            <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                              {prod.description}
                            </p>
                            <div className="flex justify-between items-center mb-4">
                              <p className="font-bold text-lg text-[#FFD700]">
                                💰 {prod.price?.toLocaleString()}円
                              </p>
                              <div className="bg-[#FFD700]/20 text-[#FFD700] px-2 py-1 rounded-full text-xs border border-[#FFD700]/30">
                                ✓ 適合
                              </div>
                            </div>
                            <a
                              href={prod.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#020617] font-bold py-3 rounded-xl text-center hover:shadow-xl hover:shadow-[#FFD700]/30 transition-all duration-300 transform hover:scale-105"
                            >
                              🛒 今すぐ購入
                            </a>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Premium Services Upgrade Button */}
                {results.length > 0 && !showServices && (
                  <div className="max-w-4xl mx-auto mt-8">
                    <div className="text-center">
                      <button
                        onClick={() => setShowServices(true)}
                        className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#001f3f] px-8 py-4 rounded-full font-bold text-lg hover:from-[#FFA500] hover:to-[#FF8C00] transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        🎁 ギフト体験をアップグレード
                      </button>
                    </div>
                  </div>
                )}

                {/* Premium Services Section */}
                {showServices && (
                  <div className="max-w-4xl mx-auto mt-8">
                    <div className="bg-gradient-to-br from-white to-[#FFD700]/10 rounded-3xl shadow-2xl border border-[#FFD700]/30 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-[#001f3f] to-[#003366] text-white p-6 text-center">
                        <h3 className="text-3xl font-bold mb-2">
                          ✨ プレミアムサービス
                        </h3>
                        <p className="text-blue-200">
                          ギフトを忘れられない思い出に
                        </p>
                      </div>

                      <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* 高級ギフトパッケージ */}
                          <div
                            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                              selectedServices.giftWrap
                                ? "border-[#FFD700] bg-[#FFD700]/10 shadow-lg scale-105"
                                : "border-gray-200 hover:border-[#FFD700]/50"
                            }`}
                            onClick={() =>
                              setSelectedServices((prev) => ({
                                ...prev,
                                giftWrap: !prev.giftWrap,
                              }))
                            }
                          >
                            <div className="flex items-start space-x-4">
                              <div className="text-4xl">🎁</div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-[#001f3f] mb-2">
                                  高級ギフトラッピング
                                </h4>
                                <p className="text-gray-600 mb-3">
                                  シルクリボンと専用デザインの高級ギフトボックス
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-[#FFD700]">
                                    99円
                                  </span>
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      selectedServices.giftWrap
                                        ? "bg-[#FFD700] border-[#FFD700]"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {selectedServices.giftWrap && (
                                      <span className="text-white text-sm">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 手書きカード */}
                          <div
                            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                              selectedServices.handwrittenCard
                                ? "border-[#FFD700] bg-[#FFD700]/10 shadow-lg scale-105"
                                : "border-gray-200 hover:border-[#FFD700]/50"
                            }`}
                            onClick={() =>
                              setSelectedServices((prev) => ({
                                ...prev,
                                handwrittenCard: !prev.handwrittenCard,
                              }))
                            }
                          >
                            <div className="flex items-start space-x-4">
                              <div className="text-4xl">💌</div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-[#001f3f] mb-2">
                                  手書きメッセージカード
                                </h4>
                                <p className="text-gray-600 mb-3">
                                  高級紙にカリグラフィーペンで手書きメッセージ
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-[#FFD700]">
                                    49円
                                  </span>
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      selectedServices.handwrittenCard
                                        ? "bg-[#FFD700] border-[#FFD700]"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {selectedServices.handwrittenCard && (
                                      <span className="text-white text-sm">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Giao hàng nhanh */}
                          <div
                            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                              selectedServices.fastDelivery
                                ? "border-[#FFD700] bg-[#FFD700]/10 shadow-lg scale-105"
                                : "border-gray-200 hover:border-[#FFD700]/50"
                            }`}
                            onClick={() =>
                              setSelectedServices((prev) => ({
                                ...prev,
                                fastDelivery: !prev.fastDelivery,
                              }))
                            }
                          >
                            <div className="flex items-start space-x-4">
                              <div className="text-4xl">🚀</div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-[#001f3f] mb-2">
                                  2時間速達配送
                                </h4>
                                <p className="text-gray-600 mb-3">
                                  都内2時間、郊外4時間で配送
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-[#FFD700]">
                                    79円
                                  </span>
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      selectedServices.fastDelivery
                                        ? "bg-[#FFD700] border-[#FFD700]"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {selectedServices.fastDelivery && (
                                      <span className="text-white text-sm">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 時間指定配送 */}
                          <div
                            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                              selectedServices.scheduledDelivery
                                ? "border-[#FFD700] bg-[#FFD700]/10 shadow-lg scale-105"
                                : "border-gray-200 hover:border-[#FFD700]/50"
                            }`}
                            onClick={() =>
                              setSelectedServices((prev) => ({
                                ...prev,
                                scheduledDelivery: !prev.scheduledDelivery,
                              }))
                            }
                          >
                            <div className="flex items-start space-x-4">
                              <div className="text-4xl">⏰</div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-[#001f3f] mb-2">
                                  時間指定配送
                                </h4>
                                <p className="text-gray-600 mb-3">
                                  完璧なサプライズのため配送時間を指定
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-[#FFD700]">
                                    29円
                                  </span>
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      selectedServices.scheduledDelivery
                                        ? "bg-[#FFD700] border-[#FFD700]"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {selectedServices.scheduledDelivery && (
                                      <span className="text-white text-sm">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* サプライズサービス */}
                        <div
                          className={`mt-6 border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                            selectedServices.surpriseService
                              ? "border-[#FFD700] bg-[#FFD700]/10 shadow-lg scale-105"
                              : "border-gray-200 hover:border-[#FFD700]/50"
                          }`}
                          onClick={() =>
                            setSelectedServices((prev) => ({
                              ...prev,
                              surpriseService: !prev.surpriseService,
                            }))
                          }
                        >
                          <div className="flex items-start space-x-4">
                            <div className="text-4xl">🎉</div>
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-[#001f3f] mb-2">
                                VIPサプライズサービス
                              </h4>
                              <p className="text-gray-600 mb-3">
                                会場装飾、生花、バルーン、完璧なロマンチックセットアップ
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-[#FFD700]">
                                  299円
                                </span>
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    selectedServices.surpriseService
                                      ? "bg-[#FFD700] border-[#FFD700]"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {selectedServices.surpriseService && (
                                    <span className="text-white text-sm">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Custom message input */}
                        {selectedServices.handwrittenCard && (
                          <div className="mt-6 p-6 bg-[#FFD700]/5 rounded-2xl border border-[#FFD700]/20">
                            <label className="block text-lg font-bold text-[#001f3f] mb-3">
                              💌 手書きカードの内容
                            </label>
                            <textarea
                              value={customMessage}
                              onChange={(e) => setCustomMessage(e.target.value)}
                              placeholder="カードに書くメッセージを入力してください（最大200文字）..."
                              className="w-full p-4 border-2 border-[#FFD700]/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
                              rows={4}
                              maxLength={200}
                            />
                            <div className="text-right text-sm text-gray-500 mt-2">
                              {customMessage.length}/200文字
                            </div>
                          </div>
                        )}

                        {/* Delivery time input */}
                        {selectedServices.scheduledDelivery && (
                          <div className="mt-6 p-6 bg-[#FFD700]/5 rounded-2xl border border-[#FFD700]/20">
                            <label className="block text-lg font-bold text-[#001f3f] mb-3">
                              ⏰ 配送時間を選択
                            </label>
                            <input
                              type="datetime-local"
                              value={deliveryTime}
                              onChange={(e) => setDeliveryTime(e.target.value)}
                              className="w-full p-4 border-2 border-[#FFD700]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
                              min={new Date(Date.now() + 2 * 60 * 60 * 1000)
                                .toISOString()
                                .slice(0, 16)}
                            />
                          </div>
                        )}

                        {/* 概要とチェックアウト */}
                        <div className="mt-8 bg-gradient-to-r from-[#001f3f] to-[#003366] rounded-2xl p-6 text-white">
                          <h4 className="text-xl font-bold mb-4">
                            📋 サービス概要
                          </h4>

                          <div className="space-y-2">
                            {selectedServices.giftWrap && (
                              <div className="flex justify-between">
                                <span>🎁 高級ギフトラッピング</span>
                                <span>99円</span>
                              </div>
                            )}
                            {selectedServices.handwrittenCard && (
                              <div className="flex justify-between">
                                <span>💌 手書きメッセージカード</span>
                                <span>49円</span>
                              </div>
                            )}
                            {selectedServices.fastDelivery && (
                              <div className="flex justify-between">
                                <span>🚀 2時間速達配送</span>
                                <span>79円</span>
                              </div>
                            )}
                            {selectedServices.scheduledDelivery && (
                              <div className="flex justify-between">
                                <span>⏰ 時間指定配送</span>
                                <span>29円</span>
                              </div>
                            )}
                            {selectedServices.surpriseService && (
                              <div className="flex justify-between">
                                <span>🎉 VIPサプライズサービス</span>
                                <span>299円</span>
                              </div>
                            )}
                          </div>

                          {Object.values(selectedServices).some(Boolean) && (
                            <>
                              <hr className="my-4 border-blue-400" />
                              <div className="flex justify-between text-xl font-bold">
                                <span>合計:</span>
                                <span className="text-[#FFD700]">
                                  {calculateTotal().toLocaleString()}円
                                </span>
                              </div>

                              <div className="mt-6 grid md:grid-cols-2 gap-4">
                                <button
                                  onClick={() => setShowServices(false)}
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
                                >
                                  ← 戻る
                                </button>
                                <button
                                  onClick={() =>
                                    alert(
                                      "決済機能は後日統合予定です！\n\n選択したサービス:\n" +
                                        Object.entries(selectedServices)
                                          .filter(([, selected]) => selected)
                                          .map(([service]) => {
                                            const serviceNames = {
                                              giftWrap:
                                                "🎁 高級ギフトラッピング (99円)",
                                              handwrittenCard:
                                                "💌 手書きメッセージカード (49円)",
                                              fastDelivery:
                                                "🚀 2時間速達配送 (79円)",
                                              scheduledDelivery:
                                                "⏰ 時間指定配送 (29円)",
                                              surpriseService:
                                                "🎉 VIPサプライズサービス (299円)",
                                            };
                                            return serviceNames[
                                              service as keyof typeof serviceNames
                                            ];
                                          })
                                          .join("\n") +
                                        "\n\n合計: " +
                                        calculateTotal().toLocaleString() +
                                        "円",
                                    )
                                  }
                                  className="bg-[#FFD700] hover:bg-[#FFA500] text-[#001f3f] px-6 py-3 rounded-full font-bold transition-colors"
                                >
                                  💳 今すぐ決済
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          <HowItWorks />
          <BlogCarousel3D />
          <AboutUs />
          <Footer />

          {/* School Pride Badge */}
          <SchoolPride />

          {/* Card Creator Modal */}
          <CardCreator
            isOpen={showCardCreator}
            onClose={() => setShowCardCreator(false)}
            relationship={formData.relationship}
            occasion={formData.occasion}
          />
        </>
      )}
    </>
  );
}
