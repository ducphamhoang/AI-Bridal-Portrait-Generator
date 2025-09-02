import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { generateImageEndpoint } from './routes/generate.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// API Routes
app.use('/api/generate', generateImageEndpoint(upload));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'AI Bridal Portrait Generator API',
    version: '1.0.0',
    description: 'External API for generating bridal portraits and face swaps using AI providers.',
    endpoints: {
      'POST /api/generate/gemini': {
        description: 'Generate a bridal portrait using Google Gemini AI',
        contentType: 'multipart/form-data',
        parameters: {
          userImage: { type: 'file', required: true, description: 'The input photo to transform' }
        },
        headers: {
          'Authorization': { required: false, description: 'Bearer token for authentication (if configured)' }
        },
        responses: {
          200: { description: 'Success - returns generated image as base64 data URL' },
          400: { description: 'Bad request - missing or invalid parameters' },
          500: { description: 'Internal server error' }
        }
      },
      'POST /api/generate/segmind': {
        description: 'Perform face swap using Segmind AI',
        contentType: 'multipart/form-data',
        parameters: {
          sourceImage: { type: 'file', required: true, description: 'The source face image' },
          targetImage: { type: 'file', required: true, description: 'The target body/background image' }
        },
        headers: {
          'Authorization': { required: false, description: 'Bearer token for authentication (if configured)' },
          'X-Segmind-API-Key': { required: true, description: 'Segmind API key for the service' }
        },
        responses: {
          200: { description: 'Success - returns face-swapped image as base64 data URL' },
          400: { description: 'Bad request - missing or invalid parameters' },
          401: { description: 'Unauthorized - missing or invalid API key' },
          500: { description: 'Internal server error' }
        }
      }
    },
    examples: {
      'curl_gemini': `curl -X POST \\
  http://localhost:3001/api/generate/gemini \\
  -F "userImage=@/path/to/your/photo.jpg"`,
      'curl_segmind': `curl -X POST \\
  http://localhost:3001/api/generate/segmind \\
  -H "X-Segmind-API-Key: YOUR_SEGMIND_API_KEY" \\
  -F "sourceImage=@/path/to/source.jpg" \\
  -F "targetImage=@/path/to/target.jpg"`
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /health',
      'GET /api/docs', 
      'POST /api/generate/gemini',
      'POST /api/generate/segmind'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Bridal Portrait Generator API server running on port ${PORT}`);
  console.log(`📖 API documentation available at: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health check available at: http://localhost:${PORT}/health`);
});