"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    // Navigate to generate page with prompt and v0 direct mode
    const params = new URLSearchParams();
    params.append("prompt", prompt);
    params.append("model", "v0");
    params.append("v0mode", "direct");
    
    router.push(`/generate?${params.toString()}`);
  };

  const examplePrompts = [
    "高级牛排餐厅网站",
    "创意摄影作品集",
    "现代化健身应用",
    "豪华酒店预订平台",
    "时尚服装品牌官网",
    "淘宝风格的电商网站",
    "沉浸式旅行体验平台"
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-16 text-shadow-sm" style={{ fontFamily: "'Times New Roman', serif" }}>
              <span className="brand-gradient-text animate-gradient">创造梦想</span>
              <br />
              <span className="brand-gradient-text animate-gradient">超越极限</span>
            </h1>

            {/* Input Section */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <div className="absolute -inset-1 brand-gradient rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white rounded-3xl border border-gray-200 shadow-xl">
                  <div className="flex items-center p-2">
                    <textarea
                      placeholder="让卡卡为您创造..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                      className="flex-1 px-4 py-4 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-lg resize-none min-h-[120px] max-h-[200px] rounded-3xl"
                      style={{ fontFamily: "'Times New Roman', serif" }}
                      rows={3}
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim()}
                      className="flex-shrink-0 mr-2 p-3 brand-gradient hover:opacity-90 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group shadow-lg hover:shadow-xl btn-hover-effect"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Example Prompts */}
              <div className="mt-8">
                <div className="flex flex-wrap justify-center gap-3">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:border-purple-300 hover:brand-gradient-text transition-all duration-200 hover:shadow-md"
                      style={{ fontFamily: "'Times New Roman', serif" }}
                    >
                      {example.length > 15 ? example.substring(0, 15) + "..." : example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
