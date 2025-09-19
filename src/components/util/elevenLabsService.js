// ElevenLabs TTS Service - Uses server-side API for speech generation

// Access levels configuration
const ACCESS_LEVELS = {
  FREE: {
    maxMonthlyCharacters: 10000,
    dailyLimit: 1000,
    voiceId: 'rPNcQ53R703tTmtue1AT', // Your custom voice
    model: 'eleven_turbo_v2_5',
    outputFormat: 'mp3_22050_32'
  },
  BASIC: {
    maxMonthlyCharacters: 30000,
    dailyLimit: 3000,
    voiceId: 'rPNcQ53R703tTmtue1AT', // Your custom voice
    model: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_64'
  },
  PREMIUM: {
    maxMonthlyCharacters: 100000,
    dailyLimit: 10000,
    voiceId: 'rPNcQ53R703tTmtue1AT', // Your custom voice
    model: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128'
  }
};

class ElevenLabsService {
  constructor() {
    this.currentAccessLevel = 'FREE';
    this.usage = {
      daily: 0,
      monthly: 0,
      lastReset: new Date().toDateString()
    };

    this.loadUsageFromStorage();
    // ElevenLabs service initialized
  }

  loadUsageFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('elevenLabsUsage');
        if (stored) {
          this.usage = JSON.parse(stored);

          // Reset daily usage if it's a new day
          const today = new Date().toDateString();
          if (this.usage.lastReset !== today) {
            this.usage.daily = 0;
            this.usage.lastReset = today;
            this.saveUsageToStorage();
          }
        }
      } catch (error) {
        // Error loading usage from storage
      }
    }
  }

  saveUsageToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('elevenLabsUsage', JSON.stringify(this.usage));
      } catch (error) {
        // Error saving usage to storage
      }
    }
  }

  setAccessLevel(level) {
    if (ACCESS_LEVELS[level]) {
      this.currentAccessLevel = level;
      // Access level set
    } else {
      // Invalid access level
    }
  }

  getCurrentLimits() {
    return ACCESS_LEVELS[this.currentAccessLevel];
  }

  canMakeRequest(textLength) {
    const limits = this.getCurrentLimits();

    // Check daily limit
    if (this.usage.daily + textLength > limits.dailyLimit) {
      return {
        canProceed: false,
        reason: 'daily_limit_exceeded',
        message: `Daily limit of ${limits.dailyLimit} characters exceeded`
      };
    }

    // Check monthly limit
    if (this.usage.monthly + textLength > limits.maxMonthlyCharacters) {
      return {
        canProceed: false,
        reason: 'monthly_limit_exceeded',
        message: `Monthly limit of ${limits.maxMonthlyCharacters} characters exceeded`
      };
    }

    return { canProceed: true };
  }

  updateUsage(textLength) {
    this.usage.daily += textLength;
    this.usage.monthly += textLength;
    this.saveUsageToStorage();
  }

  async generateSpeech(text, options = {}) {
    const textLength = text.length;
    const canProceed = this.canMakeRequest(textLength);

    if (!canProceed.canProceed) {
      // Request blocked
      throw new Error(canProceed.message);
    }

    const limits = this.getCurrentLimits();
    // Generating speech

    try {
      // Use server-side API endpoint instead of client-side SDK
      const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          accessLevel: this.currentAccessLevel,
          voiceId: options.voiceId || limits.voiceId,
          model: options.model || limits.model,
          outputFormat: options.outputFormat || limits.outputFormat,
          stability: options.stability || 0.5,
          similarityBoost: options.similarityBoost || 0.8,
          style: options.style || 0.5,
          useSpeakerBoost: options.useSpeakerBoost || true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBuffer = await response.arrayBuffer();
      // Speech generated successfully

      // Update usage after successful generation
      this.updateUsage(textLength);

      return audioBuffer;
    } catch (error) {
      // Error generating speech
      throw error;
    }
  }

  async playAudio(audioBuffer) {
    if (typeof window !== 'undefined' && window.Audio) {
      try {
        // Convert buffer to blob URL
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);

        // Return a promise that resolves when audio finishes playing
        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          audio.onerror = (error) => {
            URL.revokeObjectURL(audioUrl);
            reject(error);
          };

          audio.play().catch(reject);
        });
      } catch (error) {
        // Error playing audio
        throw error;
      }
    } else {
      throw new Error('Audio playback not supported in this environment');
    }
  }

  async speakText(text, options = {}) {
    try {
      const audio = await this.generateSpeech(text, options);
      await this.playAudio(audio);
      return true;
    } catch (error) {
      // Error in speakText
      throw error;
    }
  }

  getUsageStats() {
    const limits = this.getCurrentLimits();
    return {
      accessLevel: this.currentAccessLevel,
      daily: {
        used: this.usage.daily,
        limit: limits.dailyLimit,
        remaining: limits.dailyLimit - this.usage.daily,
        percentage: (this.usage.daily / limits.dailyLimit) * 100
      },
      monthly: {
        used: this.usage.monthly,
        limit: limits.maxMonthlyCharacters,
        remaining: limits.maxMonthlyCharacters - this.usage.monthly,
        percentage: (this.usage.monthly / limits.maxMonthlyCharacters) * 100
      }
    };
  }

  resetMonthlyUsage() {
    this.usage.monthly = 0;
    this.saveUsageToStorage();
  }

  // Fallback to Web Speech API if ElevenLabs fails or limits exceeded
  async fallbackToWebSpeech(text) {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = resolve;
        utterance.onerror = reject;

        window.speechSynthesis.speak(utterance);
      } else {
        reject(new Error('Speech synthesis not supported'));
      }
    });
  }

  // Smart speak method that tries ElevenLabs first, falls back to Web Speech API
  async smartSpeak(text, options = {}) {
    try {
      await this.speakText(text, options);
    } catch (error) {
      // ElevenLabs failed, falling back to Web Speech API
      try {
        await this.fallbackToWebSpeech(text);
      } catch (fallbackError) {
        // Both TTS methods failed
        throw new Error('All TTS methods failed');
      }
    }
  }
}

// Create singleton instance
const elevenLabsService = new ElevenLabsService();

export default elevenLabsService;
export { ACCESS_LEVELS };