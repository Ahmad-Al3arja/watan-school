import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amrbreijieh1.app',
  appName: 'مدرسة الوطن',
  webDir: 'out',
  androidScheme: 'https',
  server: {
    allowNavigation: ['https://www.mot.gov.ps/*']
  }
};

export default config;
