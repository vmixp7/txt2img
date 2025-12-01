import Head from "next/head";
import Link from "next/link";
import Navbar from "components/navbar";

import { appName } from "./index";

export default function About() {
  return (
    <div>
      <Head>
        <title>關於我們 - {appName}</title>
        <meta name="description" content="了解 AI美女生成的功能、優勢與我們的使命" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* 標題區 */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              關於 AI美女生成
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              用 AI 技術，讓每個人都能創造出屬於自己的完美圖像
            </p>
          </div>

          {/* 簡介區 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ❤️ 我們的使命
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              AI美女生成致力於讓 AI 圖片生成技術變得簡單易用。我們相信每個人都應該能夠輕鬆地將想像化為現實，無需專業技能或昂貴設備。
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              透過最先進的 FLUX 和 Stable Diffusion 技術，結合精心訓練的 LoRA 模型，我們提供高品質、快速且穩定的 AI 圖片生成服務。
            </p>
          </div>

          {/* 核心功能 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              核心功能
            </h2>
            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <div className="text-4xl mb-3">✨</div>
                  <h3 className="text-xl font-bold text-gray-900">智能文生圖</h3>
                </div>
                <p className="text-gray-700">
                  支援中英文輸入，自動翻譯優化。只需描述你的想法，AI 就能為你生成精美圖片。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="text-xl font-bold text-gray-900">多樣虛擬人物</h3>
                </div>
                <p className="text-gray-700">
                  提供 10+ 種精心訓練的虛擬人物模型，包括 Aya、IU、劉亦菲等，滿足不同風格需求。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-xl font-bold text-gray-900">快速咒語模板</h3>
                </div>
                <p className="text-gray-700">
                  內建 7+ 種專業級咒語模板，一鍵選擇即可生成高品質圖片，新手也能輕鬆上手。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <div className="text-4xl mb-3">🌐</div>
                  <h3 className="text-xl font-bold text-gray-900">多尺寸支援</h3>
                </div>
                <p className="text-gray-700">
                  支援直圖和橫圖兩種比例，適應不同使用場景，無論是社交媒體還是桌面背景。
                </p>
              </div>

            </div>
          </div>

          {/* 技術優勢 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">我們的優勢</h2>
            <div className="grid md:grid-cols-3 gap-8">

              <div className="text-center">
                <div className="text-5xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold mb-2">高品質輸出</h3>
                <p className="text-blue-100">
                  使用最新 FLUX 模型，生成細節豐富、質感逼真的高解析度圖片
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-2">快速生成</h3>
                <p className="text-blue-100">
                  優化的推理流程，通常 10-30 秒即可完成圖片生成
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-xl font-bold mb-2">簡單易用</h3>
                <p className="text-blue-100">
                  友善的中文界面，無需複雜設定，新手也能快速上手
                </p>
              </div>

            </div>
          </div>

          {/* 技術說明 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">技術架構</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">🤖 FLUX 模型</h3>
                <p className="leading-relaxed">
                  採用 FLUX-dev-fp8 模型，提供卓越的圖片生成品質和穩定性，支援複雜場景和細節呈現。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">🎨 LoRA 微調技術</h3>
                <p className="leading-relaxed">
                  每個虛擬人物都經過專業 LoRA 微調訓練，確保生成的圖片風格一致且特徵鮮明。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">🌐 智能翻譯</h3>
                <p className="leading-relaxed">
                  整合 Google Translation API，自動將中文描述轉換為優化的英文咒語，確保生成效果。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">⚡ 優化推理</h3>
                <p className="leading-relaxed">
                  使用 fp8 量化技術和優化的採樣器配置，在保持品質的同時大幅提升生成速度。
                </p>
              </div>
            </div>
          </div>

          {/* CTA 區域 */}
          <div className="text-center bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">開始創作你的 AI 美女</h2>
            <p className="text-xl mb-8 text-pink-100">
              現在就體驗最先進的 AI 圖片生成技術
            </p>
            <Link href="/">
              <a className="inline-block bg-white text-purple-600 font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                立即開始使用 →
              </a>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
