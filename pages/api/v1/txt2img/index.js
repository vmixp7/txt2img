import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const ENV  = process.env.NODE_ENV;
let API_HOST = process.env.API_HOST;

async function getHistory(prompt_id, retryCount = 0, maxRetries = 5) {
    try {
        const resp = await fetch(`${API_HOST}/history/${prompt_id}`);
        let datas = await resp.json();
        console.log("getHistory1---------", datas);

        if (Object.keys(datas).length > 0) {
            return datas;
        }

        if (retryCount >= maxRetries) {
            throw new Error("Max retries reached");
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        return getHistory(prompt_id, retryCount + 1, maxRetries);
    } catch (error) {
        console.error("Error in getHistory:", error);
        throw error;
    }
}

export default async function handler(req, res) {

  // remnove null and undefined values
  req.body = Object.entries(req.body).reduce(
    (a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
    {}
  );

  if (ENV === 'production') {
    API_HOST = publicRuntimeConfig.prodApiHost
  } else {
    API_HOST = publicRuntimeConfig.devApiHost
  }

  // console.log(`-------------- ${req.body.email} ---------------`);
  // console.log('prompt:', req.body.prompt);
  // delete req.body.email;

  try {
    const headers = {
      "Content-Type": "application/json",
    }
    const response = await fetch(`${API_HOST}/prompt`, {
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
    console.log("prediction1---------", prediction);

    console.log(" --------- history start --------- ");
    const prediction2 = await getHistory(prediction.prompt_id);
    console.log("--------- history end --------- ", prediction2);

    // const prediction2 = await response2.json();

    const filename = prediction2[prediction.prompt_id].outputs["48"].images[0].filename;
    console.log("filename--", filename);

    const resjon = {
      url: `${API_HOST}/view?filename=${filename}`,
      filename: filename,
    }
    console.log("resjon---------", resjon);
    res.statusCode = 201;
    res.end(JSON.stringify(resjon));
  } catch (error) {
    console.log("error1---------", error);
    return res.status(500).json({ detail: "伺服器維護中,請稍後!" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
