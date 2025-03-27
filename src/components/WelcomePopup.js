import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react"; // Make sure you have lucide-react installed

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup when component mounts
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Close when clicking outside
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl max-w-2xl w-[95%] relative shadow-lg">
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-2 right-2" 
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-bold mb-3">Welcome to Cognates Explorer! 🌍</h2>
        
        <div className="space-y-3">
          <p className="leading-relaxed text-sm">
            <span className="text-lg mr-2">🤔</span> 
            Did you know that cognates are words that have the same origin and similar meaning across different languages?
          </p>
          
          <div>
            <p className="mb-1 text-sm">
              <span className="text-lg mr-2">📚</span> 
              For example:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>"Lamba" (🇹🇷 Turkish) and "Lamp" (🇬🇧 English)</li>
              <li>"Noche" (🇪🇸 Spanish) and "Night" (🇬🇧 English)</li>
              <li>"Schule" (🇩🇪 German) and "School" (🇬🇧 English)</li>
            </ul>
          </div>
          
          <p className="leading-relaxed text-sm">
            <span className="text-lg mr-2">✨</span> 
            Our app helps you discover and learn cognates between languages, making your language learning journey easier and more fun!
          </p>
          
          <Button 
            size="default"
            className="mt-4 w-full"
            onClick={handleClose}
          >
            Let's Start Exploring! 🚀
          </Button>
          
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 border-t pt-2">
            Cognate data sourced from{' '}
            <a 
              href="https://github.com/kbatsuren/CogNet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              CogNet
            </a>
            {' '}(Batsuren et al., 2019, 2021)
          </p>
        </div>
      </div>
    </div>
  );
} 