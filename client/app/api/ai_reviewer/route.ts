import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const MAX_CHARS_PER_FILE = 1000; // Limit characters per file
const MAX_FILES = 3; // Limit number of files to analyze

async function fetchFileContent(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const content = await response.text();
    // Truncate content if too long, focusing on the beginning of the file
    return content.length > MAX_CHARS_PER_FILE 
      ? content.slice(0, MAX_CHARS_PER_FILE) + '\n... (content truncated)'
      : content;
  } catch (error) {
    console.error(`Error fetching file content: ${error}`);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { content_matches, filename_matches, owner, repo, issue_url, issue_title, issue_body } = await request.json();

    if (!Array.isArray(content_matches) || !Array.isArray(filename_matches)) {
      return NextResponse.json(
        { error: 'Invalid input: content_matches or filename_matches is not an array' },
        { status: 400 }
      );
    }

    // Sort and limit the number of files to analyze
    const topMatches = [...content_matches, ...filename_matches]
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, MAX_FILES);

    // Fetch truncated content of top matching files
    const fileContents = await Promise.all(
      topMatches.map(async (file) => ({
        file_name: file.file_name,
        match_score: file.match_score,
        content: await fetchFileContent(file.download_url)
      }))
    );

    const prompt = `
Analyze this GitHub issue and relevant files:

Repository: ${owner}/${repo}
Issue Title: ${issue_title}
Issue Description: ${issue_body.slice(0, 500)}${issue_body.length > 500 ? '... (truncated)' : ''}

Relevant Files:
${fileContents.map(file => `
File: ${file.file_name}
Match Score: ${file.match_score}
Key Content:
${file.content}
`).join('\n')}

Provide analysis focusing on:
1. Repository purpose and tech stack
2. File relevance to issue
3. Specific recommendations for changes
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k", // Using 16k context model for larger content
      messages: [
        {
          role: "system",
          content: `You are an expert code analyst and issue resolver. Respond in valid JSON format following this structure:
          {
            "repository_analysis": {
              "purpose": "Main purpose of the repository",
              "tech_stack": ["List", "of", "technologies"],
              "issue_summary": "Core problem analysis"
            },
            "file_analysis": {
              "analyzed_files": [
                {
                  "file_name": "path/to/file",
                  "combined_probability": number,
                  "reason": "Why this file needs modification"
                }
              ]
            },
            "recommendations": {
              "priority_order": ["Ordered", "list", "of", "files"],
              "specific_changes": "Detailed description of recommended changes",
              "additional_context": "Extra information needed"
            }
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const analysisContent = completion.choices[0]?.message?.content;

    if (!analysisContent) {
      return NextResponse.json(
        { error: 'Failed to generate analysis' },
        { status: 500 }
      );
    }

    const sanitizedContent = analysisContent.replace(/```.*?(\n|$)/g, '').trim();
    
    try {
      const parsedAnalysis = JSON.parse(sanitizedContent);
      return NextResponse.json({ reply: parsedAnalysis });
    } catch (error) {
      console.error('AI Analysis Error:', error, sanitizedContent);
      return NextResponse.json(
        { error: 'Issue analysis process failed', details: error },
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