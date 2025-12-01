import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return router.pathname === path;
  };

  const navLinks = [
    { href: "/", label: "AI生成" },
    { href: "/about", label: "關於我們" },
    { href: "/blog", label: "Blog" },
    { href: "/terms", label: "使用條款" },
    { href: "/privacy", label: "隱私政策" },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/">
              <a className="flex items-center text-xl font-bold text-gray-900 hover:text-blue-600">
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
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                    }`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* 移動端漢堡選單按鈕 */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-100"
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
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                        }`}
                    >
                      {link.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
