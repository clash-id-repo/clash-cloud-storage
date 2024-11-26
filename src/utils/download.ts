export class ChunkDownloader {
    private chunkSize = 8 * 1024 * 1024; // 8MB chunks
    private maxConcurrentChunks = 10;
    private downloadedChunks: Map<number, Uint8Array> = new Map();
    private totalSize!: number;
    private downloadedSize = 0;
    private lastReportedProgress = 0;
    private abortController: AbortController;
    private startTime: number;
    private speedInterval: NodeJS.Timeout | null = null;
    private lastSpeedCheck = 0;
    private lastBytesDownloaded = 0;
    private isDownloading = true;
    private activeDownloads = new Set<number>();
  
    constructor(
      private url: string,
      private onProgress: (progress: number) => void,
      private onSpeed: (bytesPerSecond: number) => void,
      private onComplete: (blob: Blob) => void,
      private onError: (error: Error) => void
    ) {
      this.abortController = new AbortController();
      this.startTime = Date.now();
    }
  
    async start() {
      try {
        const response = await fetch(this.url, { method: 'HEAD' });
        this.totalSize = parseInt(response.headers.get('content-length') || '0');
        
        if (!this.totalSize) {
          throw new Error('Could not determine file size');
        }
  
        const totalChunks = Math.ceil(this.totalSize / this.chunkSize);
        this.startSpeedMonitoring();
  
        const downloadQueue = Array.from({ length: totalChunks }, (_, i) => i);
        const activeDownloads: Promise<void>[] = [];
  
        while (downloadQueue.length > 0 || activeDownloads.length > 0) {
          if (!this.isDownloading) break;
  
          while (downloadQueue.length > 0 && activeDownloads.length < this.maxConcurrentChunks) {
            const chunkIndex = downloadQueue.shift()!;
            const downloadPromise = this.downloadChunk(chunkIndex).finally(() => {
              const index = activeDownloads.indexOf(downloadPromise);
              if (index > -1) {
                activeDownloads.splice(index, 1);
              }
              this.activeDownloads.delete(chunkIndex);
            });
            
            activeDownloads.push(downloadPromise);
            this.activeDownloads.add(chunkIndex);
          }
  
          if (activeDownloads.length > 0) {
            await Promise.race(activeDownloads);
          }
        }
  
        if (this.isDownloading && this.downloadedSize === this.totalSize) {
          this.completeDownload();
        }
      } catch (error) {
        this.onError(error as Error);
      } finally {
        this.stopSpeedMonitoring();
      }
    }
  
    private startSpeedMonitoring() {
      this.lastSpeedCheck = Date.now();
      this.lastBytesDownloaded = 0;
  
      this.speedInterval = setInterval(() => {
        const now = Date.now();
        const timeDiff = (now - this.lastSpeedCheck) / 1000;
        const bytesDiff = this.downloadedSize - this.lastBytesDownloaded;
        const speed = Math.round(bytesDiff / timeDiff);
  
        this.lastSpeedCheck = now;
        this.lastBytesDownloaded = this.downloadedSize;
        this.onSpeed(speed);
      }, 1000);
    }
  
    private stopSpeedMonitoring() {
      if (this.speedInterval) {
        clearInterval(this.speedInterval);
        this.speedInterval = null;
      }
    }
  
    private updateProgress() {
      const progress = (this.downloadedSize / this.totalSize) * 100;
      // Only update if progress has increased
      if (progress > this.lastReportedProgress) {
        this.lastReportedProgress = progress;
        this.onProgress(progress);
      }
    }
  
    private async downloadChunk(index: number): Promise<void> {
      const start = index * this.chunkSize;
      const end = Math.min(start + this.chunkSize - 1, this.totalSize - 1);
  
      try {
        const response = await fetch(this.url, {
          headers: { Range: `bytes=${start}-${end}` },
          signal: this.abortController.signal
        });
  
        if (!response.ok) {
          throw new Error(`Failed to download chunk ${index}`);
        }
  
        const buffer = await response.arrayBuffer();
        if (this.isDownloading) {
          this.downloadedChunks.set(index, new Uint8Array(buffer));
          this.downloadedSize += buffer.byteLength;
          this.updateProgress();
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          throw error;
        }
      }
    }
  
    private completeDownload() {
      const sortedChunks = Array.from(this.downloadedChunks.entries())
        .sort(([a], [b]) => a - b)
        .map(([_, chunk]) => chunk);
  
      const blob = new Blob(sortedChunks);
      this.onComplete(blob);
      this.cleanup();
    }
  
    private cleanup() {
      this.downloadedChunks.clear();
      this.activeDownloads.clear();
      this.downloadedSize = 0;
      this.lastReportedProgress = 0;
      this.stopSpeedMonitoring();
    }
  
    stop() {
      this.isDownloading = false;
      this.abortController.abort();
      this.cleanup();
    }
  }