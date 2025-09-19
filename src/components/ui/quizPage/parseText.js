// File: ./src/utils/parseText.js

import React from "react";

/**
 * Parses a string and handles both [[className]] patterns and HTML tags
 * @param {string} text - The text to parse
 * @returns {Array} - An array of React elements and strings
 */
const parseText = (text) => {
  if (!text) return text;
  
  // First, handle HTML span tags by removing them (they're empty anyway)
  let processedText = text.replace(/<span[^>]*><\/span>/g, '');
  
  // Then handle the [[className]] pattern
  const regex = /\[\[([a-zA-Z0-9]+)\]\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(processedText)) !== null) {
    // Push the text before the match
    if (match.index > lastIndex) {
      parts.push(processedText.substring(lastIndex, match.index));
    }

    // Extract the className from the match
    const className = match[1];

    // Push the <i> element
    parts.push(<i key={match.index} className={`signal ${className}`}></i>);

    // Update the lastIndex
    lastIndex = regex.lastIndex;
  }

  // Push the remaining text after the last match
  if (lastIndex < processedText.length) {
    parts.push(processedText.substring(lastIndex));
  }

  // If no matches were found, return the processed text as is
  if (parts.length === 0) {
    return processedText;
  }

  return parts;
};

export default parseText;
