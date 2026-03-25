/// <reference types="vite/client" />

declare module 'gifshot' {
  interface GifShotOptions {
    images: string[];
    interval?: number;
    gifWidth?: number;
    gifHeight?: number;
    numFrames?: number;
    sampleInterval?: number;
  }
  interface GifShotResult {
    error: boolean;
    image: string;
  }
  export function createGIF(
    options: GifShotOptions,
    callback: (result: GifShotResult) => void
  ): void;
}
