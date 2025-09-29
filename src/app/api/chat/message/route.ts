'use server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, name, userId, message } = await request.json();
    
    // Log the message
    console.log('Chat message received:', {
      url,
      name,
      userId,
      message,
      timestamp: new Date().toISOString(),
    });

    // Simulate processing delay (replace with actual API call to your agent database)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Here you would typically:
    // 1. Save the message to your database
    // 2. Send the message to your agent/AI system
    // 3. Get the response from your agent
    // 4. Return the agent's response

    // For now, we'll simulate different responses based on the message content
    let agentResponse = '';
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      agentResponse = `Hello ${name}! How can I help you today?`;
    } else if (message.toLowerCase().includes('help')) {
      agentResponse = `I'm here to help, ${name}! What specific assistance do you need?`;
    } else if (message.toLowerCase().includes('thank')) {
      agentResponse = `You're welcome, ${name}! Is there anything else I can help you with?`;
    } else {
      // Generic responses
      const responses = [
        `Thanks for your message, ${name}! I understand you said: "${message}". How can I assist you further?`,
        `I received your message, ${name}. Let me help you with that.`,
        `That's interesting, ${name}. Tell me more about that.`,
        `I'm processing your request, ${name}. Here's what I think about "${message}".`,
        `${name}, I'm here to help! Based on your message, I can provide more information.`,
      ];
      agentResponse = responses[Math.floor(Math.random() * responses.length)];
    }

    return NextResponse.json({
      success: true,
      response: agentResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 