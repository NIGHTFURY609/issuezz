import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Types to match your frontend interface
interface ChatMessage {
  type: 'bot' | 'user';
  content: string;
}

interface FileContent {
  name: string;
  content: string;
}

interface TechnicalContext {
  languages: string[];
  topics: string[];
}

interface AnalysisContext {
  repository_analysis: {
    tech_stack: string[];
    purpose: string;
  };
  recommendations: {
    specific_changes: string;
  };
}

// Helper function to generate code explanation prompt
function generateCodeExplanationPrompt(
  fileContents: FileContent[],
  query: string,
  context: AnalysisContext
) {
  return `As a developer experienced in ${context.repository_analysis.tech_stack.join(', ')}, explain the following code in the context of ${context.repository_analysis.purpose}.

User Question: ${query}

Relevant Files:
${fileContents.map(file => `
File: ${file.name}
Content:
${file.content}
`).join('\n')}

Provide a detailed explanation that:
1. Addresses the specific question about the code
2. Explains the purpose and functionality of relevant code sections
3. Highlights any important patterns or practices used
4. Connects the code to the overall project context
5. Suggests any potential improvements or considerations`;
}

// Helper function to generate workflow explanation prompt
function generateWorkflowPrompt(
  query: string,
  context: AnalysisContext,
  previousMessages: ChatMessage[]
) {
  return `As a technical advisor familiar with ${context.repository_analysis.tech_stack.join(', ')}, help understand the workflow of this project.

Project Context:
${context.repository_analysis.purpose}

Current Question: ${query}

Previous Discussion Context:
${previousMessages.map(msg => `${msg.type.toUpperCase()}: ${msg.content}`).join('\n')}

Provide guidance that:
1. Explains the relevant workflow aspects
2. Connects to the project's overall architecture
3. References specific recommendations: ${context.recommendations.specific_changes}
4. Suggests next steps or areas to focus on
5. Highlights best practices and potential improvements`;
}

// Helper function to generate general response prompt
function generateGeneralPrompt(
  query: string,
  context: AnalysisContext,
  previousMessages: ChatMessage[]
) {
  return `As a technical advisor for this ${context.repository_analysis.tech_stack.join(', ')} project, address the following question.

Project Context:
${context.repository_analysis.purpose}

Current Question: ${query}

Previous Discussion Context:
${previousMessages.map(msg => `${msg.type.toUpperCase()}: ${msg.content}`).join('\n')}

Provide a response that:
1. Directly addresses the question
2. Connects to the project context
3. References relevant technical aspects
4. Suggests practical next steps
5. Maintains consistency with previous answers`;
}

export async function POST(request: Request) {
  try {
    // Verify API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Extract request data
    const {
      previousMessages,
      currentQuery,
      fileContents,
      analysisContext,
      requestType,
      technicalContext
    } = await request.json();

    // Select appropriate prompt based on request type
    let prompt;
    switch (requestType) {
      case 'code_explanation':
        prompt = generateCodeExplanationPrompt(
          fileContents,
          currentQuery,
          analysisContext
        );
        break;
      case 'workflow':
        prompt = generateWorkflowPrompt(
          currentQuery,
          analysisContext,
          previousMessages
        );
        break;
      default:
        prompt = generateGeneralPrompt(
          currentQuery,
          analysisContext,
          previousMessages
        );
    }

    // Generate system message based on request type
    const systemMessage = {
      role: "system",
      content: `You are an expert ${technicalContext.languages.join(', ')} developer and technical advisor. 
      ${requestType === 'code_explanation' 
        ? 'Provide detailed, educational code explanations with examples and best practices.' 
        : 'Offer clear, actionable guidance while maintaining context from previous messages.'}`
    };

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        systemMessage,
        // Include relevant previous messages for context
        ...previousMessages.slice(-5).map((msg: any) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Extract and process the response
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: responseContent });

  } catch (error) {
    console.error('Error during POST request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error },
      { status: 500 }
    );
  }
}