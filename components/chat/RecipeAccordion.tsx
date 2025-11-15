'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { RecipeItem } from '../../types/chat';

interface RecipeAccordionProps {
  recipes: RecipeItem[];
  onExpandChange?: (isExpanded: boolean) => void;
  onRecipeSelected?: (recipeTitle: string | null) => void;
  getRecipe?: (workflowId: string) => void;
  taskDone?: (taskId: string) => void;
}

// Simple function to convert markdown bold to HTML
const renderMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

// Helper function to get fallback image for ingredient
const getIngredientFallbackImage = (ingredientName: string): string => {
  const normalizedName = ingredientName.toLowerCase().trim();
  const ingredientImages: Record<string, string> = {
    'garlic': '/images/ingredients/garlic.png',
    'celery': '/images/ingredients/celery.png',
    'fennel': '/images/ingredients/fennel.png',
    'courgette': '/images/ingredients/courgette.png',
    'zucchini': '/images/ingredients/courgette.png',
    'pasta': '/images/ingredients/pasta.png',
    'linguine': '/images/ingredients/pasta.png',
    'tagliatelle': '/images/ingredients/pasta.png',
    'spaghetti': '/images/ingredients/pasta.png',
    'olive oil': '/images/ingredients/olive-oil.png',
    'tomatoes': '/images/ingredients/tomatoes.png',
    'tomato': '/images/ingredients/tomatoes.png',
    'mussels': '/images/ingredients/mussels.png',
    'mussel': '/images/ingredients/mussels.png',
    'lemon': '/images/ingredients/lemon.png',
    'rocket': '/images/ingredients/rocket.png',
    'arugula': '/images/ingredients/rocket.png',
    'salt': '/images/ingredients/salt.png',
    'pepper': '/images/ingredients/pepper.png',
    'butter': '/images/ingredients/butter.png',
    'parmesan': '/images/ingredients/parmesan.png',
    'basil': '/images/ingredients/basil.png',
    'squash': '/images/ingredients/squash.png',
    'butternut squash': '/images/ingredients/squash.png',
    'risotto': '/images/ingredients/risotto.png',
    'arborio rice': '/images/ingredients/risotto.png',
    'stock': '/images/ingredients/stock.png',
    'vegetable stock': '/images/ingredients/stock.png',
  };
  
  // Try exact match
  if (ingredientImages[normalizedName]) {
    return ingredientImages[normalizedName];
  }
  
  // Try partial match
  for (const [key, imageUrl] of Object.entries(ingredientImages)) {
    if (normalizedName.includes(key)) {
      return imageUrl;
    }
  }
  
  return '/images/ingredients/default.png';
};

// Helper function to get fallback image for utensil
const getUtensilFallbackImage = (utensilName: string): string => {
  const normalizedName = utensilName.toLowerCase().trim();
  const utensilImages: Record<string, string> = {
    'knife': '/images/utensils/knife.png',
    'sharp knife': '/images/utensils/knife.png',
    'cutting board': '/images/utensils/cutting-board.png',
    'pot': '/images/utensils/pot.png',
    'large pot': '/images/utensils/pot.png',
    'frying pan': '/images/utensils/pan.png',
    'pan': '/images/utensils/pan.png',
    'large frying pan': '/images/utensils/pan.png',
    'colander': '/images/utensils/colander.png',
    'spoon': '/images/utensils/spoon.png',
    'wooden spoon': '/images/utensils/spoon.png',
    'spatula': '/images/utensils/spatula.png',
    'tongs': '/images/utensils/tongs.png',
    'bowl': '/images/utensils/bowl.png',
    'small bowl': '/images/utensils/bowl.png',
    'plate': '/images/utensils/plate.png',
    'serving plate': '/images/utensils/plate.png',
    'lid': '/images/utensils/lid.png',
    'zester': '/images/utensils/zester.png',
    'grater': '/images/utensils/grater.png',
    'ladle': '/images/utensils/ladle.png',
  };
  
  // Try exact match
  if (utensilImages[normalizedName]) {
    return utensilImages[normalizedName];
  }
  
  // Try partial match
  for (const [key, imageUrl] of Object.entries(utensilImages)) {
    if (normalizedName.includes(key)) {
      return imageUrl;
    }
  }
  
  return '/images/utensils/default.png';
};

// Function to parse and render detailedDescription markdown into numbered instructions
const renderDetailedDescription = (detailedDescription: string | undefined): React.ReactNode => {
  if (!detailedDescription) {
    return null;
  }

  // Split by double newlines to get paragraphs/sections
  const sections = detailedDescription.split(/\n\n+/);
  const instructions: React.ReactNode[] = [];
  let instructionNumber = 1;

  sections.forEach((section, sectionIdx) => {
    // Remove markdown headers (# ## ###)
    const cleanedSection = section.replace(/^#+\s+/gm, '').trim();
    
    // Split by single newlines to process line by line
    const lines = cleanedSection.split('\n');
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Check if it's a numbered list item (starts with number and period)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        const content = numberedMatch[2];
        instructions.push(
          <div key={`${sectionIdx}-${instructionNumber}`} className="flex gap-3">
            <span className="text-[#327179] font-semibold">{instructionNumber}.</span>
            <p className="text-gray-700">{renderMarkdown(content)}</p>
          </div>
        );
        instructionNumber++;
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        // Unordered list item - convert to numbered
        const content = trimmedLine.substring(2);
        instructions.push(
          <div key={`${sectionIdx}-${instructionNumber}`} className="flex gap-3">
            <span className="text-[#327179] font-semibold">{instructionNumber}.</span>
            <p className="text-gray-700">{renderMarkdown(content)}</p>
          </div>
        );
        instructionNumber++;
      } else if (trimmedLine.length > 20) {
        // Regular paragraph - treat as instruction if it's substantial
        instructions.push(
          <div key={`${sectionIdx}-${instructionNumber}`} className="flex gap-3">
            <span className="text-[#327179] font-semibold">{instructionNumber}.</span>
            <p className="text-gray-700">{renderMarkdown(trimmedLine)}</p>
          </div>
        );
        instructionNumber++;
      }
    });
  });

  // If no numbered instructions were found, split by sentences and number them
  if (instructions.length === 0) {
    const sentences = detailedDescription
      .replace(/^#+\s+/gm, '') // Remove headers
      .split(/(?<=[.!?])\s+(?=[A-Z])/) // Split by sentence endings
      .filter(s => s.trim().length > 10); // Filter out very short fragments

    sentences.forEach((sentence, idx) => {
      instructions.push(
        <div key={`fallback-${idx}`} className="flex gap-3">
          <span className="text-[#327179] font-semibold">{idx + 1}.</span>
          <p className="text-gray-700">{renderMarkdown(sentence.trim())}</p>
        </div>
      );
    });
  }

  return instructions.length > 0 ? instructions : null;
};

export const RecipeAccordion: React.FC<RecipeAccordionProps> = ({ recipes, onExpandChange, onRecipeSelected, getRecipe, taskDone }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [ingredientsModalOpen, setIngredientsModalOpen] = useState<boolean>(false);
  const [utensilsModalOpen, setUtensilsModalOpen] = useState<boolean>(false);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState<number | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [selectedUtensils, setSelectedUtensils] = useState<Set<number>>(new Set());
  const [isStepViewActive, setIsStepViewActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [markAsDoneModalOpen, setMarkAsDoneModalOpen] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [stepVideoModalOpen, setStepVideoModalOpen] = useState<boolean>(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const handleRecipeClick = (index: number) => {
    const newExpandedIndex = expandedIndex === index ? null : index;
    setExpandedIndex(newExpandedIndex);
    onExpandChange?.(newExpandedIndex !== null);
    
    // Notify parent about selected recipe
    if (newExpandedIndex !== null) {
      const recipe = recipes[newExpandedIndex];
      onRecipeSelected?.(recipe.title);
      
      // If recipe is expanded and doesn't have full details, fetch them
      const recipeWithId = recipe as RecipeItem & { workflowId?: string };
      if (recipeWithId.workflowId && getRecipe) {
        // Check if recipe already has full details (ingredients, utensils, steps)
        const hasFullDetails = recipe.ingredients && recipe.ingredients.length > 0 &&
                               recipe.utensils && recipe.utensils.length > 0 &&
                               recipe.steps && recipe.steps.length > 0;
        
        if (!hasFullDetails) {
          console.log('[RecipeAccordion] Fetching recipe details for:', recipeWithId.workflowId);
          getRecipe(recipeWithId.workflowId);
        }
      }
    } else {
      onRecipeSelected?.(null);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoModalOpen(true);
  };

  const handleIngredientToggle = (index: number) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleUtensilToggle = (index: number) => {
    setSelectedUtensils(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Initialize selected items when modal opens
  useEffect(() => {
    if (ingredientsModalOpen && currentRecipeIndex !== null && recipes[currentRecipeIndex]) {
      const ingredients = recipes[currentRecipeIndex].ingredients || [];
      setSelectedIngredients(new Set(ingredients.map((_, idx) => idx)));
    }
  }, [ingredientsModalOpen, currentRecipeIndex, recipes]);

  useEffect(() => {
    if (utensilsModalOpen && currentRecipeIndex !== null && recipes[currentRecipeIndex]) {
      const utensils = recipes[currentRecipeIndex].utensils || [];
      setSelectedUtensils(new Set(utensils.map((_, idx) => idx)));
    }
  }, [utensilsModalOpen, currentRecipeIndex, recipes]);

  // Update timer when step changes
  useEffect(() => {
    if (isStepViewActive && currentRecipeIndex !== null && recipes[currentRecipeIndex]?.steps) {
      const step = recipes[currentRecipeIndex].steps![currentStepIndex];
      setTimerSeconds(parseDurationToSeconds(step.duration));
      setIsTimerRunning(false);
    }
  }, [currentStepIndex, isStepViewActive, currentRecipeIndex, recipes]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // Parse duration string to seconds (e.g., "20:00 min" -> 1200)
  const parseDurationToSeconds = (duration: string): number => {
    const match = duration.match(/(\d+):(\d+)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      return minutes * 60 + seconds;
    }
    // Fallback: try to extract just minutes
    const minutesMatch = duration.match(/(\d+)\s*min/);
    if (minutesMatch) {
      return parseInt(minutesMatch[1], 10) * 60;
    }
    return 0;
  };

  // Format seconds to MM:SS
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCooking = (recipeIdx: number) => {
    if (recipes[recipeIdx]?.steps && recipes[recipeIdx].steps!.length > 0) {
      setIsStepViewActive(true);
      setCurrentStepIndex(0);
      setCurrentRecipeIndex(recipeIdx);
      const firstStep = recipes[recipeIdx].steps![0];
      setTimerSeconds(parseDurationToSeconds(firstStep.duration));
      setUtensilsModalOpen(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex === 0) {
      // Go back to recipe view
      setIsStepViewActive(false);
      setCurrentStepIndex(0);
      setIsTimerRunning(false);
      setTimerSeconds(0);
    } else {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      if (currentRecipeIndex !== null && recipes[currentRecipeIndex]?.steps) {
        const step = recipes[currentRecipeIndex].steps![newIndex];
        setTimerSeconds(parseDurationToSeconds(step.duration));
        setIsTimerRunning(false);
      }
    }
  };

  const handleNextStepClick = () => {
    if (currentRecipeIndex !== null && recipes[currentRecipeIndex]?.steps) {
      const isLastStep = currentStepIndex === recipes[currentRecipeIndex].steps!.length - 1;
      if (isLastStep) {
        // Show feedback modal on last step
        setFeedbackModalOpen(true);
      } else {
        // Show mark as done modal for intermediate steps
        setMarkAsDoneModalOpen(true);
      }
    }
  };

  const handleMarkAsDone = () => {
    setMarkAsDoneModalOpen(false);
    if (currentRecipeIndex !== null && recipes[currentRecipeIndex]?.steps) {
      const currentStep = recipes[currentRecipeIndex].steps![currentStepIndex];
      
      // Send taskdone action to backend if taskId is available
      if (currentStep.taskId && taskDone) {
        console.log('[RecipeAccordion] Marking task as done:', currentStep.taskId);
        taskDone(currentStep.taskId);
      }
      
      // Move to next step if available
      if (currentStepIndex < recipes[currentRecipeIndex].steps!.length - 1) {
        const newIndex = currentStepIndex + 1;
        setCurrentStepIndex(newIndex);
        const nextStep = recipes[currentRecipeIndex].steps![newIndex];
        setTimerSeconds(parseDurationToSeconds(nextStep.duration));
        setIsTimerRunning(false);
      }
    }
  };

  const handleSubmitFeedback = () => {
    // TODO: Send feedback to server
    console.log('Feedback submitted:', feedbackText);
    setFeedbackModalOpen(false);
    setFeedbackText('');
    // Return to recipe view after feedback
    setIsStepViewActive(false);
    setCurrentStepIndex(0);
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleSkipFeedback = () => {
    setFeedbackModalOpen(false);
    setFeedbackText('');
    // Return to recipe view after skipping feedback
    setIsStepViewActive(false);
    setCurrentStepIndex(0);
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleTimerToggle = () => {
    setIsTimerRunning(prev => !prev);
  };

  // Convert YouTube URL to embed format
  const getEmbedVideoUrl = (url?: string, autoplay: boolean = false): string | null => {
    if (!url) return null;
    const autoplayParam = autoplay ? '1' : '0';
    // If already embed format, return as is (but update autoplay)
    if (url.includes('/embed/')) {
      return url.replace(/autoplay=[01]/, `autoplay=${autoplayParam}`);
    }
    // Convert YouTube Shorts to embed
    if (url.includes('/shorts/')) {
      const match = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=${autoplayParam}&mute=0&controls=1&rel=0&playsinline=1&modestbranding=1`;
      }
    }
    // Convert regular YouTube URL to embed
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=${autoplayParam}&mute=0&controls=1&rel=0&playsinline=1&modestbranding=1`;
    }
    return url;
  };

  // If step view is active, show step view instead of accordion
  if (isStepViewActive && currentRecipeIndex !== null && recipes[currentRecipeIndex]?.steps) {
    const currentStep = recipes[currentRecipeIndex].steps![currentStepIndex];
    const stepNumber = currentStepIndex + 1;
    const totalSteps = recipes[currentRecipeIndex].steps!.length;
    const initialDuration = parseDurationToSeconds(currentStep.duration);
    const expectedMinutes = Math.floor(initialDuration / 60);

    return (
      <>
        {/* Step View */}
        <div className="mt-3 bg-white rounded-xl p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousStep}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-500">Step {stepNumber} of {totalSteps}</div>
            </div>
          </div>

          {/* Step Title */}
          <div>
            <h2 className="text-2xl font-bold text-[#327179]">{currentStep.title}</h2>
            <p className="text-sm text-gray-500 mt-1">Expected time: {expectedMinutes} min</p>
          </div>

          {/* Timer Button */}
          <button
            onClick={handleTimerToggle}
            className="w-full px-4 py-3 bg-gray-100 rounded-2xl flex items-center justify-center gap-2 text-[#327179] font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isTimerRunning ? (
              <span>Cancel timer ({formatTimer(timerSeconds)})</span>
            ) : (
              <span>Start timer</span>
            )}
          </button>

          {/* Video Section */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black cursor-pointer"
            onClick={() => setStepVideoModalOpen(true)}
          >
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-[#327179] text-white px-3 py-1 rounded-full text-sm font-medium">
                Step {stepNumber}
              </span>
            </div>
            {currentStep.icon ? (
              <div className="relative w-full h-full">
                <Image
                  src={currentStep.icon}
                  alt={currentStep.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center hover:bg-opacity-100 transition-opacity">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7z" fill="#327179" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Instructions - Rendered from detailedDescription */}
          {currentStep.detailedDescription ? (
            <div className="space-y-4">
              {renderDetailedDescription(currentStep.detailedDescription)}
            </div>
          ) : currentStep.description ? (
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-[#327179] font-semibold">1.</span>
                <p className="text-gray-700">{renderMarkdown(currentStep.description)}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500 italic">No instructions available for this step.</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handlePreviousStep}
              className="flex-1 px-4 py-3 bg-gray-100 text-[#327179] rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>
            <button
              onClick={handleNextStepClick}
              className="flex-1 px-4 py-3 bg-[#327179] text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {currentStepIndex === totalSteps - 1 ? (
                <>
                  Finish
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              ) : (
                <>
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mark as Done Modal */}
        {markAsDoneModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setMarkAsDoneModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-md flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-[#327179]">Mark steps as done</h2>
                <button
                  onClick={() => setMarkAsDoneModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  When you&apos;re done just say &apos;Next&apos; or tap the button below when you&apos;re done with a step.
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="p-4 border-t flex flex-col gap-2">
                <button
                  onClick={() => setMarkAsDoneModalOpen(false)}
                  className="w-full px-4 bg-white border-2 border-[#327179] text-[#327179] rounded-2xl font-medium"
                  style={{ height: '56px' }}
                >
                  Close
                </button>
                <button
                  onClick={handleMarkAsDone}
                  className="w-full px-4 bg-[#327179] text-white rounded-2xl font-medium hover:opacity-90 transition-colors"
                  style={{ height: '56px' }}
                >
                  Mark as done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {feedbackModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setFeedbackModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-[#327179]">
                  How was your {recipes[currentRecipeIndex]?.title || 'recipe'}?
                </h2>
                <button
                  onClick={() => setFeedbackModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-4">
                  Alright, you&apos;ve just cooked up your masterpiece! We&apos;d love to hear what you think.
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts about the recipe..."
                  className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#327179] focus:border-transparent"
                />
              </div>

              {/* Footer Buttons */}
              <div className="p-4 border-t flex flex-col gap-2">
                <button
                  onClick={handleSkipFeedback}
                  className="w-full px-4 bg-white border-2 border-[#327179] text-[#327179] rounded-2xl font-medium"
                  style={{ height: '56px' }}
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="w-full px-4 bg-[#327179] text-white rounded-2xl font-medium hover:opacity-90 transition-colors"
                  style={{ height: '56px' }}
                >
                  Submit feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step Video Modal - Fullscreen */}
        {stepVideoModalOpen && (
          <div
            className="fixed inset-0 bg-black z-50"
            onClick={() => setStepVideoModalOpen(false)}
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setStepVideoModalOpen(false)}
                className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
              <iframe
                width="100%"
                height="100%"
                src={getEmbedVideoUrl('https://www.youtube.com/shorts/3MU0DrXV024', true) || ''}
                title={currentStep.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="mt-3 rounded-xl bg-white">
        <div className="px-4 py-3 border-b">
          <div className="text-base font-semibold">My recommendations</div>
        </div>
        <div className="p-4 space-y-5">
          {recipes.map((recipe, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div key={idx} className="flex flex-col">
                {/* Recipe Header - Always visible */}
                <div
                  className="cursor-pointer transition-all"
                  onClick={() => handleRecipeClick(idx)}
                >
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    width={350}
                    height={160}
                    className="w-full h-40 object-cover rounded-lg"
                    onError={(e) => {
                      // Fallback to local image if external image fails
                      const target = e.target as HTMLImageElement;
                      // Try to get the local image path based on recipe name
                      const recipeName = recipe.title.toLowerCase().trim();
                      const localImages: Record<string, string> = {
                        'tomato & mussel pasta': '/images/tomato-mussel-pasta.webp',
                        'sumptuous squash risotto': '/images/risotto.webp',
                        'jacket potato': '/images/jacket-potato.png',
                        'chickpea arrabbiata': '/images/arrabbiata.png',
                        'happy fish pie': '/images/fish-pie.png',
                      };
                      const fallbackImage = localImages[recipeName] || '/images/jacket-potato.png';
                      if (target.src !== fallbackImage) {
                        target.src = fallbackImage;
                      }
                    }}
                  />
                  {!isExpanded && (
                  <div className="pt-2">
                    <div className="font-medium text-gray-800">{recipe.title}</div>
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="#2AB3A6" strokeWidth="2"/>
                        <path d="M12 7v5l3 2" stroke="#2AB3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{recipe.duration}</span>
                    </div>
                  </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {/* Recipe Title in Gray Background */}
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="text-sm font-medium" style={{ color: '#090909' }}>
                        {recipe.title}
                      </div>
                    </div>
                    {/* Intro Text */}
                    {recipe.introText && (
                      <div className="text-sm text-gray-700 space-y-2">
                        {recipe.introText.split('\n').map((line, i) => (
                          <p key={i}>{renderMarkdown(line)}</p>
                        ))}
                      </div>
                    )}

                    {/* Ingredients and Utensils Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentRecipeIndex(idx);
                        setIngredientsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11l3 3L22 4" stroke="#2AB3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#2AB3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-800">Ingredients and utensils</span>
                    </button>

                    {/* Video Trigger Card */}
                    <button
                      onClick={(e) => handlePlayClick(e)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          width={64}
                          height={64}
                          className="object-cover"
                          onError={(e) => {
                            // Fallback to local image if external image fails
                            const target = e.target as HTMLImageElement;
                            // Try to get the local image path based on recipe name
                            const recipeName = recipe.title.toLowerCase().trim();
                            const localImages: Record<string, string> = {
                              'tomato & mussel pasta': '/images/tomato-mussel-pasta.webp',
                              'sumptuous squash risotto': '/images/risotto.webp',
                              'jacket potato': '/images/jacket-potato.png',
                              'chickpea arrabbiata': '/images/arrabbiata.png',
                              'happy fish pie': '/images/fish-pie.png',
                            };
                            const fallbackImage = localImages[recipeName] || '/images/jacket-potato.png';
                            if (target.src !== fallbackImage) {
                              target.src = fallbackImage;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 font-medium text-gray-800">{recipe.title}</div>
                      <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center transition-colors flex-shrink-0 shadow-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5v14l11-7z" fill="#2AB3A6" />
                        </svg>
                      </div>
                    </button>

                    {/* Recipe Steps and Start Cooking Container */}
                    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                    {/* Recipe Steps */}
                    {recipe.steps && recipe.steps.length > 0 && (
                      <div className="space-y-3">
                        {recipe.steps.map((step, stepIdx) => (
                          <div key={stepIdx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden">
                              {step.icon ? (
                                <Image
                                  src={step.icon}
                                  alt={step.title}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback si la imagen está rota
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-800">{step.title}</div>
                              <div className="mt-1 text-xs text-gray-500">{step.duration}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Start Cooking Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCooking(idx);
                      }}
                      className="w-full px-4 py-3 bg-[#2AB3A6] text-white rounded-lg font-medium hover:bg-[#239e92] transition-colors"
                    >
                      Start cooking
                    </button>
                    </div>

                    {/* Tip Text */}
                    <div className="text-sm text-gray-700 mt-3">
                      <p>
                        Hey, <strong>quick tip before we dive in</strong> — let me know when you finish each step. That way, I can keep up with you. Ready to start cooking?
                      </p>
                    </div>

                    {/* Separator Line */}
                    <div className="border-t border-gray-200 my-3"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Modal - Fullscreen */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 bg-black z-50"
          onClick={() => setVideoModalOpen(false)}
        >
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
              <iframe
                width="100%"
                height="100%"
              src="https://www.youtube.com/embed/XgNCkKr4gqM?autoplay=1&mute=0&controls=1&rel=0&playsinline=1&modestbranding=1"
                title="Recipe Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
          </div>
        </div>
      )}

      {/* Ingredients Modal */}
      {ingredientsModalOpen && currentRecipeIndex !== null && recipes[currentRecipeIndex] && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIngredientsModalOpen(false);
            setCurrentRecipeIndex(null);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-[#2AB3A6]">Review ingredients</h2>
              <button
                onClick={() => {
                  setIngredientsModalOpen(false);
                  setCurrentRecipeIndex(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-gray-600 mb-6">
                Take a quick look at your ingredients and utensils to make sure you&apos;re all set before cooking.
              </p>

              {/* Ingredients Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#2AB3A6]">Ingredients</h3>
                  <span className="text-lg font-semibold text-[#2AB3A6]">
                    {selectedIngredients.size}/
                    {recipes[currentRecipeIndex].ingredients?.length || 0}
                  </span>
                </div>

                <div className="space-y-3">
                  {recipes[currentRecipeIndex].ingredients?.map((ingredient, idx) => {
                    const isSelected = selectedIngredients.has(idx);
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => handleIngredientToggle(idx)}
                      >
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ingredient.imageUrl}
                          alt={ingredient.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallbackImage = getIngredientFallbackImage(ingredient.name);
                            if (target.src !== fallbackImage) {
                              target.src = fallbackImage;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{ingredient.name}</div>
                        <div className="text-xs text-gray-500">{ingredient.quantity}</div>
                      </div>
                      <div className="flex-shrink-0">
                          {isSelected ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="#2AB3A6"/>
                          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t flex flex-col gap-2">
              <button
                onClick={() => {
                  setIngredientsModalOpen(false);
                  setCurrentRecipeIndex(null);
                }}
                className="w-full px-4 bg-white border-2 border-[#327179] text-[#327179] rounded-2xl font-medium"
                style={{ height: '56px' }}
              >
                Skip
              </button>
              <button
                onClick={() => {
                  setIngredientsModalOpen(false);
                  setUtensilsModalOpen(true);
                }}
                className="w-full px-4 bg-[#327179] text-white rounded-2xl font-medium hover:opacity-90 transition-colors"
                style={{ height: '56px' }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Utensils Modal */}
      {utensilsModalOpen && currentRecipeIndex !== null && recipes[currentRecipeIndex] && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setUtensilsModalOpen(false);
            setCurrentRecipeIndex(null);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-[#2AB3A6]">Review utensils</h2>
              <button
                onClick={() => {
                  setUtensilsModalOpen(false);
                  setCurrentRecipeIndex(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-gray-600 mb-6">
                Take a quick look at your ingredients and utensils to make sure you&apos;re all set before cooking.
              </p>

              {/* Utensils Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#2AB3A6]">Utensils</h3>
                  <span className="text-lg font-semibold text-[#2AB3A6]">
                    {selectedUtensils.size}/
                    {recipes[currentRecipeIndex].utensils?.length || 0}
                  </span>
                </div>

                <div className="space-y-3">
                  {recipes[currentRecipeIndex].utensils?.map((utensil, idx) => {
                    const isSelected = selectedUtensils.has(idx);
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => handleUtensilToggle(idx)}
                      >
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={utensil.imageUrl}
                          alt={utensil.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallbackImage = getUtensilFallbackImage(utensil.name);
                            if (target.src !== fallbackImage) {
                              target.src = fallbackImage;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{utensil.name}</div>
                      </div>
                      <div className="flex-shrink-0">
                          {isSelected ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="#2AB3A6"/>
                          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t flex flex-col gap-2">
              <button
                onClick={() => {
                  setUtensilsModalOpen(false);
                  setCurrentRecipeIndex(null);
                }}
                className="w-full px-4 bg-white border-2 border-[#327179] text-[#327179] rounded-2xl font-medium"
                style={{ height: '56px' }}
              >
                Skip
              </button>
              <button
                onClick={() => {
                  if (currentRecipeIndex !== null) {
                    handleStartCooking(currentRecipeIndex);
                  }
                }}
                className="w-full px-4 bg-[#327179] text-white rounded-2xl font-medium hover:opacity-90 transition-colors"
                style={{ height: '56px' }}
              >
                Start cooking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

