interface ProcessEnv {
  API_KEY?: string;
  BASE_URL?: string;
  MODEL?: string;
}

interface Process {
  env: ProcessEnv;
}

declare const process: Process;

declare module 'lunar-javascript';
