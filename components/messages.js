import { Download as DownloadIcon } from "lucide-react";
import Image from "next/future/image";
import { Fragment, useEffect, useRef } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import Message from "./message";

export default function Messages({ events, isProcessing, onUndo, downloadImage}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (events.length > 2) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events.length]);



  return (
    <section className="w-full">
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
        <Message sender="replicate">
          <PulseLoader color="#999" size={7} />
        </Message>
      )}

      <div ref={messagesEndRef} />
    </section>
  );
}
