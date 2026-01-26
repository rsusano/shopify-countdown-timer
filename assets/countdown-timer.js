/**
 * Countdown Timer Component
 * A customizable countdown timer that counts down to a specified date/time
 */

class CountdownTimerComponent extends HTMLElement {
  constructor() {
    super();
    this.timerInterval = null;
    this.currentEndTime = null;
  }

  connectedCallback() {
    this.endDate = this.getAttribute('data-end-date');
    this.showDays = this.getAttribute('data-show-days') === 'true';
    this.showHours = this.getAttribute('data-show-hours') === 'true';
    this.showMinutes = this.getAttribute('data-show-minutes') === 'true';
    this.showSeconds = this.getAttribute('data-show-seconds') === 'true';
    this.expiredMessage = this.getAttribute('data-expired-message') || 'Sale has ended';
    this.hideWhenExpired = this.getAttribute('data-hide-when-expired') === 'true';
    
    // Restart options
    this.restartEnabled = this.getAttribute('data-restart-enabled') === 'true';
    this.restartDays = parseInt(this.getAttribute('data-restart-days') || '0') || 0;
    this.restartHours = parseInt(this.getAttribute('data-restart-hours') || '0') || 0;
    this.restartMinutes = parseInt(this.getAttribute('data-restart-minutes') || '0') || 0;
    this.restartSeconds = parseInt(this.getAttribute('data-restart-seconds') || '0') || 0;

    this.daysEl = this.querySelector('[data-days]');
    this.hoursEl = this.querySelector('[data-hours]');
    this.minutesEl = this.querySelector('[data-minutes]');
    this.secondsEl = this.querySelector('[data-seconds]');
    this.timerContent = this.querySelector('.countdown-timer__content');
    this.expiredContent = this.querySelector('.countdown-timer__expired');

    if (this.endDate) {
      this.currentEndTime = new Date(this.endDate).getTime();
      
      // If restart is enabled and the end date has already passed, calculate the next cycle
      if (this.restartEnabled) {
        this.initializeRestartCycle();
      }
      
      this.startCountdown();
    }
  }

  disconnectedCallback() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  /**
   * Calculate the restart duration in milliseconds
   */
  getRestartDuration() {
    return (
      ((this.restartDays || 0) * 24 * 60 * 60 * 1000) +
      ((this.restartHours || 0) * 60 * 60 * 1000) +
      ((this.restartMinutes || 0) * 60 * 1000) +
      ((this.restartSeconds || 0) * 1000)
    );
  }

  /**
   * Initialize the restart cycle if the original end date has passed
   */
  initializeRestartCycle() {
    const now = new Date().getTime();
    const restartDuration = this.getRestartDuration();
    
    if (restartDuration <= 0 || !this.currentEndTime) return;
    
    // If the end time has passed, calculate how many cycles have passed
    // and set the next end time
    if (this.currentEndTime < now) {
      const timeSinceEnd = now - this.currentEndTime;
      const cyclesPassed = Math.floor(timeSinceEnd / restartDuration);
      this.currentEndTime = this.currentEndTime + ((cyclesPassed + 1) * restartDuration);
    }
  }

  startCountdown() {
    this.updateCountdown();
    this.timerInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    const now = new Date().getTime();
    const distance = (this.currentEndTime || 0) - now;

    if (distance < 0) {
      this.handleExpired();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (this.daysEl && this.showDays) {
      this.daysEl.textContent = this.padNumber(days);
    }
    if (this.hoursEl && this.showHours) {
      this.hoursEl.textContent = this.padNumber(hours);
    }
    if (this.minutesEl && this.showMinutes) {
      this.minutesEl.textContent = this.padNumber(minutes);
    }
    if (this.secondsEl && this.showSeconds) {
      this.secondsEl.textContent = this.padNumber(seconds);
    }
  }

  /**
   * @param {number} num - The number to pad
   * @returns {string} - The padded number as a string
   */
  padNumber(num) {
    return num.toString().padStart(2, '0');
  }

  handleExpired() {
    // If restart is enabled, restart the timer
    if (this.restartEnabled) {
      const restartDuration = this.getRestartDuration();
      
      if (restartDuration > 0) {
        // Set new end time
        this.currentEndTime = new Date().getTime() + restartDuration;
        // Continue countdown (don't clear interval)
        return;
      }
    }
    
    // If not restarting, handle expiration normally
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    if (this.hideWhenExpired) {
      const section = this.closest('.countdown-timer-section');
      if (section) {
        section.remove();
      }
    } else if (this.timerContent && this.expiredContent) {
      /** @type {HTMLElement} */ (this.timerContent).style.display = 'none';
      /** @type {HTMLElement} */ (this.expiredContent).style.display = 'block';
    }
  }
}

if (!customElements.get('countdown-timer-component')) {
  customElements.define('countdown-timer-component', CountdownTimerComponent);
}
