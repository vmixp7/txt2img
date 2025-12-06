import Dropzone from "components/dropzone";
import {
  Code as CodeIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  XCircle as StartOverIcon,
  Settings as SettingsIcon,
  MinusSquare as IconSquareMenu,
} from "lucide-react";
import Link from "next/link";

export default function Footer({ events, startOver, handleImageDropped, settingPrompt, settingPromptOpen }) {

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

        <button className="lil-button text-white" onClick={settingPrompt}>
          <SettingsIcon className="icon" />
          人物
        </button>

        <button className="lil-button text-white" onClick={settingPromptOpen}>
          <IconSquareMenu className="icon" />
          Prompt
        </button>

        {events.length > 1 && (
          <button className="lil-button text-white" onClick={startOver}>
            <StartOverIcon className="icon" />
            清除
          </button>
        )}

      </div>
    </footer>
  );
}
