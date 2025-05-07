'use client';
import React, { useState } from 'react';
import ChatBot from './../components/chatbot';
import { GitBranch, Code2, Search, Github, FileText, Workflow } from 'lucide-react';
import fetchDetails from './../utils/user_det'

// Define our core interfaces for type safety and better code organization
interface UserProfile {
  name: string;
  bio: string;
  public_repos: number;
  hireable: boolean;
}

interface Repository {
  name: string;
  description: string;
  language: string;
  topics: string[];
  forks_count: number;
  stargazers_count: number;
  primary_language: string;
}

interface Issue {
  title: string;
  body: string;
  state: string;
  labels: { name: string }[];
  html_url: string;
  created_at: string;
  number: number;
}

interface FetchedData {
  profile: UserProfile;
  repositories: Repository[];
  repoissues: Issue[];
  issue_owner: string;
  issue_repo: string;
}

// Interface for chat messages to maintain consistency in message structure
interface ChatMessage {
  type: 'bot' | 'user';
  content: any;
}

// Interface for AI recommendations to ensure consistent recommendation format
interface Recommendation {
  issue_title: string;
  issue_url: string;
  difficulty_level: string;
  learning_opportunities: string;
  why_recommended: string;
}

const Beginner = () => {
  // State management using React hooks
  const [username, setUsername] = useState<string>('');
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChatBot, setShowChatBot] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>('');
  const [userData, setUserData] = useState<FetchedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [skills, setSkills] = useState<Record<string, string[]>>({});


  // Helper function to extract and organize skills
  const organizeSkills = (repositories: Repository[]) => {
    return repositories.reduce((skillMap: Record<string, string[]>, repo) => {
      if (repo.language) {
        const lang = repo.language;
        if (!skillMap[lang]) {
          skillMap[lang] = [];
        }
        if (!skillMap[lang].includes(repo.name)) {
          skillMap[lang].push(repo.name);
        }
      }
      return skillMap;
    }, {});
  };


  // Helper function to escape special characters for RegExp
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Helper function to safely create a case-insensitive RegExp
  const createSafeRegExp = (term: string) => {
    try {
      return new RegExp(escapeRegExp(term), 'i');
    } catch (error) {
      console.error(`Failed to create RegExp for: ${term}`, error);
      // Fallback to simple string comparison
      return {
        test: (str: string) => str.toLowerCase().includes(term.toLowerCase())
      };
    }
  };

  // Helper function to normalize skill names
  const normalizeSkillName = (skill: string) => {
    // Add special handling for common programming languages
    const skillMap: Record<string, string> = {
      'c++': 'C++',
      'c#': 'C#',
      'f#': 'F#',
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      // Add more mappings as needed
    };
    
    return skillMap[skill.toLowerCase()] || skill;
  };

  const generateInitialMessage = (
    recommendations: Recommendation[], 
    userData: FetchedData,
    organizedSkills: Record<string, string[]>  // Add this parameter
  ) => {
    if (!recommendations || recommendations.length === 0) {
      return {
        type: 'bot' as const,
        content: `Hi there! 👋 I've analyzed your GitHub profile but couldn't find perfectly matching issues.
  
  🔍 Your Skills Profile:
  ${Object.entries(organizedSkills)
    .map(([language, repos]) => 
      `• ${language}: Demonstrated in ${repos.join(', ')}`
    )
    .join('\n')}
  
  Here are some suggestions:
  - Try exploring other beginner-friendly repositories
  - Look for issues labeled with "good-first-issue" or "beginner-friendly"
  - Consider contributing to documentation or testing
  
  Would you like help finding other beginner-friendly repositories that match your skills? 😊`
      };
    }
  
    // Format recommendations
    const formattedRecommendations = recommendations.map((rec: Recommendation) => `
  📌 ${rec.issue_title}
  🔗 ${rec.issue_url}
  📊 Difficulty: ${rec.difficulty_level}
  📚 Learning: ${rec.learning_opportunities}
  💡 Why: ${rec.why_recommended}
  `).join('\n\n');
  
    // Create skills profile section using the passed-in organized skills
    const skillsProfile = Object.entries(organizedSkills)
      .map(([language, repos]) => 
        `• ${language}: Demonstrated in ${repos.join(', ')}`
      )
      .join('\n');
      
    return {
      type: 'bot' as const,
      content: `Hi there! 👋 I've analyzed your GitHub profile and found some perfect issues that match your skills and experience level.
  
  🔍 Your Skills Profile:
  ${skillsProfile}
  
  Here are the recommended issues:
  ${formattedRecommendations}
  
  I can help explain any of these recommendations in more detail or guide you through getting started. What would you like to know more about? 😊`
    };
  };
  // Handle fetching user data and getting AI recommendations
  const handleFetch = async () => {
    if (!username || !repoUrl) return;
    
    setIsLoading(true);
    try {
      const data = await fetchDetails(username, repoUrl);
      
      if (data) {
        setUserData(data);
        
        // Calculate organized skills
        const organizedSkills = organizeSkills(data.repositories);
        setSkills(organizedSkills);
        
        const aiResponse = await fetch('/api/ai_suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
  
        if (!aiResponse.ok) {
          throw new Error(await aiResponse.text());
        }
  
        const aiRecommendations = await aiResponse.json();
        
        // Pass the organized skills directly to generateInitialMessage
        const initialMessage = generateInitialMessage(
          aiRecommendations.reply.recommendations,
          data,
          organizedSkills  // Add this parameter
        );
  
        setChatMessages([initialMessage]);
        setShowChatBot(true);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending user messages in the chat interface
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      type: 'user',
      content: userMessage,
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');

    // Prepare context for AI response
    const context = {
      userProfile: userData?.profile,
      previousMessages: chatMessages,
      currentQuery: userMessage,
      userRepos: userData?.repositories || [],
      technicalContext: {
        languages: [...new Set(userData?.repositories.map(repo => repo.language).filter(Boolean))],
        topics: [...new Set(userData?.repositories.flatMap(repo => repo.topics || []))],
      }
    };

    try {
      // Get AI response for follow-up message
      const aiResponse = await fetch('/api/chatone_followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context)
      });

      if (!aiResponse.ok) throw new Error('Failed to get AI response');
      
      const response = await aiResponse.json();
      
      // Add AI response to chat
      const newBotMessage: ChatMessage = {
        type: 'bot',
        content: response.reply,
      };

      setChatMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Chat follow-up error:', error);
      // Add user-friendly error notification here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Glowing orbs for visual depth */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"></div>

      {/* Decorative floating icons */}
      <div className="absolute top-20 right-20 opacity-10 max-md:hidden">
        <GitBranch size={80} className="text-indigo-400" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10 max-md:hidden">
        <Code2 size={80} className="text-indigo-400" />
      </div>
      <div className="absolute top-1/3 left-20 opacity-10 max-md:hidden">
        <FileText size={60} className="text-indigo-400" />
      </div>
      <div className="absolute bottom-1/3 right-20 opacity-10 max-md:hidden">
        <Workflow size={60} className="text-indigo-400" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {!showChatBot ? (
          // Initial input form
          <div className="max-w-2xl mx-auto bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-indigo-500/20">
            <div className="text-center space-y-6 mb-8">
              <div className="flex items-center justify-center space-x-4">
                <Search className="text-indigo-400" size={36} />
                <h1 className="text-3xl font-bold text-white">REPOSITORY AND ISSUE MATCHER</h1>
              </div>
              <p className="text-xl text-slate-300">
                Enter your details below to discover tailored open-source issues that match your skills and interests.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-slate-300 text-sm font-medium">GitHub Username</label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400/70" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your GitHub username"
                    className="w-full pl-10 p-4 rounded-xl bg-slate-700/50 border border-indigo-500/20 text-white 
                      focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-slate-300 text-sm font-medium">Repository URL</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="Enter the repository link"
                  className="w-full p-4 rounded-xl bg-slate-700/50 border border-indigo-500/20 text-white 
                    focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleFetch}
                disabled={isLoading || !username || !repoUrl}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 text-white py-4 rounded-xl
                  hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-indigo-500/50
                  disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? 'Finding Issues...' : 'Find Recommended Issues'}
              </button>
            </div>
          </div>
        ) : (
          // Chat interface - this component is imported, we don't need to modify it here
          // The styling for ChatBot would be updated in its own component file
          <ChatBot
            messages={chatMessages}
            userMessage={userMessage}
            onMessageChange={setUserMessage}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};

export default Beginner;