// Optional Gemini AI Service for Direct In-App Generation

export const generateGeminiContent = async (apiKey, prompt) => {
  if (!apiKey) {
    throw new Error('Masukkan Gemini API Key untuk menggunakan AI langsung, atau gunakan tombol Salin Prompt untuk ChatGPT/Claude.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal menghubungi Gemini API (${response.statusText})`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Tidak ada respon teks dari model Gemini.');
  }
  return text;
};

