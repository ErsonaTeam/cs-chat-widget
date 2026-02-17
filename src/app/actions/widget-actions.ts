'use server';

import { queueFallbackMessage } from '@/services/message-queue-service';

export interface WidgetMessageData {
  companyId: string;
  conversationId: string;
  message: string;
  userName: string;
  userPhone?: string;
  timestamp: string;
  meta?: {
    userAgent?: string;
    referrer?: string;
  };
  formData?: Record<string, string | boolean>;
}

export interface WidgetActionResult {
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

// Server Action: Send message to embeddings service
export async function sendToEmbeddingsService(data: WidgetMessageData): Promise<WidgetActionResult> {
  try {
    const embeddingsServiceUrl = process.env.EMBEDDINGS_SERVICE_URL;
    
    if (!embeddingsServiceUrl) {
      throw new Error('EMBEDDINGS SERVICE URL is not set');
    }
    
    const response = await fetch(`${embeddingsServiceUrl}/widget/message`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyId: data.companyId,
        conversationId: data.conversationId,
        message: data.message,
        userName: data.userName,
        phone: data.userPhone,
        timestamp: data.timestamp,
        meta: data.meta,
        ...(data.formData ? { formData: data.formData } : {}),
      }),
    });

    if (!response.ok) {
      console.error('Widget Actions - Failed to send to embeddings service:', response.status, response.statusText);
      throw new Error(`Embeddings service responded with ${response.status}`);
    }

    return {
      success: true,
      message: 'Message sent to embeddings service successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Widget Actions - Error sending to embeddings service:', error);
    return {
      success: false,
      error: 'Failed to send message to embeddings service',
      timestamp: new Date().toISOString(),
    };
  }
}

// Server Action: Main widget message processing
export async function processWidgetMessage(data: WidgetMessageData): Promise<WidgetActionResult> {
  const { companyId, conversationId, message, userName } = data;
  
  // Validate required fields
  if (!companyId || !conversationId || !message || !userName) {
    return {
      success: false,
      error: 'Missing required fields: companyId, conversationId, message, userName',
      timestamp: new Date().toISOString(),
    };
  }

  // Send to embeddings service
  const embeddingsResult = await sendToEmbeddingsService(data);
  
  // If embeddings service fails, queue fallback message
  if (!embeddingsResult.success) {
    try {
      await queueFallbackMessage(companyId, conversationId);
      return {
        success: true,
        message: 'Message processing failed, but fallback message queued',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Message processing and fallback both failed with error: ' + error,
        timestamp: new Date().toISOString(),
      };
    }
  }

  return {
    success: true,
    message: 'Message sent to AI service for processing',
    timestamp: new Date().toISOString(),
  };
}
