import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  PlusSquare as PlusSquareIcon,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // PWA 安裝：Android/Chrome 用 beforeinstallprompt，iOS Safari 只能手動「加入主畫面」
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const ua = window.navigator.userAgent;
    setIsIOS(
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const canInstall = !isStandalone && (installPrompt || isIOS);

  const handleInstallClick = async () => {
    setMobileMenuOpen(false);
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const isActive = (path) => {
    return path === "/"
      ? router.pathname === path
      : router.pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/", label: "文生圖" },
    { href: "/img2video", label: "圖生影片", isNew: true },
    { href: "/about", label: "關於我們" },
    { href: "/terms", label: "使用條款" },
    { href: "/privacy", label: "隱私政策" },
  ];

  // 新功能標籤
  const NewBadge = () => (
    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none align-middle">
      NEW
    </span>
  );

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/">
              <a className="flex items-center text-xl font-bold text-gray-900 hover:text-blue-800">
                <img
                  src="/icons/icon-192.png"
                  alt=""
                  className="h-8 w-8 rounded-lg mr-2"
                />
                AI美女生成
              </a>
            </Link>
          </div>

          {/* 桌面版導航 */}
          <div className="hidden sm:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.href)
                    ? "bg-blue-800 text-white"
                    : "text-gray-700 hover:bg-blue-800 hover:text-white"
                    }`}
                >
                  {link.label}
                  {link.isNew && <NewBadge />}
                </a>
              </Link>
            ))}
            {canInstall && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-800 border border-blue-800 hover:bg-blue-800 hover:text-white transition-colors"
              >
                <DownloadIcon className="h-4 w-4 mr-1" />
                安裝 App
              </button>
            )}
          </div>

          {/* 移動端漢堡選單按鈕 */}
          <div className="flex items-center gap-2 sm:hidden">
            {canInstall && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-800 text-white hover:bg-blue-900"
              >
                <DownloadIcon className="h-4 w-4 mr-1" />
                安裝
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-800"
              aria-expanded="false"
            >
              <span className="sr-only">開啟選單</span>
              {mobileMenuOpen ? (
                <CloseIcon className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 移動端側邊欄選單 */}
      <div className="sm:hidden">
        {/* 背景遮罩 */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* 側邊欄 */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full">
            {/* 關閉按鈕 */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">選單</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-700 hover:text-white hover:bg-blue-800"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            {/* 選單項目 */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-2 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a
                      onClick={handleLinkClick}
                      className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${isActive(link.href)
                        ? "bg-blue-800 text-white"
                        : "text-gray-700 hover:bg-blue-800 hover:text-white"
                        }`}
                    >
                      {link.label}
                      {link.isNew && <NewBadge />}
                    </a>
                  </Link>
                ))}
                {canInstall && (
                  <button
                    onClick={handleInstallClick}
                    className="flex items-center w-full px-4 py-3 rounded-md text-base font-medium text-blue-800 hover:bg-blue-800 hover:text-white transition-colors"
                  >
                    <DownloadIcon className="h-5 w-5 mr-2" />
                    安裝到手機主畫面
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS 加入主畫面教學 */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <img
                src="/icons/icon-192.png"
                alt=""
                className="h-12 w-12 rounded-xl mr-3"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">安裝 AI美女生成</h3>
                <p className="text-sm text-gray-500">加入主畫面，像 App 一樣開啟</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-center">
                <span className="mr-2 font-bold">1.</span>
                點選 Safari 下方的
                <ShareIcon className="h-5 w-5 mx-1 text-blue-600" />
                「分享」按鈕
              </li>
              <li className="flex items-center">
                <span className="mr-2 font-bold">2.</span>
                選擇
                <PlusSquareIcon className="h-5 w-5 mx-1 text-gray-700" />
                「加入主畫面」
              </li>
              <li className="flex items-center">
                <span className="mr-2 font-bold">3.</span>
                點右上角「新增」即完成
              </li>
            </ol>
          </div>
        </div>
      )}
    </nav>
  );
}
