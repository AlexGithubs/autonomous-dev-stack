import type { NextApiRequest, NextApiResponse } from 'next';

interface HelloResponse {
  message: string;
  timestamp: string;
  version: string;
  environment: string;
  features: {
    multiAgent: boolean;
    automatedQA: boolean;
    costControls: boolean;
    visualRegression: boolean;
  };
}

interface ErrorResponse {
  error: string;
  code: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HelloResponse | ErrorResponse>
) {
  // Check if pipeline is halted
  const isHalted = process.env.HALT_PIPELINE === 'true';
  
  if (isHalted) {
    return res.status(503).json({
      error: 'Service temporarily unavailable - Pipeline halted',
      code: 'PIPELINE_HALTED'
    });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // Simulate some processing time
    const processingTime = Math.random() * 100;
    
    const response: HelloResponse = {
      message: 'Autonomous Dev Stack API is running!',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        multiAgent: true,
        automatedQA: true,
        costControls: true,
        visualRegression: Boolean(process.env.PERCY_TOKEN || process.env.VRT_API_KEY)
      }
    };

    // Add processing time header
    res.setHeader('X-Processing-Time', `${processingTime.toFixed(2)}ms`);
    
    // Cache for 1 minute in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}