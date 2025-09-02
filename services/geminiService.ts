
import { GoogleGenAI, Modality } from "@google/genai";

// --- Helper Functions ---

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix (e.g., "data:image/jpeg;base64,"),
        // which needs to be removed for API payloads.
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
};


// --- Gemini Provider ---

class GeminiProvider {
  async generate(userImage: File): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const userPart = {
      inlineData: {
        data: await fileToBase64(userImage),
        mimeType: userImage.type,
      },
    };

    const prompt = `
Take the woman from the provided image and Change her pose, her clothes to wedding dress and background to make it like a stunning wedding photograph.

**Instructions:**
1.  **Attire:** Change her current clothes into an elegant and beautiful wedding dress. The style should be classic and romantic.
2.  **Background:** Replace the original background completely with a picturesque and romantic wedding venue. This could be a blooming garden, a grand cathedral interior, or a scenic beachfront at sunset.
3.  **Style & Quality:** The final image must be a high-quality, realistic, and professional-looking photograph with soft, flattering lighting.
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    userPart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${base64ImageBytes}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            const safetyRating = response.candidates?.[0]?.safetyRatings?.find(rating => rating.blocked);
            if (safetyRating) {
                throw new Error(`Image generation blocked due to safety settings. Category: ${safetyRating.category}`);
            }
            if (textPart?.text) {
                 throw new Error(`API returned text instead of an image: ${textPart.text}`);
            }
            throw new Error("No image was generated. The API response did not contain image data.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate image. Please try again later.");
    }
  }
}

// --- Segmind Provider ---

class SegmindProvider {
  private readonly apiUrl = "https://api.segmind.com/v1/faceswap-v2";
  
  async generate(sourceImage: File, targetImage: File, apiKey: string): Promise<string> {
    if (!apiKey) {
      throw new Error("API key is not configured for the Segmind provider.");
    }

    const sourceImageBase64 = await fileToBase64(sourceImage);
    const targetImageBase64 = await fileToBase64(targetImage);

    const data = {
      "source_img": sourceImageBase64,
      "target_img": targetImageBase64,
      "input_faces_index": 0,
      "source_faces_index": 0,
      "face_restore": "codeformer-v0.1.0.pth",
      "base64": false
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorBody = 'Unknown error';
        try {
            // Try to parse as JSON, but fall back to text if it fails
            const errorJson = await response.json();
            errorBody = errorJson.message || JSON.stringify(errorJson);
        } catch {
            errorBody = await response.text();
        }
        console.error('Segmind API Error:', errorBody);
        throw new Error(`API request failed with status ${response.status}. Message: ${errorBody}`);
      }
      
      const imageBlob = await response.blob();
      if (imageBlob.type.startsWith('image/')) {
        return blobToDataUrl(imageBlob);
      } else {
        // The API might return a JSON error even with a 200 OK status.
        const errorText = await imageBlob.text();
        throw new Error(`API returned an unexpected response. Body: ${errorText}`);
      }

    } catch (error) {
      console.error("Error calling Segmind API:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate face-swapped image: ${error.message}`);
      }
      throw new Error("Failed to generate face-swapped image. Please try again later.");
    }
  }
}

// --- Service Factory and Dispatcher ---

const geminiProvider = new GeminiProvider();
const segmindProvider = new SegmindProvider();

type GenerateImageOptions = 
  | { provider: 'GEMINI'; userImage: File; }
  | { provider: 'SEGMIND'; sourceImage: File; targetImage: File; apiKey: string };

export const generateImage = (options: GenerateImageOptions): Promise<string> => {
  switch (options.provider) {
    case 'GEMINI':
      return geminiProvider.generate(options.userImage);
    case 'SEGMIND':
      return segmindProvider.generate(options.sourceImage, options.targetImage, options.apiKey);
    default:
      return Promise.reject(new Error('Invalid or unsupported provider selected.'));
  }
};
