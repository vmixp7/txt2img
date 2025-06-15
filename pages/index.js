import Image from "next/image";
// import Image from "next/future/image";
import loginIcon from "../public/login.png";
import Messages from "components/messages";
import PromptForm from "components/prompt-form";
import Head from "next/head";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.css';
import ReactGA from 'react-ga4';
import Script from 'next/script'
import { LogOut as LogoutIcon } from "lucide-react";

import Footer from "components/footer";

import prepareImageFileForUpload from "lib/prepare-image-file-for-upload";
import { getRandomSeed } from "lib/seeds";
import { Input, Button, Modal, ModalBody, ModalFooter, Container, Row, Col } from "reactstrap";
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const appName = "AI美女產生器";
export const appSubtitle = "輸入中文或英文描敘,用逗號分隔,創作一個自己的AI女友";
export const appMetaDescription = "AI, text2image, txt2img, word to image, art, stable diffustion, sexy girl, beautiful girl, ai girl, genetate, chinese, 中文, 中文文生圖, 文字產生圖片, 文字產生美女圖, AI美女, AI女友";

export default function Home(props) {

  const [events, setEvents] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [seed] = useState(getRandomSeed());
  const [initialPrompt, setInitialPrompt] = useState(seed.prompt);
  const [modalOpen, setModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);
  const [allow] = useState(false);
  const [dataLayer, setDataLayer] = useState([]);
  const [prevPromptTW, setPrevPromptTW] = useState("");
  const [prevPromptEN, setPrevPromptEN] = useState("");
  const [settingData, setSettingData] = useState({
    shape: "1",
    checkpointModel: "majicmixRealistic_v4",
    lora: "none",
  });
  const [selected, setSelected] = useState("none");
  const loraGirls = ['iu', 'crystal', 'jangwonyoung', 'zhouzhou', 'cute', 'nana', 'kevin', 'kitty']

  // set the initial image from a random seed
  useEffect(() => {
    // setEvents([{ image: seed.image }]);
    setEvents([]);
    ReactGA.initialize('G-H34DW6JEZ8');
    ReactGA.initialize('AW-11283751030');
    ReactGA.send("/");
    setDataLayer(dataLayer.push('js', new Date()))
  }, [seed.image]);

  const setAllowStatus = () => {
    allow = true;
    // setModalOpen(!modalOpen);
    setLoginOpen(!loginOpen);
  };

  const handlSelected = (val) => {
    setSelected(val);
    setSettingData(prevState => ({ ...prevState, lora: val }));
  };

  const base64ToBlob = (base64) => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  const handleImageDropped = async (image) => {
    try {
      image = await prepareImageFileForUpload(image);
    } catch (error) {
      setError(error.message);
      return;
    }
    setEvents(events.concat([{ image }]));
  };

  const settingPrompt = async (e) => {
    console.log('settingData--', settingData);
    setSettingOpen(!settingOpen);
  };

  const handleChange = async (e) => {
    console.log("pp");
    const { name, value } = e.target;
    setSettingData(prevState => ({ ...prevState, [name]: value }));
  };

  const setLora = async (e) => {
    console.log("e------", e);
  };

  function isEnglish(text) {
    console.log('text--', text);
    return /^[A-Za-z0-9\s.,!?'"():;\-]+$/.test(text)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!allow) {
    //   setModalOpen(!modalOpen);
    //   return;
    // }
    console.log('user---------', props);

    // if (props.user === null) {
    //   // setModalOpen(!modalOpen);
    //   setLoginOpen(!loginOpen);
    //   return;
    // }

    console.log('settingData--', settingData);

    let imgWidth = 512;
    let imgHeight = 768;
    if (settingData.shape === '2') {
      imgWidth = 768;
      imgHeight = 512;
    }

    let prompt = e.target.prompt.value;
    const lastImage = events.findLast((ev) => ev.image)?.image;

    setError(null);
    setIsProcessing(true);
    setInitialPrompt(prompt);

    try {

      const promptDefault = "(RAW photo, best quality),(realistic, photo-realistic:1),(high quality),(high detailed skin:0.5),(rim lighting:0.5),";

      if (prompt === '') {
        prompt = "1 girl, upper_body ,brown hair,puffy eyes,gorgeous hair,brown eyes,Front,detailed face, beautiful eyes, shirt,(kpop idoll),";
      } else {
        setPrevPromptTW(prompt);
        console.log('prevPromptTW-----------', prevPromptTW);
        console.log('isEnglish--', isEnglish(prompt));


          // google翻譯
          if (prompt !== prevPromptTW) {
            if (isEnglish(prompt)) {
              setPrevPromptEN(prompt);
            } else {
              console.log("----------------translate--------------");
              let fromLang = 'zh-tw';
              const toLang = 'en';
              const GOOGLE_API_KEY = publicRuntimeConfig.googleApiKey;
              let gturl = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;
              gturl += '&q=' + encodeURI(prompt);
              gturl += `&source=${fromLang}`;
              gturl += `&target=${toLang}`;

              const gtheaders = {
                "Content-Type": "application/json",
              }
              const gtres = await fetch(gturl, {
                method: "GET",
                gtheaders,
              });
              const transObj = await gtres.json();
              console.log("translate res--", transObj);
              if (gtres.status > 201 || transObj.data == undefined) {
                setIsProcessing(false);
                setError('翻譯失敗,請改用英文輸入');
                return;
              }
              prompt = transObj.data.translations[0].translatedText;
              setPrevPromptEN(prompt);
              console.log('prevPromptEN-----------', prevPromptEN);
            }
          } else {
            //咒語沒變用上一次
            console.log("-------------------prev-----------------");
            prompt = prevPromptEN;
          }
      }

      let myPrompt = promptDefault + prompt;
      if (settingData.lora !== 'none') {
        myPrompt += `,<lora:${settingData.lora}:0.8>`;
      }

      // make a copy so that the second call to setEvents here doesn't blow away the first. Why?
      const myEvents = [...events, { prompt }];
      setEvents(myEvents);

      // const body2 = {
      //   "width": imgWidth,
      //   "height": imgHeight,
      //   "n_iter": 1,
      //   "steps": 20,
      //   "cfg_scale": 8,
      //   "restore_faces": true,
      //   "prompt": myPrompt,
      //   "negative_prompt": "(worst quality:1.6), (low quality:1.6), (monochrome:1.6),nsfw, nude, nipple, pussy, penis, EasyNegative, bad-artist bad-image-v2-39000, bad_prompt_version2, ng_deepnegative_v1_75t, verybadimagenegative_v1.2-6400, vile_prompt3, bad-hands-5, painting, illustration"
      // };

      const min = 10000000000000;
      const max = 99999999999999;
      const seedNumber = Math.floor(Math.random() * (max - min + 1)) + min;

      console.log('prompt======', prompt)
      console.log('handleRandom======', seedNumber)

      const body = {
        "client_id": "533ef3a3-001",
        "prompt": {
          "3": {
            "inputs": {
              "seed": seedNumber,
              "steps": 25,
              "cfg": 1,
              "sampler_name": "euler",
              "scheduler": "ddim_uniform",
              "denoise": 1,
              "model": [
                "33",
                0
              ],
              "positive": [
                "50",
                0
              ],
              "negative": [
                "28",
                0
              ],
              "latent_image": [
                "5",
                0
              ]
            },
            "class_type": "KSampler",
            "_meta": {
              "title": "KSampler"
            }
          },
          "5": {
            "inputs": {
              "width":imgWidth,
              "height": imgHeight,
              "batch_size": 1
            },
            "class_type": "EmptyLatentImage",
            "_meta": {
              "title": "Empty Latent Image"
            }
          },
          "8": {
            "inputs": {
              "samples": [
                "3",
                0
              ],
              "vae": [
                "26",
                0
              ]
            },
            "class_type": "VAEDecode",
            "_meta": {
              "title": "VAE Decode"
            }
          },
          "24": {
            "inputs": {
              "unet_name": "flux1-dev-fp8.safetensors",
              "weight_dtype": "fp8_e4m3fn"
            },
            "class_type": "UNETLoader",
            "_meta": {
              "title": "Load Diffusion Model"
            }
          },
          "25": {
            "inputs": {
              "clip_name1": "t5xxl_fp8_e4m3fn.safetensors",
              "clip_name2": "clip_l.safetensors",
              "type": "flux"
            },
            "class_type": "DualCLIPLoader",
            "_meta": {
              "title": "DualCLIPLoader"
            }
          },
          "26": {
            "inputs": {
              "vae_name": "ae.safetensors"
            },
            "class_type": "VAELoader",
            "_meta": {
              "title": "Load VAE"
            }
          },
          "28": {
            "inputs": {
              "text": "",
              "clip": [
                "25",
                0
              ]
            },
            "class_type": "CLIPTextEncode",
            "_meta": {
              "title": "CLIP Text Encode (Prompt)"
            }
          },
          "32": {
            "inputs": {
              "lora_name": "detailed_notrigger.safetensors",
              "strength_model": 0.8,
              "strength_clip": 1,
              "model": [
                "24",
                0
              ],
              "clip": [
                "25",
                0
              ]
            },
            "class_type": "LoraLoader",
            "_meta": {
              "title": "Load LoRA"
            }
          },
          "33": {
            "inputs": {
              "lora_name": "lisa_rank4_bf16-step01280.safetensors",
              "strength_model": 0.85,
              "strength_clip": 1,
              "model": [
                "32",
                0
              ],
              "clip": [
                "32",
                1
              ]
            },
            "class_type": "LoraLoader",
            "_meta": {
              "title": "Load LoRA"
            }
          },
          "48": {
            "inputs": {
              "filename_prefix": "lisa",
              "images": [
                "8",
                0
              ]
            },
            "class_type": "SaveImage",
            "_meta": {
              "title": "Save Image"
            }
          },
          "50": {
            "inputs": {
              "clip_l": "8K, detailed, best quality, skinny, long legs, full body shot, 1girl, suit, high heels,",
              "t5xxl": prompt,
              "guidance": 3.5,
              "clip": [
                "33",
                1
              ]
            },
            "class_type": "CLIPTextEncodeFlux",
            "_meta": {
              "title": "CLIPTextEncodeFlux"
            }
          }
        }
      }

      const response = await fetch("/api/v1/txt2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const prediction = await response.json();
      console.log('prediction=====', prediction);
      // if (response.status > 201) {
      //   console.log('err1---------------', response);
      //   setError(prediction.detail);
      //   return;
      // }
      // if (prediction.images.length > 0) {
      //   console.log('succeeded--------------------');
      //   const base64Img = `data:image/png;base64,${prediction.images[0]}`;
        setEvents(
          myEvents.concat([
            // { image: prediction.output?.[prediction.output.length - 1] },
            { image: prediction.url },
          ])
        );
      // }
    } catch (error) {
      console.log("node server err---------", error);
      setIsProcessing(false);
      setError(error.message);
    }

    // while (
    //   prediction.status !== "succeeded" &&
    //   prediction.status !== "failed"
    // ) {
    //   await sleep(500);
    //   const response = await fetch("/api/v1/txt2img/" + prediction.id);
    //   prediction = await response.json();
    //   if (response.status !== 200) {
    //     console.log('err2--', prediction);
    //     setError(prediction.detail);
    //     return;
    //   }

    //   // just for bookkeeping
    //   setPredictions(predictions.concat([prediction]));

    //   if (prediction.status === "succeeded") {
    //     setEvents(
    //       myEvents.concat([
    //         { image: prediction.output?.[prediction.output.length - 1] },
    //       ])
    //     );
    //   }
    // }
    setIsProcessing(false);
  };

  const startOver = async (e) => {
    e.preventDefault();
    setEvents(events.slice(0, 0));
    setError(null);
    setIsProcessing(false);
    setInitialPrompt(seed.prompt);
  };

  return (
    <div>
      <Head>
        <title>{appName}</title>
        <meta name="description" content={appMetaDescription} />
        <meta property="og:title" content={appName} />
        <meta property="og:description" content={appMetaDescription} />
        <meta property="og:image" content="https://paintbytext.chat/opengraph.jpg" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-H34DW6JEZ8"></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-11283751030"></script>
        <script src="https://apis.google.com/js/platform.js?onload=renderButton" async defer></script>
      </Head>

      <main className="container max-w-[700px] mx-auto mt-14">
        <div className="flex justify-center bg-blue-800 w-full text-white absolute inset-x-0 top-0 h-12">
          {props.user ? (
            <>
              <span className="my-auto">{props.user.email}  | </span>
              <button className="ml-2" onClick={props.signOut}> <LogoutIcon className="icon" /></button>
            </>
          ) : (
            <span className="my-auto">Welcome to sexygirl.ai</span>
          )}
        </div>

        <hgroup className="pt-16">
          <h1 className="text-center text-4xl font-bold m-6">{appName}</h1>
          <p className="text-center text-lg opacity-60 m-6">
            {appSubtitle}
          </p>
        </hgroup>

        <Messages
          events={events}
          isProcessing={isProcessing}
          onUndo={(index) => {
            setInitialPrompt(events[index - 1].prompt);
            setEvents(
              events.slice(0, index - 1).concat(events.slice(index + 1))
            );
          }}
          downloadImage={(base64) => {
            const blob = base64ToBlob(base64);
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            const uuid = uuidv4().substr(0, 16);
            link.download = uuid + '.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
        />

        <PromptForm
          initialPrompt={initialPrompt}
          isFirstPrompt={events.length === 1}
          onSubmit={handleSubmit}
          disabled={isProcessing}
        />

        <Modal toggle={() => setModalOpen(!modalOpen)} isOpen={modalOpen}>
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              警告!
            </h5>
            <button
              aria-label="Close"
              className="close"
              type="button"
              onClick={() => setModalOpen(!modalOpen)}
            >
              <span aria-hidden={true}>×</span>
            </button>
          </div>
          <ModalBody>
            本頁面為限制級！AI圖像生成屬於隨機產生,可能含有裸體,限制級內容,未成年者請勿進入！
            請您務必確認您已年滿18歲、
            具有完全行為能力並且同意本網站之使用條款，
            才可以瀏覽使用本網站，否則謝絕進入。
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              type="button"
              onClick={() => setAllowStatus()}
            >
              我已滿18歲
            </Button>
            <Button
              color="primary"
              type="button"
              onClick={() => setModalOpen(!modalOpen)}
            >
              離開
            </Button>
          </ModalFooter>
        </Modal>

        <Modal toggle={() => setLoginOpen(!loginOpen)} isOpen={loginOpen}>
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Login
            </h5>
            <button
              aria-label="Close"
              className="close"
              type="button"
              onClick={() => setLoginOpen(!loginOpen)}
            >
              <span aria-hidden={true}>×</span>
            </button>
          </div>
          <ModalBody className="text-center">
            <Image
              className="cursor-pointer hover:opacity-50"
              onClick={props.signIn}
              src={loginIcon}
              width="300px"
              height="70px"
              layout="fixed"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              type="button"
              onClick={() => setLoginOpen(!loginOpen)}
            >
              離開
            </Button>
          </ModalFooter>
        </Modal>

        <Modal toggle={() => setSettingOpen(!settingOpen)} isOpen={settingOpen}>
          <div className="modal-header">
            <h5 className="modal-title" id="settingModalLabel">
              設定
            </h5>
            <button
              aria-label="Close"
              className="close"
              type="button"
              onClick={() => setSettingOpen(!settingOpen)}
            >
              <span aria-hidden={true}>×</span>
            </button>
          </div>
          <ModalBody>
            <div className="mt-4">
              <label className="block uppercase tracking-wide text-gray-700 font-bold mr-8" >
                形狀
              </label>
              <input
                type="radio"
                id="shape1"
                className="mr-2"
                name="shape"
                value="1"
                checked={settingData.shape === "1"}
                onChange={handleChange}
              />
              <label className="mr-8" htmlFor="shape1">
                直圖
              </label>
              <input
                type="radio"
                id="shape2"
                className="mr-2"
                name="shape"
                value="2"
                checked={settingData.shape === "2"}
                onChange={handleChange}
              />
              <label htmlFor="shape2">
                橫圖
              </label>
            </div>

            <div className="mt-4">
             <label className="block uppercase tracking-wide text-gray-700 font-bold mb-2" >
                虛擬人物
              </label>
              {/* <select
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                name="lora"
                onChange={handleChange}
              >
              <option value="" selected={settingData.lora === ""}>隨機</option>
              <option value="iu_V35" selected={settingData.lora === "iu_V35"}>IU</option>
              <option value="ldp" selected={settingData.lora === "ldp"}>Crystal</option>
              <option value="jangWonYoung_jwyV10" selected={settingData.lora === "jangWonYoung_jwyV10"}>Jang</option>
              <option value="zhouzhou_zsyV10" selected={settingData.lora === "zhouzhou_zsyV10"}>Zhou Zhou</option>
              <option value="cuteGirlMix4_v10" selected={settingData.lora === "cuteGirlMix4_v10"}>Cute</option>
              <option value="NanaDetroit" selected={settingData.lora === "NanaDetroit"}>Nana</option>
              <option value="KevinDetroit" selected={settingData.lora === "KevinDetroit"}>Kevin</option>
              <option value="KittyDetroit" selected={settingData.lora === "KittyDetroit"}>Kitty</option>
             </select> */}
             {/* <Img
              className="cursor-pointer"
              onClick={() => setLora("iu")}
              src={iu}
              />
              <span className="mr-8">iu_V35</span>
             <Img
              className="cursor-pointer"
              onClick={() => setLora("crystal")}
              src={iu}
              />
              <span className="mr-8">crystal</span> */}

              <Container>
                <Row>
                  <Col>
                    <Image
                      src="/images/none.png"
                      width="100%"
                      height={150}
                      className={
                        "lora_img " + (selected === "none" ? "opacity-100" : "")
                      }
                      aria-selected={selected === "none"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlSelected("none");
                      }}
                    />
                    <p className="text-center text-sm">None(隨機)</p>
                  </Col>
                  <Col>
                    <Image
                      src="/images/iu.png"
                      width="100%"
                      height={150}
                      className={
                        "lora_img " + (selected === "iu_V35" ? "opacity-100" : "")
                      }
                      aria-selected={selected === "iu_V35"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlSelected("iu_V35");
                      }}
                    />
                    <p className="text-center text-sm">IU</p>
                  </Col>
                  <Col>
                    <Image
                      src="/images/crystal.png"
                      width="100%"
                      height={150}
                      className={
                        "lora_img " + (selected === "ldp" ? "opacity-100" : "")
                      }
                      aria-selected={selected === "ldp"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlSelected("ldp");
                      }}
                    />
                    <p className="text-center text-sm">crystal</p>
                  </Col>
                </Row>
                <Row>
                   <Col>
                    <Image
                      src="/images/jangwonyoung.png"
                      width="100%"
                      height={150}
                      className={
                        "lora_img " + (selected === "jangWonYoung_jwyV10" ? "opacity-100" : "")
                      }
                      aria-selected={selected === "jangWonYoung_jwyV10"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlSelected("jangWonYoung_jwyV10");
                      }}
                    />
                    <p className="text-center text-sm">jang</p>
                  </Col>
                  <Col>
                    <Image
                      src="/images/zhouzhou.png"
                      width="100%"
                      height={150}
                      className={
                        "lora_img " + (selected === "zhouzhou_zsyV10" ? "opacity-100" : "")
                      }
                      aria-selected={selected === "zhouzhou_zsyV10"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlSelected("zhouzhou_zsyV10");
                      }}
                    />
                    <p className="text-center text-sm">zhouzhou</p>
                  </Col>
                  <Col>
                    <Image
                      src="/images/cute.png"
                      width="100%"
                      height={150}
                      className={
                        "lora_img " + (selected === "cuteGirlMix4_v10" ? "opacity-100" : "")
                      }
                      aria-selected={selected === "cuteGirlMix4_v10"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlSelected("cuteGirlMix4_v10");
                      }}
                    />
                    <p className="text-center text-sm">cute</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Image
                      src="/images/nana.png"
                      width="100%"
                      height={150}
                      className={
                        "lora_img " + (selected === "NanaDetroit" ? "opacity-100" : "")
                      }
                      aria-selected={selected === "NanaDetroit"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlSelected("NanaDetroit");
                      }}
                    />
                    <p className="text-center text-sm">nana</p>
                  </Col>
                  <Col>
                    <Image
                      src="/images/kevin.png"
                      width="100%"
                      height={150}
                      className={
                        "lora_img " + (selected === "KevinDetroit" ? "opacity-100" : "")
                      }
                      aria-selected={selected === "KevinDetroit"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlSelected("KevinDetroit");
                      }}
                    />
                    <p className="text-center text-sm">kevin</p>
                  </Col>
                  <Col>
                    <Image
                      src="/images/kitty.png"
                      width="100%"
                      height={150}
                      className={
                        "lora_img " + (selected === "KittyDetroit" ? "opacity-100" : "")
                      }
                      aria-selected={selected === "KittyDetroit"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlSelected("KittyDetroit");
                      }}
                    />
                    <p className="text-center text-sm">kitty</p>
                  </Col>
                </Row>
              </Container>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              type="button"
              onClick={() => setSettingOpen(!settingOpen)}
            >
              關閉
            </Button>
          </ModalFooter>
        </Modal>

        <div className="mx-auto w-full">
          {error && <p className="bold text-red-500 pb-5">{error}</p>}
        </div>

        <Footer
          events={events}
          startOver={startOver}
          handleImageDropped={handleImageDropped}
          settingPrompt={settingPrompt}
        />
      </main>
    </div>
  );
}
