import { GoogleGenAI, Modality } from "@google/genai";

// --- Helper Functions ---

const bufferToBase64 = (buffer: Buffer): string => {
  return buffer.toString('base64');
};

const base64ToBuffer = (base64: string): Buffer => {
  return Buffer.from(base64, 'base64');
};

// Convert Express multer file to base64
const fileToBase64 = (file: Express.Multer.File): string => {
  return bufferToBase64(file.buffer);
};

// --- Gemini Provider ---

class GeminiProvider {
  async generate(userImageFile: Express.Multer.File): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY or API_KEY environment variable.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const userPart = {
      inlineData: {
        data: fileToBase64(userImageFile),
        mimeType: userImageFile.mimetype,
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
  
  async generate(sourceImageFile: Express.Multer.File, targetImageFile: Express.Multer.File): Promise<string> {
    const apiKey = process.env.SEGMIND_API_KEY;
    if (!apiKey) {
      throw new Error("Segmind API key is not configured. Please set SEGMIND_API_KEY environment variable.");
    }

    const sourceImageBase64 = fileToBase64(sourceImageFile);
    const targetImageBase64 = fileToBase64(targetImageFile);

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
            errorBody = (errorJson as any).message || JSON.stringify(errorJson);
        } catch {
            errorBody = await response.text();
        }
        console.error('Segmind API Error:', errorBody);
        throw new Error(`API request failed with status ${response.status}. Message: ${errorBody}`);
      }
      
      const imageBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);
      
      // Check if response is an image
      if (response.headers.get('content-type')?.startsWith('image/')) {
        const base64Image = bufferToBase64(buffer);
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        return `data:${mimeType};base64,${base64Image}`;
      } else {
        // The API might return a JSON error even with a 200 OK status.
        const errorText = buffer.toString('utf-8');
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
  | { provider: 'GEMINI'; userImage: Express.Multer.File; }
  | { provider: 'SEGMIND'; sourceImage: Express.Multer.File; targetImage: Express.Multer.File; };

export const generateImage = (options: GenerateImageOptions): Promise<string> => {
  switch (options.provider) {
    case 'GEMINI':
      return geminiProvider.generate(options.userImage);
    case 'SEGMIND':
      return segmindProvider.generate(options.sourceImage, options.targetImage);
    default:
      return Promise.reject(new Error('Invalid or unsupported provider selected.'));
  }
};