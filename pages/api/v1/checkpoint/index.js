import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const ENV  = process.env.NODE_ENV;
let API_HOST = process.env.API_HOST;

export default async function handler(req, res) {

  // remnove null and undefined values

  if (req.body.sd_model_checkpoint === undefined) {
    const results = {
      sucess: false,
      msg: "params error"
    }
    return res.status(200).json(results);
  }

  const checkpointObj = {
    "chilloutmix": "chilloutmix_NiPrunedFp32Fix.safetensors [fc2511737a]",
    "majicmix": "majicmixRealistic_v4.safetensors [d819c8be6b]",
    "realdosmix": "realdosmix_.safetensors [0d27c62ffa]",
    "cartoon": "cartoonish_v1.safetensors [07f029f6d1]",
    "anything": "anything-v3-full.safetensors [abcaf14e5a]",
  }

  req.body.sd_model_checkpoint = checkpointObj[req.body.sd_model_checkpoint];

  if (ENV === 'production') {
    API_HOST = publicRuntimeConfig.prodApiHost
  } else {
    API_HOST = publicRuntimeConfig.devApiHost
  }

  console.log('ENV---------', ENV);
  console.log('API_HOST----', API_HOST);
  console.log('body--------', req.body);

  try {
    const headers = {
      "Content-Type": "application/json",
    }
    const response = await fetch(`${API_HOST}/sdapi/v1/options`, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body),
    });


    if (response.status > 201) {
      console.log("sdapi err---------", response.status);
      let error = await response.json();
      res.statusCode = response.status;
      res.end(JSON.stringify({ detail: error.detail }));
      return;
    }

    const prediction = await response.json();
    res.statusCode = 201;
    console.log("sdapi response---------", prediction);
    if (prediction === null) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.statusCode = 500;
    return res.json({ detail: "伺服器維護中,請稍後!" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
