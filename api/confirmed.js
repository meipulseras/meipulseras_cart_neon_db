export default async function handler(req, res) {
    if(req.method !== 'POST') return res.status(200).end();

    return res.status(200).send("OK");
}