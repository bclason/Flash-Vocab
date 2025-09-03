import { useState, useMemo } from 'react';

/**
 * Custom hook for filtering cards by starred status
 * @param {Array} cards - Array of card objects
 * @returns {Object} - { filteredCards, practiceStarredOnly, togglePracticeStarred }
 */
export const useStarredFilter = (cards) => {
  const [practiceStarredOnly, setPracticeStarredOnly] = useState(false);

  const filteredCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    
    if (practiceStarredOnly) {
      // Handle both boolean true and SQLite integer 1
      const starredCards = cards.filter(card => card.starred === 1);
      console.log('Filtering to starred only:', starredCards);
      console.log('Cards starred status:', cards.map(c => ({ id: c.id, starred: c.starred })));
      return starredCards;
    }
    
    return cards;
  }, [cards, practiceStarredOnly]);

  const togglePracticeStarred = () => {
    setPracticeStarredOnly(prev => !prev);
  };

  return {
    filteredCards,
    practiceStarredOnly,
    togglePracticeStarred,
    starredCount: cards ? cards.filter(card => card.starred).length : 0,
    totalCount: cards ? cards.length : 0
  };
};
