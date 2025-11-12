'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { RecipeItem } from '../../types/chat';

interface RecipeAccordionProps {
  recipes: RecipeItem[];
  onExpandChange?: (isExpanded: boolean) => void;
  onRecipeSelected?: (recipeTitle: string | null) => void;
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

export const RecipeAccordion: React.FC<RecipeAccordionProps> = ({ recipes, onExpandChange, onRecipeSelected }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [ingredientsModalOpen, setIngredientsModalOpen] = useState<boolean>(false);
  const [utensilsModalOpen, setUtensilsModalOpen] = useState<boolean>(false);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState<number | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [selectedUtensils, setSelectedUtensils] = useState<Set<number>>(new Set());

  const handleRecipeClick = (index: number) => {
    const newExpandedIndex = expandedIndex === index ? null : index;
    setExpandedIndex(newExpandedIndex);
    onExpandChange?.(newExpandedIndex !== null);
    // Notify parent about selected recipe
    if (newExpandedIndex !== null) {
      onRecipeSelected?.(recipes[newExpandedIndex].title);
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
                    <button className="w-full px-4 py-3 bg-[#2AB3A6] text-white rounded-lg font-medium hover:bg-[#239e92] transition-colors">
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
                            target.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400';
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
                            target.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400';
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
                  setUtensilsModalOpen(false);
                  setCurrentRecipeIndex(null);
                  // TODO: Continue with first step of recipe
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

