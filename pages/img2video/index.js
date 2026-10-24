import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import "bootstrap/dist/css/bootstrap.css";
import {
  Upload as UploadIcon,
  X as RemoveIcon,
  LayoutGrid as TemplateIcon,
  XCircle as StartOverIcon,
  Film as FilmIcon,
} from "lucide-react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Container,
  Row,
  Col,
} from "reactstrap";
import Navbar from "components/navbar";
import { appMetaDescription } from "../index";

export const pageName = "圖生影片";
export const pageSubtitle = "上傳一張圖片,選擇模板或輸入描述,讓圖片動起來";

// 模板清單 (內容待補): image 為模板縮圖路徑, prompt 為套用後帶入的描述
const videoTemplates = [
  {
    id: "t1",
    label: "模板一",
    image: "/images/prompt_01.png",
    prompt:
      "女孩走上現代化的辦公樓梯。鏡頭從下往上低角度拍攝，隨著她一步步攀爬。最後，她轉過頭，回頭看向鏡頭，眼神中流露出一種微妙而誘人的魅力。影片採用電影級的燈光，逼真的肌膚和布料紋理，細節豐富，營造出優雅而性感的氛圍。",
  },
  {
    id: "t2",
    label: "模板二",
    image: "/images/prompt_02.png",
    prompt:
      "場景是都市的街道,路上有行人跟車子,女孩對著鏡頭微笑,然後轉頭以正常偏慢到中等的速度走路,全程持續走路，完全不停下來。鏡頭從後方跟隨拍攝，先是全身全景，清楚看見她優雅的步伐,然後鏡頭緩慢推進，逐漸聚焦到她圓潤臀部的特寫,自然光線，電影感運鏡，高細節，真實質感。",
  },
  {
    id: "t3",
    label: "模板三",
    image: "/images/prompt_03.png",
    prompt:
      "場景位於燈光明亮、寫實的現代便利商店飲料冷藏櫃前。\n一位年輕女生走到便利商店冷藏櫃前挑選飲料。她自然地彎下腰，伸手拿取最下層的一瓶飲料。以手機拍攝方式從她身後低角度拍攝，鏡頭快速靠近她屁股的下60公分仰角拍攝，特寫她圓潤豐滿柔軟的臀部。便利商店柔和的螢光燈照明，真實的皮膚質感，自然的身體動作，手持手機晃動感，高細節，寫實風格。",
  },
  { id: "t4", label: "模板四", image: null, prompt: "" },
  { id: "t5", label: "模板五", image: null, prompt: "" },
  { id: "t6", label: "模板六", image: null, prompt: "" },
];

// 每列 3 個, 與文生圖的人物選單相同版型
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

export default function Img2Video() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageKey, setImageKey] = useState(null);
  // 從文生圖結果帶過來的檔名 (?image=txt2img_xxx.png)
  const [sourceFilename, setSourceFilename] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const promptInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { image } = router.query;
    if (
      typeof image === "string" &&
      /^txt2img_[\w-]+\.(png|jpe?g|webp)$/.test(image)
    ) {
      setSourceFilename(image);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    // 換圖後需重新上傳
    setImageKey(null);
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (sourceFilename) {
      const params = new URLSearchParams({
        filename: sourceFilename,
        type: "output",
      });
      setImagePreview(`/api/v1/img2video/video?${params}`);
      return;
    }
    setImagePreview(null);
  }, [imageFile, sourceFilename]);

  const removeImage = () => {
    setImageFile(null);
    setSourceFilename(null);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setError("請上傳圖片檔案 (jpg / png / webp)");
      return;
    }
    setError(null);
    setSourceFilename(null);
    setImageFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: false,
  });

  const handleTemplate = (template) => {
    if (template === "custom") {
      setSelectedTemplate(null);
      setPrompt("");
      setTemplateOpen(false);
      setTimeout(() => promptInputRef.current?.focus(), 350);
      return;
    }
    setSelectedTemplate(template.id);
    setPrompt(template.prompt);
  };

  const startOver = () => {
    removeImage();
    setPrompt("");
    setSelectedTemplate(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !sourceFilename) {
      setError("請先上傳一張圖片");
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      let source;
      if (imageFile) {
        const key = imageKey || (await uploadImage(imageFile));
        setImageKey(key);
        source = { key };
      } else {
        source = { sourceFilename };
      }

      const res = await fetch("/api/v1/img2video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...source, prompt }),
      });
      const data = await res.json();
      if (res.status > 201) {
        throw new Error(data.detail || "影片生成失敗,請稍後再試");
      }
      router.push(`/img2video/result?id=${data.promptId}`);
    } catch (error) {
      console.log("img2video err---------", error);
      setError(error.message);
      setIsProcessing(false);
    }
  };

  // 取得 presigned URL 後直接上傳到 S3, 回傳 S3 key
  const uploadImage = async (file) => {
    const res = await fetch("/api/v1/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type }),
    });
    const data = await res.json();
    if (res.status > 201) {
      throw new Error(data.detail || "無法取得上傳網址");
    }

    const putRes = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error("圖片上傳失敗,請稍後再試");
    }
    return data.key;
  };

  const currentTemplate = videoTemplates.find((t) => t.id === selectedTemplate);

  return (
    <div>
      <Head>
        <title>{pageName}</title>
        <meta name="description" content={appMetaDescription} />
        <meta property="og:title" content={pageName} />
        <meta property="og:description" content={appMetaDescription} />
      </Head>

      <Navbar />

      <main className="max-w-[700px] mx-auto mt-8 px-4">
        <hgroup className="pt-8">
          <p className="text-center text-lg opacity-60 m-6">{pageSubtitle}</p>
        </hgroup>

        <form
          onSubmit={handleSubmit}
          className="container animate-in fade-in duration-700"
        >
          {/* 上傳圖片 */}
          {imagePreview ? (
            <div className="relative bg-gray-100 rounded-lg p-3">
              <img
                src={imagePreview}
                alt="上傳的圖片"
                className="mx-auto max-h-[480px] rounded-md object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={isProcessing}
                className="absolute top-5 right-5 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                aria-label="移除圖片"
              >
                <RemoveIcon className="h-5 w-5" />
              </button>
              <div
                {...getRootProps()}
                className="mt-3 text-center text-sm text-blue-800 cursor-pointer hover:underline"
              >
                <input {...getInputProps()} />
                更換圖片
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed cursor-pointer select-none transition-colors ${
                isDragActive
                  ? "border-blue-800 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-blue-800"
              }`}
            >
              <input {...getInputProps()} />
              <UploadIcon className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">
                {isDragActive ? "放開以上傳圖片" : "點擊或拖曳圖片到這裡上傳"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                支援 JPG / PNG / WEBP
              </p>
            </div>
          )}

          {/* 已選模板 */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-600">
              模板:{" "}
              <span className="font-semibold text-gray-900">
                {currentTemplate ? currentTemplate.label : "自訂"}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setTemplateOpen(true)}
              className="text-sm text-blue-800 font-semibold hover:underline"
            >
              選擇模板
            </button>
          </div>

          {/* Prompt */}
          <div className="flex mt-2">
            <textarea
              ref={promptInputRef}
              rows="4"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述影片中的動作或畫面,未輸入時預設:她轉頭微笑,頭髮隨風飄逸"
              className="block w-full flex-grow rounded-md"
              disabled={isProcessing}
            />
          </div>

          <div className="flex mt-3">
            <button
              className="bg-blue-800 hover:bg-blue-900 disabled:opacity-50 w-full text-white rounded-md text-2xl inline-flex items-center justify-center p-3"
              type="submit"
              disabled={isProcessing}
            >
              <FilmIcon className="h-6 w-6 mr-2" />
              {isProcessing ? "送出中..." : "生成影片"}
            </button>
          </div>

          {error && (
            <div className="mt-3 text-left">
              <p className="bold text-red-500">{error}</p>
            </div>
          )}

          <div style={{ height: "100px", width: "100%" }} />
        </form>

        {/* 模板選單 */}
        <Modal
          toggle={() => setTemplateOpen(!templateOpen)}
          isOpen={templateOpen}
        >
          <div className="modal-header">
            <h5 className="modal-title">選擇模板</h5>
            <button
              aria-label="Close"
              className="close"
              type="button"
              onClick={() => setTemplateOpen(false)}
              style={{ fontSize: "2.5rem", lineHeight: "1" }}
            >
              <span aria-hidden={true}>×</span>
            </button>
          </div>
          <ModalBody>
            <button
              className="text-center mb-4 w-full rounded-md text-lg p-2 bg-blue-800 text-white font-bold hover:bg-blue-900 border-0 shadow-lg"
              onClick={() => handleTemplate("custom")}
            >
              ✨ 自訂 Prompt
            </button>
            <Container>
              {chunk(videoTemplates, 3).map((row, i) => (
                <Row key={i}>
                  {row.map((t) => (
                    <Col key={t.id}>
                      <div
                        className={
                          "lora_img " +
                          (selectedTemplate === t.id ? "opacity-100" : "")
                        }
                        aria-selected={selectedTemplate === t.id}
                        onClick={() => handleTemplate(t)}
                      >
                        {t.image ? (
                          <img
                            src={t.image}
                            alt={t.label}
                            className="w-full h-[150px] object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-[150px] rounded-md bg-gray-300 flex items-center justify-center">
                            <FilmIcon className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-center text-sm mt-1">{t.label}</p>
                    </Col>
                  ))}
                  {Array.from({ length: 3 - row.length }, (_, k) => (
                    <Col key={`empty-${k}`} />
                  ))}
                </Row>
              ))}
            </Container>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              type="button"
              onClick={() => setTemplateOpen(false)}
            >
              關閉
            </Button>
          </ModalFooter>
        </Modal>
      </main>

      <footer
        className="w-full"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "60px",
          backgroundColor: "#374151",
          color: "#ffffff",
          textAlign: "center",
          lineHeight: "60px",
          zIndex: 1000,
          margin: 0,
        }}
      >
        <div className="text-center bg-gray-700 text-white">
          <button
            className="lil-button text-white bg-transparent hover:bg-transparent"
            onClick={() => setTemplateOpen(true)}
          >
            <TemplateIcon className="icon" />
            模板
          </button>
          {(imagePreview || prompt) && (
            <button
              className="lil-button text-white bg-transparent hover:bg-transparent"
              onClick={startOver}
            >
              <StartOverIcon className="icon" />
              清除
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
