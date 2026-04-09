import axios from 'axios';

export async function checkVirusTotal(url, apiKey) {
  if (!apiKey) return { malicious: 0, suspicious: 0, harmless: 0, error: 'API Key missing' };

  try {
    // 1. Submit URL
    const submitRes = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      `url=${encodeURIComponent(url)}`,
      {
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    const analysisId = submitRes.data?.data?.id;
    if (!analysisId) throw new Error('No analysis ID returned');

    // 2. Fetch analysis (Wait a bit if needed, but normally serverless could be too fast)
    // We can just hit it once and hope it's ready, or we can retry.
    // VT usually has results ready quickly if the URL was seen before.
    const analysisRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: { 'x-apikey': apiKey },
        timeout: 10000
      }
    );

    const stats = analysisRes.data?.data?.attributes?.stats || {};
    return {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      error: null
    };

  } catch (error) {
    console.error("VirusTotal API Error:", error.response?.data || error.message);
    return { malicious: 0, suspicious: 0, harmless: 0, error: error.message };
  }
}
