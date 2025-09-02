
# Application Architecture & API Guide

## 1. High-Level Overview

This application is a React-based single-page application (SPA) designed to provide AI-powered image generation and manipulation services. It integrates with two distinct third-party AI services to offer its core features:

1.  **AI Bridal Portrait Generation**: Transforms a user's photo into a stylized bridal portrait. This is powered by **Google's Gemini API**.
2.  **AI Face Swap**: Swaps a face from a source image onto a target image. This is powered by **Segmind's Face Swap API**.

The frontend is built with React, TypeScript, and styled with Tailwind CSS. It communicates directly with the AI service APIs from the client-side.

### Data Flow Diagram

```
[User's Browser] --(Uploads Image)--> [React Frontend]
     |                                        /              \
     |                                       /                \
(Renders Result) <---- [Generated Image] -- /                  \
     ^                                     /                    \
     |                                    / (Portrait Gen)      \ (Face Swap)
     |                                   /                        \
[Google Gemini API] <------------------                           ------------------> [Segmind API]
('gemini-2.5-flash-image-preview')                                             ('faceswap-v2')

```

---

## 2. Frontend Architecture

-   **Framework**: React 19
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **API Client**: Native `fetch` API for REST calls, `@google/genai` SDK for Gemini.

The application's entry point is `index.tsx`, which mounts the main `App.tsx` component.

### Core Components

-   **`App.tsx`**: The main application component that manages state, handles user interactions, and orchestrates the calls to the AI services. It controls which view is displayed (Portrait Generation, Face Swap, or API Access).
-   **`services/geminiService.ts`**: A crucial module that abstracts the communication with the backend AI services. It contains two main classes, `GeminiProvider` and `SegmindProvider`, which handle the specific API requests for each service. It also includes helper functions for file-to-base64 conversion.
-   **`components/`**: This directory contains reusable UI components:
    -   `ImageUploader.tsx`: Handles file selection, previewing, and processing.
    -   `GeneratedImageDisplay.tsx`: Displays the final image with download and reset options.
    -   `ApiAccessDisplay.tsx`: Shows documentation and code snippets for developers.
    -   `CodeSnippet.tsx`: A reusable component for displaying formatted code with a copy button.
    -   `Header.tsx`, `Spinner.tsx`, `Icons.tsx`: General-purpose UI elements.

### State Management

State is managed locally within the `App.tsx` component using React Hooks (`useState`, `useCallback`, `useMemo`). This includes:
-   The selected provider (`GEMINI`, `SEGMIND`, `API`).
-   Source and target image files.
-   Loading and error states.
-   The URL of the generated image.

---

## 3. Backend Services & API Integration

The application does not have its own backend. It communicates directly with third-party AI services from the client.

### 3.1. Portrait Generation (Gemini)

-   **Service**: Google Gemini API
-   **Model**: `gemini-2.5-flash-image-preview`
-   **SDK**: `@google/genai`

The integration is handled in `services/geminiService.ts` inside the `GeminiProvider` class. The process is as follows:
1.  The user's uploaded image file is converted to a base64 string.
2.  An authenticated request is made to the Gemini API using `ai.models.generateContent`.
3.  The request payload includes the base64 image data and a detailed text prompt instructing the model to generate a bridal portrait.
4.  The `responseModalities` config is set to `[Modality.IMAGE, Modality.TEXT]` to ensure an image is returned.
5.  The response contains the generated image as a base64 string, which is then converted into a data URL for display in the browser.

### 3.2. Face Swap (Segmind)

-   **Service**: Segmind API
-   **Endpoint**: `https://api.segmind.com/v1/faceswap-v2`

The integration is handled in `services/geminiService.ts` inside the `SegmindProvider` class.
1.  Both the source and target image files are converted to base64 strings.
2.  A `POST` request is made to the Segmind API endpoint using the native `fetch` API.
3.  The request headers must include the `x-api-key` for authentication.
4.  The request body contains the base64-encoded images.
5.  The API responds with the generated image directly as an image blob (e.g., `image/jpeg`). This blob is converted to a data URL for display.

---

## 4. API Call Examples

Below are examples of how to call these services directly.

### 4.1. Gemini Portrait Generation (JavaScript)

This example uses the official `@google/genai` SDK. You will need an API key from Google AI Studio.

```javascript
import { GoogleGenAI, Modality } from "@google/genai";

// IMPORTANT: Use environment variables or a secure key management system in production.
// Get your API key from https://aistudio.google.com/app/apikey
const ai = new GoogleGenAI({ apiKey: "YOUR_GEMINI_API_KEY" });

async function generateBridalPortrait(userImageFile) {
  // Helper function to convert a File object to a base64 string
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    // Remove the data URL prefix
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const userImageBase64 = await fileToBase64(userImageFile);

  const prompt = `Take the woman from the provided image and Change her pose, 
her clothes to wedding dress and background to make it like a 
stunning wedding photograph.`;
  
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
    // Return a data URL to be used in an <img> src attribute
    return \`data:\${mimeType};base64,\${base64Image}\`;
  } else {
    console.error("API Response:", response);
    throw new Error("Image generation failed. No image data received.");
  }
}
```

### 4.2. Segmind Face Swap (cURL)

This example uses `cURL` to call the Segmind REST API. You will need to get an API key from the Segmind platform. Remember to replace placeholder values.

```bash
# How to get base64 strings for your images:
# On macOS/Linux: base64 -i your_image.jpg | pbcopy

curl -X POST \\
  https://api.segmind.com/v1/faceswap-v2 \\
  -H 'x-api-key: YOUR_SEGMIND_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "source_img": "<base64_encoded_string_of_the_face_to_swap>",
    "target_img": "<base64_encoded_string_of_the_target_image>",
    "base64": false
  }' \\
  --output result.jpeg
```

This command will send the request and save the resulting image as `result.jpeg` in your current directory.
