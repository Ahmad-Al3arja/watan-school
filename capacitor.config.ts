import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ahmadarja1.app',
  appName: 'مدرسة الوطن',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // For live reload development - use network IP instead of localhost
    url: 'http://192.168.1.23:3000',
    cleartext: true
  }
};

export default config;
