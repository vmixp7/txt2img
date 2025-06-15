import Dropzone from "components/dropzone";
import {
  Code as CodeIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  XCircle as StartOverIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import Link from "next/link";

export default function Footer({ events, startOver, handleImageDropped, settingPrompt }) {

  return (
    <footer className="w-full my-3">
      <div className="text-center mt-4">
        <Link href="/about">
          <a className="lil-button">
            <InfoIcon className="icon" />
            使用條款
          </a>
        </Link>

        <Link href="/privacy">
          <a className="lil-button">
            <InfoIcon className="icon" />
            隱私聲明
          </a>
        </Link>

        <button className="lil-button" onClick={settingPrompt}>
          <SettingsIcon className="icon" />
          設定
        </button>

        {events.length > 1 && (
          <button className="lil-button" onClick={startOver}>
            <StartOverIcon className="icon" />
            清除
          </button>
        )}

      </div>

      <div className="text-center lil-text mt-3">
        Powered by{" "}
          <a target="_blank">sexygirl.ai</a>
      </div>
    </footer>
  );
}
