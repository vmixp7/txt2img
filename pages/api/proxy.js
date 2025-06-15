export default async function handler(req, res) {
  const { url } = req.query;
  const response = await fetch(url);
  const blob = await response.blob();

  res.setHeader('Content-Type', response.headers.get('content-type'));
  blob.arrayBuffer().then(buffer => {
    res.send(Buffer.from(buffer));
  });
}
