
import React from 'react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

interface NavBarProps {
  title: string;
}

const NavBar: React.FC<NavBarProps> = ({ title }) => {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M21 7 C21 5.89543 20.1046 5 19 5 L5 5 C3.89543 5 3 5.89543 3 7 L3 19 C3 20.1046 3.89543 21 5 21 L19 21 C20.1046 21 21 20.1046 21 19 L21 7 Z" />
              <path d="M7.5 14C8.32843 14 9 13.3284 9 12.5C9 11.6716 8.32843 11 7.5 11C6.67157 11 6 11.6716 6 12.5C6 13.3284 6.67157 14 7.5 14Z" />
              <path d="M16.5 14C17.3284 14 18 13.3284 18 12.5C18 11.6716 17.3284 11 16.5 11C15.6716 11 15 11.6716 15 12.5C15 13.3284 15.6716 14 16.5 14Z" />
              <path d="M6 12.5 L9 8" />
              <path d="M15 12.5 L18 8" />
              <path d="M12 17 L12 13" />
              <path d="M12 13 L9 8" />
              <path d="M12 13 L15 8" />
            </svg>
            <span className="font-bold">{title}</span>
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <p className="text-sm text-muted-foreground hidden md:block">
              Interactive visualization of graph traversal algorithms
            </p>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Github className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">View on GitHub</span>
              </a>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
