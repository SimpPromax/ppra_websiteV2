// email-queue.js
// ============================================
// BULL QUEUE FOR EMAIL PROCESSING (Redis-based)
// Optional - requires Redis server
// ============================================

const Bull = require('bull');

// Only initialize if Redis is available
let emailQueue = null;
let isRedisAvailable = false;

try {
  // Check if we should use Redis
  if (process.env.USE_REDIS === 'true') {
    emailQueue = new Bull('email-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
      },
      limiter: {
        max: 10, // 10 emails per
        duration: 1000 // second
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    // Queue event listeners
    emailQueue.on('completed', (job, result) => {
      console.log(`✅ [Bull] Job ${job.id} completed`);
    });

    emailQueue.on('failed', (job, err) => {
      console.error(`❌ [Bull] Job ${job.id} failed:`, err.message);
    });

    emailQueue.on('error', (error) => {
      console.error('❌ [Bull] Queue error:', error);
    });

    isRedisAvailable = true;
    console.log('✅ Bull queue initialized with Redis');
  } else {
    console.log('ℹ️ Bull queue disabled (Redis not configured)');
  }
} catch (error) {
  console.log('ℹ️ Bull queue unavailable (Redis not running)');
}

/**
 * Get queue status
 */
async function queueStatus() {
  if (!isRedisAvailable || !emailQueue) {
    return {
      available: false,
      message: 'Queue not available'
    };
  }

  try {
    const [waiting, active, completed, failed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount()
    ]);

    return {
      available: true,
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed
    };
  } catch (error) {
    console.error('Error getting queue status:', error);
    return {
      available: false,
      error: error.message
    };
  }
}

module.exports = { emailQueue, queueStatus, isRedisAvailable };