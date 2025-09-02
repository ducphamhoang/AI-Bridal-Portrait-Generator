
import React from 'react';
import { CodeSnippet } from './CodeSnippet';

const segmindCurl = `curl -X POST \\
  https://api.segmind.com/v1/faceswap-v2 \\
  -H 'x-api-key: YOUR_SEGMIND_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "source_img": "<base64_encoded_source_image>",
    "target_img": "<base64_encoded_target_image>",
    "base64": false
  }' \\
  --output result.jpeg`;
  
const geminiJs = `import { GoogleGenAI, Modality } from "@google/genai";

// Get your API key from https://aistudio.google.com/app/apikey
const ai = new GoogleGenAI({ apiKey: "YOUR_GEMINI_API_KEY" });

async function generateBridalPortrait(userImageFile) {
  // Helper function to convert file to base64
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const userImageBase64 = await fileToBase64(userImageFile);

  const prompt = \`Take the woman from the provided image and Change her pose, 
her clothes to wedding dress and background to make it like a 
stunning wedding photograph.\`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        { inlineData: { data: userImageBase64, mimeType: userImageFile.type } },
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
  if (imagePart?.inlineData) {
    const base64Image = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;
    return \`data:\${mimeType};base64,\${base64Image}\`;
  } else {
    throw new Error("Image generation failed.");
  }
}
`;

export const ApiAccessDisplay: React.FC = () => {
  return (
    <div className="animate-fade-in text-left">
        <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Integrate Our AI Tools</h2>
            <p className="text-gray-500 mt-2">Use our underlying AI services in your own applications.</p>
        </div>

        <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Face Swap API (Segmind)</h3>
            <p className="text-gray-600 mb-4">
                This service swaps a face from a source image onto a target image. You'll need an API key from Segmind. The API returns the generated image file directly.
            </p>
            <CodeSnippet language="bash" code={segmindCurl} />
        </section>

        <section>
            <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Portrait Generation API (Gemini)</h3>
            <p className="text-gray-600 mb-4">
                This service transforms a user's photo into a bridal portrait using the Gemini model. This requires the Google GenAI SDK for JavaScript and an API key.
            </p>
            <CodeSnippet language="javascript" code={geminiJs} />
        </section>
    </div>
  );
};
