'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Users, Sparkles, GitBranch, Code2, FileText, Workflow } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./../components/ui/card";


const Features = () => {
  const router = useRouter();

  const handleFirst = () => {
    router.push('/guidance');
  };

  const handleSecond = () => {
    router.push('/beginner');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      {/* Decorative Icons */}
      <div className="absolute top-20 right-20 opacity-10 max-md:hidden">
        <GitBranch size={100} className="text-indigo-400" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10 max-md:hidden">
        <Code2 size={100} className="text-indigo-400" />
      </div>
      <div className="absolute top-1/3 left-20 opacity-10 max-md:hidden">
        <FileText size={80} className="text-indigo-400" />
      </div>
      <div className="absolute bottom-1/3 right-20 opacity-10 max-md:hidden">
        <Workflow size={80} className="text-indigo-400" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="text-indigo-400" size={20} />
            <span className="font-sans text-xs uppercase tracking-widest text-indigo-300 font-medium">
              Powerful Features
            </span>
          </div>
          <h1 className="font-sans text-4xl md:text-5xl font-bold text-white">
            EXPLORE ISSUEWIZ FEATURES
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
         
          {/* Feature Card 1 */}
          <Card className="group bg-white/5 border border-indigo-500/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                <BookOpen className="text-indigo-400" size={24} />
              </div>
              <CardTitle className="font-sans text-xl font-semibold text-white">Issue-Specific Guidance</CardTitle>
            </CardHeader>
            <CardContent className="font-sans text-slate-300">
              Paste a GitHub issue link to analyze files, identify potential fixes, and gain AI-powered explanations.  
              Highlights critical files, suggests modifications, and guides users.
            </CardContent>
            <CardFooter>
              <button
                onClick={handleFirst}
                className="font-sans w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-lg
                flex items-center justify-center space-x-2
                hover:shadow-lg hover:translate-y-px transition-all duration-200
                shadow-lg font-medium
                group"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </button>
            </CardFooter>
          </Card>

         
          {/* Feature Card 2 */}
          <Card className="group bg-white/5 border border-indigo-500/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                <Users className="text-indigo-400" size={24} />
              </div>
              <CardTitle className="font-sans text-xl font-semibold text-white">Skill-Based Issue Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="font-sans text-slate-300">
              Designed for beginners or contributors unsure where to start, input your GitHub username and preferred repository. 
              The AI recommends issues based on your skills.
            </CardContent>
            <CardFooter>
              <button
                onClick={handleSecond}
                className="font-sans w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-lg
                flex items-center justify-center space-x-2
                hover:shadow-lg hover:translate-y-px transition-all duration-200
                shadow-lg font-medium
                group"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Features;