import express from 'express';
import { generateImage } from '../services/imageService.js';

export function generateImageEndpoint(upload: any) {
  const router = express.Router();

  // Gemini endpoint - requires single image file
  router.post('/gemini', upload.single('userImage'), async (req, res) => {
    try {
      // Validate request
      if (!req.file) {
        return res.status(400).json({
          error: 'Missing required parameter',
          message: 'userImage file is required'
        });
      }

      // Validate file type
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'userImage must be an image file'
        });
      }

      console.log(`Generating bridal portrait for ${req.file.originalname} (${req.file.size} bytes)`);

      // Generate image
      const result = await generateImage({
        provider: 'GEMINI',
        userImage: req.file
      });

      res.status(200).json({
        success: true,
        result: {
          imageUrl: result,
          provider: 'gemini',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Gemini generation error:', error);
      res.status(500).json({
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  });

  // Segmind endpoint - requires two image files and API key
  router.post('/segmind', upload.fields([
    { name: 'sourceImage', maxCount: 1 },
    { name: 'targetImage', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Validate request
      if (!files?.sourceImage?.[0]) {
        return res.status(400).json({
          error: 'Missing required parameter',
          message: 'sourceImage file is required'
        });
      }

      if (!files?.targetImage?.[0]) {
        return res.status(400).json({
          error: 'Missing required parameter',
          message: 'targetImage file is required'
        });
      }

      // Get API key from header
      const apiKey = req.headers['x-segmind-api-key'] as string;
      if (!apiKey) {
        return res.status(401).json({
          error: 'Missing API key',
          message: 'X-Segmind-API-Key header is required'
        });
      }

      // Validate file types
      if (!files.sourceImage[0].mimetype.startsWith('image/')) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'sourceImage must be an image file'
        });
      }

      if (!files.targetImage[0].mimetype.startsWith('image/')) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'targetImage must be an image file'
        });
      }

      console.log(`Generating face swap: ${files.sourceImage[0].originalname} (${files.sourceImage[0].size} bytes) -> ${files.targetImage[0].originalname} (${files.targetImage[0].size} bytes)`);

      // Generate image
      const result = await generateImage({
        provider: 'SEGMIND',
        sourceImage: files.sourceImage[0],
        targetImage: files.targetImage[0],
        apiKey
      });

      res.status(200).json({
        success: true,
        result: {
          imageUrl: result,
          provider: 'segmind',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Segmind generation error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return res.status(401).json({
            error: 'API key error',
            message: error.message
          });
        }
        if (error.message.includes('status 4')) {
          return res.status(400).json({
            error: 'Bad request to provider',
            message: error.message
          });
        }
      }

      res.status(500).json({
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  });

  return router;
}