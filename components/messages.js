import {
  Download as DownloadIcon,
  Film as FilmIcon,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/future/image";
import { Fragment, useEffect, useRef, useState } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import Message from "./message";

const formatElapsed = (sec) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

export default function Messages({ events, isProcessing, onUndo, downloadImage, makeVideo, onCancel }) {

  const messagesEndRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (events.length > 2) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events.length]);

  // 等待計時
  useEffect(() => {
    if (!isProcessing) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isProcessing]);

  return (
    <section className="container w-full">
      {events.map((ev, index) => {
        if (ev.image) {
          return (
            <Fragment key={"image-" + index}>
              <Message sender="replicate" shouldFillWidth>
                <Image
                  alt={
                    ev.prompt
                      ? `The result of the prompt "${ev.prompt}" on the previous image`
                      : "The source image"
                  }
                  width="512"
                  height="512"
                  priority={true}
                  className="w-full h-auto rounded-lg"
                  src={ev.image}
                />

                {onUndo && index >= 0 && (
                  <div className="mt-2 text-right">
                    {makeVideo && (
                      <button
                        className="lil-button"
                        onClick={() => {
                          makeVideo(ev.image);
                        }}
                      >
                        <FilmIcon className="icon" /> 影片
                      </button>
                    )}
                    <button
                      className="lil-button"
                      onClick={() => {
                        downloadImage(ev.image);
                      }}
                    >
                      <DownloadIcon className="icon" /> Download
                    </button>
                  </div>
                )}
              </Message>

              {/* {(isProcessing || index < events.length - 1) && (
                <Message sender="replicate" isSameSender>
                  {index === 0
                    ? "What should we change?"
                    : "What should we change now?"}
                </Message>
              )} */}
            </Fragment>
          );
        }

        if (ev.prompt) {
          return (
            <Message key={"prompt-" + index} sender="user">
              {ev.prompt}
            </Message>
          );
        }
      })}

      {isProcessing && (
        <div className="flex flex-col items-center justify-center min-h-[20rem] mt-6 rounded-lg bg-gray-100 text-center px-6 py-10">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-semibold text-gray-800">圖片生成中...</p>
          <p className="text-sm text-gray-500 mt-2">
            生成約需數十秒,離開此頁面將取消生成
          </p>
          <div className="mt-5">
            <PulseLoader color="#999" size={8} />
          </div>
          <p className="text-xs text-gray-400 mt-4">
            已等待 {formatElapsed(elapsed)}
          </p>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-6 px-6 py-2 rounded-md border-2 border-gray-400 text-gray-600 font-semibold hover:border-red-500 hover:text-red-500"
            >
              取消等待
            </button>
          )}
        </div>
      )}
      {isProcessing && (
        <div
          style={{
            height: "80px",
            width: "100%",
          }}
        />
      )}
      <div ref={messagesEndRef} />
    </section>
  );
}
