import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Main handler for POST requests
export async function POST(request: Request) {
  try {
    // Validate OpenAI API key presence
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Parse incoming request data
    const fullData = await request.json();

    // Extract unique languages and topics from user's repositories
    const userLanguages = [...new Set(
      fullData.repositories
        .map((repo: any) => repo.language)
        .filter(Boolean)
    )];

    const userTopics = [...new Set(
      fullData.repositories
        .flatMap((repo: any) => repo.topics || [])
    )];

    // Filter out pull requests from available issues
    const availableIssues = fullData.repoissues.filter((issue: any) => !issue.pull_request);

    // Return early if no valid issues are available
    if (availableIssues.length === 0) {
      return NextResponse.json({
        reply: {
          recommendations: []
        }
      });
    }

    // Construct the prompt for the AI with comprehensive context
    const prompt = `
OPEN-SOURCE CONTRIBUTION MATCHER

## DEVELOPER PROFILE
- Programming Languages: ${userLanguages.join(', ')}
- Technical Interests: ${userTopics.join(', ')}
- Experience Level: Beginner

## AVAILABLE ISSUES (Total: ${availableIssues.length})
${availableIssues.map((issue: any, index: number) => `
Issue #${index + 1}:
- Title: ${issue.title}
- Repository: ${fullData.issue_owner}/${fullData.issue_repo}
- Description: ${issue.body}
- Labels: ${issue.labels.join(', ')}
- URL: https://github.com/${fullData.issue_owner}/${fullData.issue_repo}/issues/${issue.number}
`).join('\n')}

## RECOMMENDATION OBJECTIVE
Analyze the available issues and recommend the most suitable ones for a beginner developer.
For each recommended issue, provide:
1. Clear difficulty assessment
2. Brief summary of required changes
3. Key files that need modification
4. Essential skills needed
5. Estimated time commitment

Important constraints:
- Recommend MAX 3 issues that best match the developer's skills
- Focus on beginner-friendly issues
- Keep initial descriptions concise but informative
- If no suitable issues exist, return empty recommendations

FORMAT YOUR RESPONSE AS JSON following the structure below.`;

    // Make API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert at matching beginner developers with suitable open-source issues. 
          Provide concise but informative initial recommendations. Response must be valid JSON with this structure:
          {
            "recommendations": [
              {
                "issue_title": "Exact Issue Title",
                "issue_url": "Full GitHub Issue URL",
                "difficulty_level": "Beginner/Intermediate/Advanced",
                "quick_summary": "One-sentence overview of what needs to be done",
                "key_skills_needed": ["2-3 main skills required"],
                "main_files": ["2-3 key files to modify"],
                "estimated_time": "Rough time estimate for beginners",
                "why_recommended": "Brief explanation of why this matches their skills"
              }
            ]
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const recommendationContent = completion.choices[0]?.message?.content;

    if (!recommendationContent) {
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: 500 }
      );
    }

    // Clean up the response
    const sanitizedContent = recommendationContent.replace(/```.*?(\n|$)/g, '').trim();

    try {
      const parsedRecommendations = JSON.parse(sanitizedContent);

      // Validate recommendations format
      if (!Array.isArray(parsedRecommendations.recommendations)) {
        throw new Error('Recommendations are not in the expected array format');
      }

      // Ensure we never exceed 3 recommendations
      parsedRecommendations.recommendations = parsedRecommendations.recommendations.slice(0, 3);

      return NextResponse.json({
        reply: { recommendations: parsedRecommendations.recommendations }
      });

    } catch (error) {
      console.error('AI Recommendation Error:', error, sanitizedContent);
      return NextResponse.json(
        {
          error: 'Issue recommendation process failed',
          details: error
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error during POST request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error },
      { status: 500 }
    );
  }
}