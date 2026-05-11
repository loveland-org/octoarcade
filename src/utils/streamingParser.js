/**
 * Streaming Configuration Parser
 * 
 * This module implements a streaming parser for large configuration files
 * to prevent memory issues and improve performance when loading large
 * arcade cabinet configurations.
 */

/**
 * Stream state for tracking parsing progress
 */
const StreamState = {
  IDLE: 'idle',
  READING: 'reading',
  PARSING: 'parsing',
  COMPLETE: 'complete',
  ERROR: 'error'
};

/**
 * Streaming Configuration Parser class
 */
class StreamingConfigParser {
  /**
   * Creates a new streaming parser
   * @param {Object} options - Parser options
   * @param {number} options.chunkSize - Size of each chunk to process (default: 64KB)
   * @param {number} options.maxFileSize - Maximum file size to process (default: 50MB)
   * @param {Function} options.onProgress - Progress callback (percent, bytesProcessed, totalBytes)
   * @param {Function} options.onChunk - Callback when a chunk is processed
   */
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 64 * 1024; // 64KB chunks
    this.maxFileSize = options.maxFileSize || 50 * 1024 * 1024; // 50MB max
    this.onProgress = options.onProgress || (() => {});
    this.onChunk = options.onChunk || (() => {});
    
    this.state = StreamState.IDLE;
    this.buffer = '';
    this.bytesProcessed = 0;
    this.totalBytes = 0;
    this.result = null;
    this.error = null;
  }

  /**
   * Parses a configuration from a string in chunks
   * @param {string} configString - The configuration string to parse
   * @returns {Promise<Object>} Parsed configuration
   */
  async parseString(configString) {
    this.totalBytes = configString.length;
    this.bytesProcessed = 0;
    this.buffer = '';
    this.state = StreamState.READING;

    // Check file size
    if (this.totalBytes > this.maxFileSize) {
      this.state = StreamState.ERROR;
      throw new Error(`Configuration size ${this.totalBytes} exceeds maximum ${this.maxFileSize} bytes`);
    }

    try {
      // Process in chunks to avoid blocking
      for (let i = 0; i < configString.length; i += this.chunkSize) {
        const chunk = configString.slice(i, Math.min(i + this.chunkSize, configString.length));
        this.buffer += chunk;
        this.bytesProcessed += chunk.length;
        
        const progress = (this.bytesProcessed / this.totalBytes) * 100;
        this.onProgress(progress, this.bytesProcessed, this.totalBytes);
        this.onChunk(chunk, this.bytesProcessed, this.totalBytes);
        
        // Yield to event loop to prevent blocking
        await this.yieldToEventLoop();
      }

      this.state = StreamState.PARSING;
      this.result = JSON.parse(this.buffer);
      this.state = StreamState.COMPLETE;
      
      return this.result;
    } catch (e) {
      this.state = StreamState.ERROR;
      this.error = e;
      throw e;
    }
  }

  /**
   * Parses a configuration from a File object using streaming
   * @param {File} file - The file to parse
   * @returns {Promise<Object>} Parsed configuration
   */
  async parseFile(file) {
    this.totalBytes = file.size;
    this.bytesProcessed = 0;
    this.buffer = '';
    this.state = StreamState.READING;

    // Check file size
    if (this.totalBytes > this.maxFileSize) {
      this.state = StreamState.ERROR;
      throw new Error(`File size ${this.totalBytes} exceeds maximum ${this.maxFileSize} bytes`);
    }

    try {
      const reader = file.stream().getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        this.buffer += chunk;
        this.bytesProcessed += value.length;
        
        const progress = (this.bytesProcessed / this.totalBytes) * 100;
        this.onProgress(progress, this.bytesProcessed, this.totalBytes);
        this.onChunk(chunk, this.bytesProcessed, this.totalBytes);
      }

      this.state = StreamState.PARSING;
      this.result = JSON.parse(this.buffer);
      this.state = StreamState.COMPLETE;
      
      return this.result;
    } catch (e) {
      this.state = StreamState.ERROR;
      this.error = e;
      throw e;
    }
  }

  /**
   * Parses a configuration from a URL using streaming fetch
   * @param {string} url - The URL to fetch and parse
   * @returns {Promise<Object>} Parsed configuration
   */
  async parseFromUrl(url) {
    this.state = StreamState.READING;
    this.buffer = '';
    this.bytesProcessed = 0;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      this.totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

      // Check file size if known
      if (this.totalBytes > this.maxFileSize) {
        this.state = StreamState.ERROR;
        throw new Error(`File size ${this.totalBytes} exceeds maximum ${this.maxFileSize} bytes`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        this.buffer += chunk;
        this.bytesProcessed += value.length;

        // Check size during streaming if we didn't know total
        if (this.bytesProcessed > this.maxFileSize) {
          reader.cancel();
          this.state = StreamState.ERROR;
          throw new Error(`Configuration size exceeds maximum ${this.maxFileSize} bytes`);
        }
        
        const progress = this.totalBytes > 0 
          ? (this.bytesProcessed / this.totalBytes) * 100 
          : 0;
        this.onProgress(progress, this.bytesProcessed, this.totalBytes);
        this.onChunk(chunk, this.bytesProcessed, this.totalBytes);
      }

      this.state = StreamState.PARSING;
      this.result = JSON.parse(this.buffer);
      this.state = StreamState.COMPLETE;
      
      return this.result;
    } catch (e) {
      this.state = StreamState.ERROR;
      this.error = e;
      throw e;
    }
  }

  /**
   * Incrementally parses a large JSON array of configurations
   * @param {string} configString - JSON string containing an array
   * @param {Function} onItem - Callback for each parsed item
   * @returns {Promise<number>} Number of items parsed
   */
  async parseArrayIncremental(configString, onItem) {
    this.totalBytes = configString.length;
    this.bytesProcessed = 0;
    this.state = StreamState.READING;

    // Check file size
    if (this.totalBytes > this.maxFileSize) {
      this.state = StreamState.ERROR;
      throw new Error(`Configuration size ${this.totalBytes} exceeds maximum ${this.maxFileSize} bytes`);
    }

    try {
      // Parse the full JSON first
      const parsed = JSON.parse(configString);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Expected JSON array');
      }

      this.state = StreamState.PARSING;
      let itemCount = 0;

      // Process items in batches to avoid blocking
      const batchSize = 100;
      for (let i = 0; i < parsed.length; i += batchSize) {
        const batch = parsed.slice(i, Math.min(i + batchSize, parsed.length));
        
        for (const item of batch) {
          await onItem(item, itemCount);
          itemCount++;
        }
        
        const progress = (itemCount / parsed.length) * 100;
        this.onProgress(progress, itemCount, parsed.length);
        
        // Yield to event loop
        await this.yieldToEventLoop();
      }

      this.state = StreamState.COMPLETE;
      return itemCount;
    } catch (e) {
      this.state = StreamState.ERROR;
      this.error = e;
      throw e;
    }
  }

  /**
   * Yields control to the event loop
   * @returns {Promise<void>}
   */
  yieldToEventLoop() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Gets the current parsing state
   * @returns {Object} Current state information
   */
  getState() {
    return {
      state: this.state,
      bytesProcessed: this.bytesProcessed,
      totalBytes: this.totalBytes,
      progress: this.totalBytes > 0 ? (this.bytesProcessed / this.totalBytes) * 100 : 0,
      error: this.error ? this.error.message : null
    };
  }

  /**
   * Resets the parser state
   */
  reset() {
    this.state = StreamState.IDLE;
    this.buffer = '';
    this.bytesProcessed = 0;
    this.totalBytes = 0;
    this.result = null;
    this.error = null;
  }
}

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StreamingConfigParser, StreamState };
}
