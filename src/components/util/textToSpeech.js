// Unified Text-to-Speech utility for both web and mobile
import { TextToSpeech } from '@capacitor-community/text-to-speech';

class UnifiedTTS {
  constructor() {
    this.isPlaying = false;
    this.isMobile = false;
    this.speechSynthesis = null;
    this.currentUtterance = null;
    this.onStateChange = null;

    this.init();
  }

  async init() {
    // Check if we're in a mobile app environment
    this.isMobile = typeof window !== 'undefined' && (window.Capacitor || window.cordova);

    if (!this.isMobile && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  setStateChangeCallback(callback) {
    this.onStateChange = callback;
  }

  updateState(playing) {
    this.isPlaying = playing;
    if (this.onStateChange) {
      this.onStateChange(playing);
    }
  }

  async speak(text) {
    if (!text || text.trim() === '') return;

    // Stop any current speech
    await this.stop();

    try {
      if (this.isMobile) {
        // Use native TTS for mobile
        await this.speakNative(text);
      } else {
        // Use Web Speech API for web
        await this.speakWeb(text);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      this.updateState(false);
    }
  }

  async speakNative(text) {
    try {
      this.updateState(true);

      await TextToSpeech.speak({
        text: text,
        lang: 'ar-SA',
        rate: 0.8,
        pitch: 1.0,
        volume: 1.0,
        category: 'playback'
      });

      this.updateState(false);
    } catch (error) {
      console.error('Native TTS Error:', error);
      this.updateState(false);
      throw error;
    }
  }

  async speakWeb(text) {
    if (!this.speechSynthesis) {
      throw new Error('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      try {
        this.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          this.updateState(true);
        };

        utterance.onend = () => {
          this.updateState(false);
          resolve();
        };

        utterance.onerror = (event) => {
          this.updateState(false);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        this.currentUtterance = utterance;
        this.speechSynthesis.speak(utterance);
      } catch (error) {
        this.updateState(false);
        reject(error);
      }
    });
  }

  async stop() {
    try {
      if (this.isMobile) {
        await TextToSpeech.stop();
      } else if (this.speechSynthesis) {
        this.speechSynthesis.cancel();
      }
    } catch (error) {
      console.error('TTS Stop Error:', error);
    } finally {
      this.updateState(false);
    }
  }

  async toggle(text) {
    if (this.isPlaying) {
      await this.stop();
    } else {
      await this.speak(text);
    }
  }

  isSupported() {
    if (this.isMobile) {
      return true; // Native TTS is generally available on mobile
    } else {
      return typeof window !== 'undefined' && 'speechSynthesis' in window;
    }
  }

  getPlayingState() {
    return this.isPlaying;
  }
}

// Create a singleton instance
const ttsInstance = new UnifiedTTS();

export default ttsInstance;

// Export the class for testing purposes
export { UnifiedTTS };