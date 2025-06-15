import { useEffect, useState } from "react";
import Message from "./message";

export default function PromptForm({
  initialPrompt,
  // isFirstPrompt,
  onSubmit,
  disabled = false,
}) {
  const [prompt, setPrompt] = useState();

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setPrompt(prompt);
    onSubmit(e);
  };

  if (disabled) {
    return;
  }

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in duration-700">
      {/* <Message sender="replicate" isSameSender> */}
        {/* <label htmlFor="prompt-input">
          {isFirstPrompt
            ? "What should we change?"
            : "What should we change now?"}
        </label> */}
      {/* </Message> */}

      <div className="flex mt-3">
        <textarea
          id="prompt-input"
          rows="2"
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="可輸入中文..."
          className={`block w-full flex-grow${
            disabled ? " rounded-md" : " rounded-l-md"
          }`}
          disabled={disabled}
        />
      </div>
      <div className="flex mt-3">
        {disabled || (
          <button
            className="bg-blue-800 w-full text-white rounded-l-md rounded-r-md text-2xl inline-block p-3 flex-none"
            type="submit"
          >
            start
          </button>
        )}
      </div>
    </form>
  );
}
