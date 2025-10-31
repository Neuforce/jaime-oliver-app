'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { RecipeItem } from '../../types/chat';

interface RecipeAccordionProps {
  recipes: RecipeItem[];
  onExpandChange?: (isExpanded: boolean) => void;
}

export const RecipeAccordion: React.FC<RecipeAccordionProps> = ({ recipes, onExpandChange }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);

  const handleRecipeClick = (index: number) => {
    const newExpandedIndex = expandedIndex === index ? null : index;
    setExpandedIndex(newExpandedIndex);
    onExpandChange?.(newExpandedIndex !== null);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoModalOpen(true);
  };

  const getRandomImageUrl = (seed: number) => {
    // Generate a pseudo-random image URL based on seed
    const images = [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      'https://images.unsplash.com/photo-1476718406336-bb5a87a40793?w=400',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
    ];
    return images[seed % images.length];
  };

  return (
    <>
      <div className="mt-3 rounded-xl border border-gray-200 bg-white">
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
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{recipe.title}</div>
                      <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="9" stroke="#2AB3A6" strokeWidth="2"/>
                          <path d="M12 7v5l3 2" stroke="#2AB3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{recipe.duration}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <button
                        onClick={(e) => handlePlayClick(e)}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                        aria-label="Play video"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5v14l11-7z" fill="#2AB3A6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {/* Intro Text */}
                    {recipe.introText && (
                      <div className="text-sm text-gray-700 space-y-2 whitespace-pre-wrap">
                        {recipe.introText.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}

                    {/* Ingredients and Utensils Button */}
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11l3 3L22 4" stroke="#2AB3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#2AB3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-800">Ingredients and utensils</span>
                    </button>

                    {/* Recipe Steps */}
                    {recipe.steps && recipe.steps.length > 0 && (
                      <div className="space-y-3">
                        {recipe.steps.map((step, stepIdx) => (
                          <div key={stepIdx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                              {step.icon ? (
                                <Image
                                  src={step.icon}
                                  alt={step.title}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded"></div>
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
          <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full aspect-video max-w-7xl">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/FXnHPAYMENo?autoplay=1&mute=0&controls=1&rel=0&playsinline=1"
                title="Recipe Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
                style={{ minHeight: '315px' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

