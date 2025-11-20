/**
 * Feature Flags Configuration
 * 
 * Centralized feature toggles for the application.
 * These flags are controlled via environment variables in .env.local
 */

/**
 * Voice Input Feature
 * 
 * Controls voice recognition functionality across the app:
 * - Voice input button in chat interface
 * - Voice button on home page
 * - Voice instructions modal
 * - Speech recognition hooks
 * 
 * To enable/disable: Set NEXT_PUBLIC_ENABLE_VOICE_INPUT in .env.local
 * - Set to 'true' to enable voice features
 * - Set to 'false' to disable voice features
 */
export const ENABLE_VOICE_INPUT = process.env.NEXT_PUBLIC_ENABLE_VOICE_INPUT === 'true';

/**
 * Future feature flags can be added here
 * Examples:
 * export const ENABLE_VIDEO_RECIPES = process.env.NEXT_PUBLIC_ENABLE_VIDEO_RECIPES === 'true';
 * export const ENABLE_OFFLINE_MODE = process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true';
 */

