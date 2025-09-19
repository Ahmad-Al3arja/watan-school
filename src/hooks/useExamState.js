// Simple utility to check if we're on a quiz page
export function isOnQuizPage() {
  if (typeof window === 'undefined') return false;
  
  const path = window.location.pathname;
  // Check if we're on any quiz page (teoria routes with numbers or 'random')
  return /^\/teoria\/[^\/]+\/[^\/]+\/(\d+|random)/.test(path);
}

// Export for backward compatibility
export function getExamActiveState() {
  return isOnQuizPage();
}
