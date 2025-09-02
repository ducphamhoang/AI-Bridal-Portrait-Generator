# AI Bridal Portrait Generator API Documentation

## Overview

The AI Bridal Portrait Generator API provides external endpoints for generating bridal portraits and performing face swaps using advanced AI providers. This API acts as a gateway service, allowing external clients to access our AI-powered image generation capabilities without directly interacting with the underlying providers.

## Base URL

```
http://localhost:3001
```

## Authentication

Currently, no global authentication is required for the API endpoints. However:
- The Gemini endpoint uses server-side environment variables for authentication
- The Segmind endpoint requires clients to provide their own API key via headers

## Environment Variables

The following environment variables should be configured on the server:

```bash
# Required for Gemini endpoint
GEMINI_API_KEY=your_gemini_api_key_here
# Alternative environment variable name (for compatibility)
API_KEY=your_gemini_api_key_here

# Optional - custom port (defaults to 3001)
PORT=3001
```

## Endpoints

### Health Check

**GET** `/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-02T16:24:41.340Z"
}
```

### API Documentation

**GET** `/api/docs`

Get complete API documentation in JSON format.

### Bridal Portrait Generation

**POST** `/api/generate/gemini`

Generate a bridal portrait from a user photo using Google Gemini AI.

**Content-Type:** `multipart/form-data`

**Parameters:**
- `userImage` (file, required): The input photo to transform into a bridal portrait

**Example Request:**
```bash
curl -X POST \
  http://localhost:3001/api/generate/gemini \
  -F "userImage=@/path/to/your/photo.jpg"
```

**Success Response (200):**
```json
{
  "success": true,
  "result": {
    "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "provider": "gemini",
    "timestamp": "2025-09-02T16:24:41.340Z"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing or invalid parameters
- **500 Internal Server Error:** Generation failed

### Face Swap

**POST** `/api/generate/segmind`

Perform face swap using Segmind AI service.

**Content-Type:** `multipart/form-data`

**Headers:**
- `X-Segmind-API-Key` (required): Your Segmind API key

**Parameters:**
- `sourceImage` (file, required): The source face image
- `targetImage` (file, required): The target body/background image

**Example Request:**
```bash
curl -X POST \
  http://localhost:3001/api/generate/segmind \
  -H "X-Segmind-API-Key: YOUR_SEGMIND_API_KEY" \
  -F "sourceImage=@/path/to/source.jpg" \
  -F "targetImage=@/path/to/target.jpg"
```

**Success Response (200):**
```json
{
  "success": true,
  "result": {
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
    "provider": "segmind",
    "timestamp": "2025-09-02T16:24:41.340Z"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing or invalid parameters
- **401 Unauthorized:** Missing or invalid API key
- **500 Internal Server Error:** Generation failed

## File Requirements

- **Supported formats:** JPEG, PNG, GIF, WebP
- **Maximum file size:** 50MB per file
- **Recommendations:**
  - Use high-quality images for better results
  - Ensure faces are clearly visible and well-lit
  - Front-facing photos work best for portrait generation

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "result": {
    "imageUrl": "data:image/[format];base64,[base64_encoded_image]",
    "provider": "[gemini|segmind]",
    "timestamp": "ISO_8601_timestamp"
  }
}
```

All error responses follow this format:

```json
{
  "error": "Error category",
  "message": "Detailed error description"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Clients should implement their own rate limiting to avoid overwhelming the underlying AI providers.

## Error Handling

The API provides detailed error messages for common issues:

- **Missing files:** Clear indication of which files are required
- **Invalid file types:** Validation that uploaded files are images
- **API key issues:** Specific feedback for authentication problems
- **Provider errors:** Forwarded error messages from underlying services

## Development and Testing

### Running the Server

```bash
# Development mode (with auto-restart)
npm run server:dev

# Production mode
npm run build
npm start
```

### Example Usage (JavaScript/Node.js)

```javascript
import FormData from 'form-data';
import fs from 'fs';

// Gemini portrait generation
async function generatePortrait(imagePath) {
  const formData = new FormData();
  formData.append('userImage', fs.createReadStream(imagePath));
  
  const response = await fetch('http://localhost:3001/api/generate/gemini', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

// Segmind face swap
async function faceSwap(sourcePath, targetPath, apiKey) {
  const formData = new FormData();
  formData.append('sourceImage', fs.createReadStream(sourcePath));
  formData.append('targetImage', fs.createReadStream(targetPath));
  
  const response = await fetch('http://localhost:3001/api/generate/segmind', {
    method: 'POST',
    headers: {
      'X-Segmind-API-Key': apiKey
    },
    body: formData
  });
  
  return response.json();
}
```

### Example Usage (Python)

```python
import requests

# Gemini portrait generation
def generate_portrait(image_path):
    with open(image_path, 'rb') as f:
        files = {'userImage': f}
        response = requests.post(
            'http://localhost:3001/api/generate/gemini',
            files=files
        )
    return response.json()

# Segmind face swap
def face_swap(source_path, target_path, api_key):
    with open(source_path, 'rb') as source, open(target_path, 'rb') as target:
        files = {
            'sourceImage': source,
            'targetImage': target
        }
        headers = {'X-Segmind-API-Key': api_key}
        response = requests.post(
            'http://localhost:3001/api/generate/segmind',
            files=files,
            headers=headers
        )
    return response.json()
```

## Production Deployment

### Environment Setup

1. Set environment variables:
   ```bash
   export GEMINI_API_KEY=your_actual_gemini_key
   export PORT=3001
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Considerations

- **Security:** Implement proper authentication and authorization if needed
- **Rate Limiting:** Add rate limiting middleware to prevent abuse
- **Monitoring:** Set up logging and monitoring for production use
- **HTTPS:** Use HTTPS in production environments
- **File Storage:** Consider temporary file cleanup for large volumes
- **Load Balancing:** Use a load balancer for high-traffic scenarios

## Support

For issues or questions about the API, please refer to the project repository or contact the development team.