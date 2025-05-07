'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch, Zap, Code2 } from 'lucide-react';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);  // Initially set to false to prevent mismatch.
  const router = useRouter();

  //to avoid hydration
  useEffect(() => {
    setIsMounted(true);  
  }, []);

  if (!isMounted) {
    return null; 
  }

  const handleGetStarted = () => {
    router.push('/features');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center overflow-hidden relative">
      
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 opacity-10 max-md:hidden">
        <GitBranch size={100} className="text-indigo-400" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10 max-md:hidden">
        <Code2 size={100} className="text-indigo-400" />
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center text-center md:text-left z-10 relative py-16">
        <div className="w-full max-w-xl space-y-8">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <Zap className="text-indigo-400" size={20} />
            <span className="font-sans text-xs uppercase tracking-widest text-indigo-300 font-medium">
              AI-Powered Collaboration
            </span>
          </div>

          {/* Mobile image */}
          <div className="md:hidden flex justify-center mb-8">
            <div className="relative w-64 h-64">
              <div className="absolute -inset-4 bg-indigo-500/20 rounded-2xl blur-xl"></div>
              <img
                src="https://cdn.pixabay.com/photo/2022/01/30/13/33/github-6980894_960_720.png"
                alt="GitHub Collaboration"
                className="relative z-10 rounded-xl shadow-xl border border-indigo-500/30 
                hover:scale-105 transition-transform duration-300 w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="font-sans text-4xl md:text-5xl font-bold text-center md:text-left text-white">
            ISSUEWIZ
          </h1>

          <h2 className="font-sans text-xl md:text-3xl font-semibold text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-blue-400">
            REVOLUTIONIZING OPEN-SOURCE CONTRIBUTIONS
          </h2>

          <p className="font-sans text-base md:text-lg text-slate-300 max-w-lg mx-auto md:mx-0 text-center md:text-left leading-relaxed">
            Leverage cutting-edge AI to streamline your open-source workflow, 
            providing intelligent insights and seamless project collaboration.
          </p>

          <div className="flex justify-center md:justify-start space-x-4 pt-4">
            <button 
              onClick={handleGetStarted}
              className="font-sans bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-lg
              flex items-center space-x-2 
              hover:shadow-lg hover:translate-y-px transition-all duration-200 
              shadow-lg font-medium"
            >
              <span>EXPLORE</span>
            </button>
          </div>
        </div>

        {/* Desktop image */}
        <div className="hidden md:block relative mt-8 md:mt-0 md:ml-16">
          <div className="absolute -inset-4 bg-indigo-500/20 rounded-2xl blur-xl"></div>
          <img 
            src="https://cdn.pixabay.com/photo/2022/01/30/13/33/github-6980894_960_720.png"
            alt="GitHub Collaboration"
            className="relative z-10 rounded-xl shadow-xl border border-indigo-500/30 
            hover:scale-105 transition-transform duration-300 max-w-full h-auto"
            width={400}
            height={400}
          />
        </div>
      </div>
    </div>
  );
}