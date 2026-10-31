import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import {
  Download as DownloadIcon,
  RotateCcw as RetryIcon,
  Film as FilmIcon,
} from "lucide-react";
import Navbar from "components/navbar";
import { pageName } from "./index";

const POLL_INTERVAL = 5000;

const formatElapsed = (sec) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

export default function Img2VideoResult() {
  const router = useRouter();
  const { id } = router.query;
  const [status, setStatus] = useState("loading");
  const [position, setPosition] = useState(null);
  const [queueRemaining, setQueueRemaining] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const cancelledRef = useRef(false);

  // 輪詢生成狀態
  useEffect(() => {
    if (!id) return;
    let stopped = false;
    let timer;

    const poll = async () => {
      try {
        const res = await fetch(`/api/v1/img2video/${id}`);
        const data = await res.json();
        if (stopped || cancelledRef.current) return;

        if (data.status === "done") {
          setVideoUrl(data.url);
          setStatus("done");
          return;
        }
        if (data.status === "error" || res.status > 201) {
          setError(data.detail || "影片生成失敗,請重新嘗試");
          setStatus("error");
          return;
        }
        setStatus(data.status);
        setPosition(data.position ?? null);
        setQueueRemaining(data.queueRemaining ?? null);
      } catch (e) {
        console.log("poll err---------", e);
      }
      timer = setTimeout(poll, POLL_INTERVAL);
    };

    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [id]);

  const isWaiting = !["done", "error", "cancelled"].includes(status);

  // 計時
  useEffect(() => {
    if (!isWaiting) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isWaiting]);

  const handleCancel = async () => {
    if (!window.confirm("確定要取消生成嗎?")) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/v1/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.status > 201) {
        throw new Error(data.detail || "取消失敗,請稍後再試");
      }
      cancelledRef.current = true;
      setStatus("cancelled");
      router.push("/img2video?again=1");
    } catch (e) {
      console.log("cancel err---------", e);
      setCancelError(e.message);
      setCancelling(false);
    }
  };

  // 等待中離開頁面就取消生成 (站內換頁, 關閉分頁, 重新整理)
  useEffect(() => {
    if (!id || !isWaiting) return;

    const cancelJob = () => {
      const body = new Blob([JSON.stringify({ id })], { type: "application/json" });
      navigator.sendBeacon("/api/v1/cancel", body);
    };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", cancelJob);
    router.events.on("routeChangeStart", cancelJob);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", cancelJob);
      router.events.off("routeChangeStart", cancelJob);
    };
  }, [id, isWaiting, router.events]);

  return (
    <div>
      <Head>
        <title>{`${pageName} - 生成結果`}</title>
      </Head>

      <Navbar />

      <main className="max-w-[700px] mx-auto mt-8 px-4">
        <hgroup className="pt-8">
          <p className="text-center text-lg opacity-60 m-6">生成結果</p>
        </hgroup>

        {isWaiting && (
          <div className="flex flex-col items-center justify-center min-h-[20rem] rounded-lg bg-gray-100 text-center px-6 py-10">
            <FilmIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-800">
              {status === "queued"
                ? `排隊中,前面還有 ${position} 位`
                : status === "running" || status === "pending"
                ? "影片生成中..."
                : "讀取中..."}
            </p>
            {status === "pending" && queueRemaining > 1 && (
              <p className="text-sm text-gray-600 mt-1">
                目前佇列中共有 {queueRemaining} 個任務
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              生成約需數分鐘,離開此頁面將取消生成
            </p>
            <div className="mt-5">
              <PulseLoader color="#999" size={8} />
            </div>
            <p className="text-xs text-gray-400 mt-4">
              已等待 {formatElapsed(elapsed)}
            </p>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling || !id}
              className="mt-6 px-6 py-2 rounded-md border-2 border-gray-400 text-gray-600 font-semibold hover:border-red-500 hover:text-red-500 disabled:opacity-50"
            >
              {cancelling ? "取消中..." : "取消等待"}
            </button>
            {cancelError && (
              <p className="text-sm text-red-500 mt-2">{cancelError}</p>
            )}
          </div>
        )}

        {status === "done" && videoUrl && (
          <div className="bg-gray-200 rounded-lg p-3">
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full max-h-[70vh] rounded-lg bg-black"
            />
            <div className="mt-2 text-right">
              <a className="lil-button" href={`${videoUrl}&download=1`}>
                <DownloadIcon className="icon" /> Download
              </a>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center h-64 rounded-lg bg-gray-100 text-center px-6">
            <p className="bold text-red-500 text-lg">{error}</p>
          </div>
        )}

        {!isWaiting && (
          <div className="flex mt-4">
            <Link href="/img2video?again=1">
              <a className="bg-blue-800 hover:bg-blue-900 w-full text-white rounded-md text-2xl inline-flex items-center justify-center p-3 hover:text-white no-underline">
                <RetryIcon className="h-6 w-6 mr-2" />
                {status === "error" ? "重新嘗試" : "再做一部"}
              </a>
            </Link>
          </div>
        )}

        <div style={{ height: "100px", width: "100%" }} />
      </main>
    </div>
  );
}
