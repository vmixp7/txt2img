import Dropzone from "components/dropzone";
import {
  Code as CodeIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  XCircle as StartOverIcon,
  Settings as SettingsIcon,
  LayoutGrid as TemplateIcon,
  History as HistoryIcon,
} from "lucide-react";
import Link from "next/link";

export default function Footer({ events, startOver, handleImageDropped, settingPrompt, settingPromptOpen, openHistory }) {

  return (
    <footer className="w-full"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60px',
        backgroundColor: '#374151',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: '60px',
        zIndex: 1000,
        margin: 0,
      }}
    >
      <div className="text-center bg-gray-700 text-white">

        <button className="lil-button text-white bg-transparent hover:bg-transparent" onClick={settingPrompt}>
          <SettingsIcon className="icon" />
          人物
        </button>

        <button className="lil-button text-white bg-transparent hover:bg-transparent" onClick={settingPromptOpen}>
          <TemplateIcon className="icon" />
          模板
        </button>

        <button className="lil-button text-white bg-transparent hover:bg-transparent" onClick={openHistory}>
          <HistoryIcon className="icon" />
          紀錄
        </button>

        {events.length > 1 && (
          <button className="lil-button text-white bg-transparent hover:bg-transparent" onClick={startOver}>
            <StartOverIcon className="icon" />
            清除
          </button>
        )}

      </div>
    </footer>
  );
}
