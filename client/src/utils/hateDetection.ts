
/**
 * A simple mock hate speech detection utility
 * In a real application, this would integrate with an AI service
 */

// List of words that might indicate problematic content
const sensitiveWords = [
  'hate',
  'stupid',
  'idiot',
  'dumb',
  'loser',
  'ugly',
  'terrible',
  'racist',
  'sexist',
  'offensive',
  'disgusting',
  'awful',
  'nasty',
  'horrible',
  // Add more words as needed
];

export interface HateSpeechResult {
  isHateSpeech: boolean;
  confidence: number;
  reason?: string;
}

/**
 * Checks text for potential hate speech using a basic keyword matching
 * This is a very simple implementation and not suitable for production
 * A real implementation would use ML/AI models
 */
export function detectHateSpeech(text: string): HateSpeechResult {
  if (!text) {
    return { isHateSpeech: false, confidence: 0 };
  }
  
  const lowerText = text.toLowerCase();
  const foundWords = sensitiveWords.filter(word => lowerText.includes(word));
  
  // Calculate confidence based on number of found words and their context
  if (foundWords.length > 0) {
    // More sophisticated calculation that considers word count
    const textLength = lowerText.split(' ').length;
    const wordDensity = foundWords.length / textLength;
    const confidence = Math.min(0.3 + (wordDensity * 2) + (foundWords.length * 0.15), 0.95);
    
    return {
      isHateSpeech: confidence > 0.3,
      confidence,
      reason: `Detected sensitive language: ${foundWords.join(', ')}` 
    };
  }
  
  return { isHateSpeech: false, confidence: 0 };
}
