/**
 * timer.js - Psychometric Test Timer
 * Manages the countdown timer, progress bar updates, page refresh safety, and auto-submit.
 */

const TimerManager = {
  intervalId: null,
  durationSeconds: 60 * 60, // 60 minutes default
  endTime: null,

  /**
   * Starts the countdown timer
   * @param {number} durationMinutes Duration in minutes
   * @param {function} onTick Callback triggered every second with (formattedTime, percentageRemaining)
   * @param {function} onTimeUp Callback triggered when time runs out
   */
  start(durationMinutes, onTick, onTimeUp) {
    this.durationSeconds = durationMinutes * 60;
    
    // Safety check: recover end time from sessionStorage if page refreshed
    const storedEndTime = sessionStorage.getItem('web_psikotes_timer_end');
    const now = new Date().getTime();

    if (storedEndTime) {
      this.endTime = parseInt(storedEndTime, 10);
      // If stored end time is in the past, trigger time up immediately
      if (this.endTime <= now) {
        if (onTimeUp) onTimeUp();
        return;
      }
    } else {
      this.endTime = now + (this.durationSeconds * 1000);
      sessionStorage.setItem('web_psikotes_timer_end', this.endTime.toString());
    }

    const tick = () => {
      const currentTime = new Date().getTime();
      const timeRemaining = Math.max(0, Math.floor((this.endTime - currentTime) / 1000));
      
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      
      // Formatting to MM:SS
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Percentage calculation (remaining progress)
      const percentage = (timeRemaining / this.durationSeconds) * 100;
      
      if (onTick) {
        onTick(formattedTime, percentage, timeRemaining);
      }

      if (timeRemaining <= 0) {
        this.stop();
        if (onTimeUp) onTimeUp();
      }
    };

    // Run first tick immediately
    tick();
    this.intervalId = setInterval(tick, 1000);
  },

  /**
   * Stop the timer interval
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },

  /**
   * Clear session timer state
   */
  clear() {
    this.stop();
    sessionStorage.removeItem('web_psikotes_timer_end');
  }
};
