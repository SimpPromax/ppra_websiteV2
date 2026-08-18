// in-memory-queue.js
//http://localhost:5000/api/advisory/queue-status
// ============================================
// SIMPLE IN-MEMORY QUEUE FOR EMAIL PROCESSING
// ============================================

class InMemoryQueue {
  constructor(concurrency = 3) {
    this.queue = [];
    this.processing = new Map();
    this.waiting = [];
    this.completed = [];
    this.failed = [];
    this.concurrency = concurrency;
    this.currentlyProcessing = 0;
    this.jobCounter = 0;
    this.isProcessing = false;
    this.processor = null;
    this.isProcessingJobs = false; // Add flag to prevent multiple processing loops
  }

  add(data) {
    const jobId = ++this.jobCounter;
    const job = {
      id: jobId,
      data: data,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null
    };
    
    this.waiting.push(job);
    this.queue.push(job);
    
    console.log(`📋 [Queue] Job ${jobId} added (${this.waiting.length} waiting)`);
    
    // Start processing if not already running
    if (this.isProcessing && !this.isProcessingJobs) {
      console.log('🔄 [Queue] Triggering processing...');
      this.processNext();
    }
    
    return jobId;
  }

  startProcessing(processor) {
    this.processor = processor;
    this.isProcessing = true;
    this.isProcessingJobs = true;
    console.log(`🔄 Queue processor started with ${this.concurrency} workers`);
    
    // Start processing immediately
    this.processNext();
  }

  async processNext() {
    // Don't process if not running
    if (!this.isProcessing) {
      console.log('⏸️ [Queue] Processor not running, skipping');
      return;
    }
    
    // Check if we have capacity
    if (this.currentlyProcessing >= this.concurrency) {
      console.log(`⏸️ [Queue] At capacity (${this.currentlyProcessing}/${this.concurrency}), waiting...`);
      return;
    }
    
    // Check if there are waiting jobs
    if (this.waiting.length === 0) {
      console.log('⏸️ [Queue] No jobs waiting');
      this.isProcessingJobs = false;
      return;
    }

    // Get next job
    const job = this.waiting.shift();
    this.currentlyProcessing++;
    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    this.processing.set(job.id, job);

    console.log(`🔄 [Queue] Processing job ${job.id} (${this.currentlyProcessing}/${this.concurrency} active)`);

    try {
      // Process the job
      const result = await this.processor(job.data);
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.result = result;
      this.completed.push(job);
      console.log(`✅ [Queue] Job ${job.id} completed successfully`);
    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date().toISOString();
      job.error = error.message;
      this.failed.push(job);
      console.error(`❌ [Queue] Job ${job.id} failed:`, error.message);
    } finally {
      this.processing.delete(job.id);
      this.currentlyProcessing--;
      
      // Process next job - continue processing until queue is empty
      if (this.waiting.length > 0) {
        console.log(`🔄 [Queue] ${this.waiting.length} jobs waiting, continuing...`);
        this.processNext();
      } else {
        this.isProcessingJobs = false;
        console.log('✅ [Queue] All jobs processed');
      }
    }
  }

  getStatus() {
    return {
      waiting: this.waiting.length,
      processing: this.currentlyProcessing,
      completed: this.completed.length,
      failed: this.failed.length,
      total: this.queue.length,
      concurrency: this.concurrency,
      isProcessing: this.isProcessing,
      isProcessingJobs: this.isProcessingJobs
    };
  }

  getWaitingCount() {
    return this.waiting.length;
  }

  getProcessingCount() {
    return this.currentlyProcessing;
  }

  getCompletedCount() {
    return this.completed.length;
  }

  getFailedCount() {
    return this.failed.length;
  }

  getJob(jobId) {
    for (const job of this.waiting) {
      if (job.id === jobId) return job;
    }
    
    if (this.processing.has(jobId)) {
      return this.processing.get(jobId);
    }
    
    for (const job of this.completed) {
      if (job.id === jobId) return job;
    }
    
    for (const job of this.failed) {
      if (job.id === jobId) return job;
    }
    
    return null;
  }

  clearCompleted() {
    this.completed = [];
    console.log('🧹 [Queue] Cleared completed jobs');
  }

  retryFailed() {
    const failedJobs = [...this.failed];
    this.failed = [];
    
    for (const job of failedJobs) {
      const newJob = {
        ...job,
        id: ++this.jobCounter,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
        result: null,
        error: null
      };
      this.waiting.push(newJob);
      this.queue.push(newJob);
      console.log(`🔄 [Queue] Retrying job ${job.id} as ${newJob.id}`);
    }
    
    if (this.waiting.length > 0) {
      this.isProcessingJobs = true;
      this.processNext();
    }
  }

  shutdown() {
    this.isProcessing = false;
    this.isProcessingJobs = false;
    console.log('🛑 [Queue] Shutting down...');
    console.log(`📊 Final status: Waiting: ${this.waiting.length}, Processing: ${this.currentlyProcessing}, Completed: ${this.completed.length}, Failed: ${this.failed.length}`);
  }
}

module.exports = { InMemoryQueue };