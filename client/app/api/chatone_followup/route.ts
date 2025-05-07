import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define interfaces for type safety and code organization
interface ChatMessage {
  type: 'bot' | 'user';
  content: string;
}

interface UserProfile {
  name: string;
  bio: string;
  public_repos: number;
  hireable: boolean;
}

interface Repository {
  name: string;
  language: string;
  topics: string[];
}

interface ChatContext {
  userProfile: UserProfile;
  previousMessages: ChatMessage[];
  currentQuery: string;
  userRepos: Repository[];
  technicalContext: {
    languages: string[];
    topics: string[];
  };
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Helper function to categorize the type of help needed
function analyzeUserQuery(query: string): string[] {
  const guidanceCategories = [];
  
  // Define patterns for different types of help requests
  const patterns = {
    setup: /(how to|help|can you|where do I) (start|begin|setup|set up|initialize)/i,
    files: /(which|what|where) (files?|code|changes|modify)/i,
    workflow: /(steps|process|workflow|how do I|what should I)/i,
    testing: /(test|verify|check|validate)/i,
    submission: /(submit|PR|pull request|contribute)/i,
    explanation: /(explain|understand|what does|mean|confused|unclear)/i,
    error: /(error|problem|issue|not working|failed)/i,
    conceptual: /(concept|theory|principle|how does|why does)/i
  };

  // Check which categories match the user's query
  Object.entries(patterns).forEach(([category, pattern]) => {
    if (pattern.test(query)) {
      guidanceCategories.push(category);
    }
  });

  // Default to general guidance if no specific categories matched
  if (guidanceCategories.length === 0) {
    guidanceCategories.push('general');
  }

  return guidanceCategories;
}

// Helper function to extract relevant context from chat history
function extractIssueContext(messages: ChatMessage[]): string {
  const initialMessage = messages.find(msg => 
    msg.type === 'bot' && msg.content.includes('recommended issues'));
  
  if (initialMessage) {
    // Parse out the specific issue details if possible
    const issueMatch = initialMessage.content.match(/Issue Title: (.*?)\nURL: (.*?)(\n|$)/);
    if (issueMatch) {
      return `Working on issue: ${issueMatch[1]}\nURL: ${issueMatch[2]}`;
    }
    return initialMessage.content;
  }
  return '';
}

// Main handler for POST requests
export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const context: ChatContext = await request.json();

    // Analyze the type of guidance needed
    const guidanceNeeded = analyzeUserQuery(context.currentQuery);
    
    // Get relevant issue context from chat history
    const issueContext = extractIssueContext(context.previousMessages);

    // Format chat history for context
    const chatHistory = context.previousMessages
      .map(msg => `${msg.type.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    // Create detailed prompt for AI response
    const prompt = `
As an experienced open source mentor helping a beginner developer, provide detailed guidance based on their question.

DEVELOPER CONTEXT:
- Experience Level: Beginner
- Known Languages: ${context.technicalContext.languages.join(', ')}
- Interests/Topics: ${context.technicalContext.topics.join(', ')}
- Public Repos: ${context.userProfile?.public_repos || 0}

GUIDANCE CATEGORIES NEEDED: ${guidanceNeeded.join(', ')}

ISSUE CONTEXT:
${issueContext}

CHAT HISTORY:
${chatHistory}

CURRENT QUESTION:
${context.currentQuery}

Based on their question, provide:
1. Clear, direct answer to their specific question
2. Step-by-step instructions appropriate for beginners
3. Explanation of any technical terms or concepts
4. Specific file locations and code areas to work with
5. Common pitfalls and how to avoid them
6. Testing and verification steps
7. Relevant documentation or learning resources

RESPONSE GUIDELINES:
1. Use simple, clear language suitable for beginners
2. Break down complex tasks into small, manageable steps
3. Provide examples using their known programming languages
4. Include error handling and debugging guidance
5. Suggest ways to verify work
6. Be encouraging and supportive
7. Use a friendly tone with occasional emojis
8. Address potential confusion points proactively

Remember: Keep explanations beginner-friendly and maintain an encouraging tone throughout.`;

    // Make API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a patient and knowledgeable open source mentor specializing in helping beginners. 
          Your responses should be detailed, step-by-step, and encouraging while maintaining technical accuracy.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: responseContent });

  } catch (error) {
    console.error('Error in chat follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to process chat follow-up', details: error },
      { status: 500 }
    );
  }
}