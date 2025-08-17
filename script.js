class OPTPlanner {
  constructor() {
    this.form = document.getElementById('plannerForm');
    this.timelineResults = document.getElementById('timelineResults');
    this.checkStatusBtn = document.getElementById('checkStatusBtn');
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.stemOptEndGroup = document.getElementById('stemOptEndGroup');
    this.stemTimeline = document.getElementById('stemTimeline');
    
    // Custom date picker properties
    this.currentDate = new Date();
    this.selectedDate = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setDefaultDates();
    this.animateNumbersOnLoad();
    this.addMobileEnhancements();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    this.checkStatusBtn.addEventListener('click', () => this.checkUSCISStatus());
    
    // Auto-calculate on date changes
    document.getElementById('graduationDate').addEventListener('change', () => this.autoCalculate());
    document.getElementById('isSTEM').addEventListener('change', () => this.handleSTEMChange());
    
    // Date preset buttons
    this.bindDatePresets();
  }

  bindDatePresets() {
    // Graduation date presets
    const graduationPresets = document.querySelectorAll('#dateDisplay + .date-presets .date-preset');
    graduationPresets.forEach(preset => {
      preset.addEventListener('click', () => {
        const days = parseInt(preset.dataset.days);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        
        // Update hidden input
        const formattedDate = targetDate.toISOString().split('T')[0];
        document.getElementById('graduationDate').value = formattedDate;
        
        // Update display
        const dateDisplay = document.getElementById('dateDisplay');
        const dateText = dateDisplay.querySelector('.date-text');
        const displayDate = targetDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        dateText.textContent = displayDate;
        dateText.classList.add('has-date');
        
        // Update active state
        graduationPresets.forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        
        this.autoCalculate();
      });
    });

    // STEM OPT end date presets
    const stemPresets = document.querySelectorAll('#stemDateDisplay + .date-presets .date-preset');
    stemPresets.forEach(preset => {
      preset.addEventListener('click', () => {
        const days = parseInt(preset.dataset.days);
        const graduationDate = document.getElementById('graduationDate').value;
        
        if (graduationDate) {
          const gradDate = new Date(graduationDate);
          const targetDate = new Date(gradDate);
          targetDate.setDate(targetDate.getDate() + days);
          
          // Update hidden input
          const formattedDate = targetDate.toISOString().split('T')[0];
          document.getElementById('stemOptEndDate').value = formattedDate;
          
          // Update display
          const stemDateDisplay = document.getElementById('stemDateDisplay');
          const stemDateText = stemDateDisplay.querySelector('.date-text');
          const displayDate = targetDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
          stemDateText.textContent = displayDate;
          stemDateText.classList.add('has-date');
          
          // Update active state
          stemPresets.forEach(p => p.classList.remove('active'));
          preset.classList.add('active');
          
          this.autoCalculate();
        }
      });
    });

    // Initialize custom date picker
    this.initCustomDatePicker();
  }

  initCustomDatePicker() {
    const graduationInput = document.getElementById('graduationDate');
    const customPicker = document.getElementById('customGraduationPicker');
    const dateDisplay = document.getElementById('dateDisplay');
    const dateText = dateDisplay.querySelector('.date-text');
    const openDatePickerBtn = document.getElementById('openDatePicker');
    
    // Mobile detection
    const isMobile = () => {
      return window.innerWidth <= 768 || 
             /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    // Initialize date selector
    this.initializeDateSelector();
    
    // Show custom picker when button is clicked
    openDatePickerBtn.addEventListener('click', () => {
      // Track date picker open
      if (typeof gtag !== 'undefined') {
        gtag('event', 'date_picker_open', {
          'event_category': 'engagement',
          'event_label': 'graduation_date'
        });
      }
      
      customPicker.style.display = 'block';
      
      // Prevent body scroll on mobile
      if (isMobile()) {
        document.body.classList.add('date-picker-open');
      }
    });

    // Close picker when close button is clicked
    document.getElementById('closeDatePicker').addEventListener('click', () => {
      customPicker.style.display = 'none';
      if (isMobile()) {
        document.body.classList.remove('date-picker-open');
      }
    });

    // Set date when Set Date button is clicked
    document.getElementById('setDateBtn').addEventListener('click', () => {
      const month = parseInt(document.getElementById('monthSelect').value);
      const day = parseInt(document.getElementById('daySelect').value);
      const year = parseInt(document.getElementById('yearSelect').value);
      
      if (day && year) {
        const selectedDate = new Date(year, month, day);
        this.selectedDate = selectedDate;
        this.updateDateInput(this.selectedDate);
        
        // Track successful date selection
        if (typeof gtag !== 'undefined') {
          gtag('event', 'date_selected', {
            'event_category': 'engagement',
            'event_label': 'graduation_date',
            'value': selectedDate.toISOString().split('T')[0]
          });
        }
        
        customPicker.style.display = 'none';
        
        if (isMobile()) {
          document.body.classList.remove('date-picker-open');
        }
      }
    });

    // Today button functionality
    document.getElementById('todayBtn').addEventListener('click', () => {
      const today = new Date();
      this.selectedDate = today;
      this.updateDateInput(this.selectedDate);
      this.setDateSelectorValues(today);
      customPicker.style.display = 'none';
      
      if (isMobile()) {
        document.body.classList.remove('date-picker-open');
      }
    });

    // Hide picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!customPicker.contains(e.target) && e.target !== openDatePickerBtn) {
        customPicker.style.display = 'none';
        if (isMobile()) {
          document.body.classList.remove('date-picker-open');
        }
      }
    });

    // Additional mobile close handlers
    if (isMobile()) {
      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && customPicker.style.display === 'block') {
          customPicker.style.display = 'none';
          document.body.classList.remove('date-picker-open');
        }
      });
      
      // Close on touch outside (mobile specific)
      document.addEventListener('touchstart', (e) => {
        if (!customPicker.contains(e.target) && e.target !== openDatePickerBtn) {
          customPicker.style.display = 'none';
          document.body.classList.remove('date-picker-open');
        }
      });
    }
    
    // Mobile test - log mobile status
    if (isMobile()) {
      console.log('Mobile device detected - Simple date selector enabled');
      customPicker.style.display = 'none';
    }
  }

  isNativeDatePickerWorking() {
    // Test if native date picker is visible and functional
    const testInput = document.createElement('input');
    testInput.type = 'date';
    testInput.style.position = 'absolute';
    testInput.style.left = '-9999px';
    document.body.appendChild(testInput);
    
    let isWorking = false;
    try {
      testInput.focus();
      // If we can focus and the picker appears, it's working
      isWorking = true;
    } catch (e) {
      isWorking = false;
    }
    
    document.body.removeChild(testInput);
    return isWorking;
  }

  bindCustomPickerEvents() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    const todayBtn = document.getElementById('todayBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    prevBtn.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCustomCalendar();
    });
    
    nextBtn.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCustomCalendar();
    });
    
    todayBtn.addEventListener('click', () => {
      this.selectedDate = new Date();
      this.updateDateInput(this.selectedDate);
      customPicker.style.display = 'none';
      // Restore body scroll on mobile
      if (window.innerWidth <= 768) {
        document.body.classList.remove('date-picker-open');
      }
    });
    
    clearBtn.addEventListener('click', () => {
      this.selectedDate = null;
      document.getElementById('graduationDate').value = '';
      customPicker.style.display = 'none';
      // Restore body scroll on mobile
      if (window.innerWidth <= 768) {
        document.body.classList.remove('date-picker-open');
      }
    });
  }

  renderCustomCalendar() {
    const monthSpan = document.getElementById('currentMonth');
    const daysContainer = document.getElementById('pickerDays');
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    monthSpan.textContent = this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    
    // Clear previous days
    daysContainer.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Render calendar grid
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayElement = document.createElement('div');
      dayElement.className = 'picker-day';
      dayElement.textContent = date.getDate();
      
      // Add appropriate classes
      if (date.getMonth() !== month) {
        dayElement.classList.add('other-month');
      }
      
      if (this.isToday(date)) {
        dayElement.classList.add('today');
      }
      
      if (this.selectedDate && this.isSameDate(date, this.selectedDate)) {
        dayElement.classList.add('selected');
      }
      
      // Add click event
      dayElement.addEventListener('click', () => {
        if (date.getMonth() === month) {
          this.selectedDate = date;
          this.updateDateInput(this.selectedDate);
          customPicker.style.display = 'none';
          this.renderCustomCalendar();
          // Restore body scroll on mobile
          if (window.innerWidth <= 768) {
            document.body.classList.remove('date-picker-open');
          }
        }
      });
      
      daysContainer.appendChild(dayElement);
    }
  }

  isToday(date) {
    const today = new Date();
    return this.isSameDate(date, today);
  }

  isSameDate(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  updateDateInput(date) {
    const formattedDate = date.toISOString().split('T')[0];
    const graduationDate = document.getElementById('graduationDate');
    const dateDisplay = document.getElementById('dateDisplay');
    const dateText = dateDisplay.querySelector('.date-text');
    
    // Update hidden input
    graduationDate.value = formattedDate;
    
    // Update display text
    const displayDate = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    dateText.textContent = displayDate;
    dateText.classList.add('has-date');
    
    // Trigger calculation
    this.autoCalculate();
  }

  handleSTEMChange() {
    const isSTEM = document.getElementById('isSTEM').value === 'yes';
    
    if (isSTEM) {
      this.stemOptEndGroup.style.display = 'block';
      // Set default OPT end date (1 year after graduation)
      const graduationDate = document.getElementById('graduationDate').value;
      if (graduationDate) {
        const gradDate = new Date(graduationDate);
        const optEndDate = new Date(gradDate);
        optEndDate.setDate(optEndDate.getDate() + 365);
        document.getElementById('stemOptEndDate').value = optEndDate.toISOString().split('T')[0];
      }
    } else {
      this.stemOptEndGroup.style.display = 'none';
      document.getElementById('stemOptEndDate').value = '';
      this.stemTimeline.classList.add('hidden');
    }
    
    this.autoCalculate();
  }

  setDefaultDates() {
    // Set default graduation date to 3 months from now
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 3);
    
    const formattedDate = defaultDate.toISOString().split('T')[0];
    const graduationDate = document.getElementById('graduationDate');
    const dateDisplay = document.getElementById('dateDisplay');
    const dateText = dateDisplay.querySelector('.date-text');
    
    // Update hidden input
    graduationDate.value = formattedDate;
    
    // Update display
    const displayDate = defaultDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    dateText.textContent = displayDate;
    dateText.classList.add('has-date');
    
    // Trigger STEM change handler to set up initial state
    this.handleSTEMChange();
  }

  animateNumbersOnLoad() {
    // Animate floating background numbers
    const floatingNumbers = document.querySelectorAll('.floating-number');
    floatingNumbers.forEach((number, index) => {
      setTimeout(() => {
        number.classList.add('animate-in');
      }, index * 200);
    });

    // Animate header stat numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat, index) => {
      setTimeout(() => {
        this.animateNumber(stat, 0, parseInt(stat.dataset.target), 1500);
      }, index * 300 + 1000);
    });
  }

  animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;
    
    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (difference * easeOutQuart));
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };
    
    requestAnimationFrame(updateNumber);
  }

  addMobileEnhancements() {
    // Add touch feedback for mobile
    const buttons = document.querySelectorAll('.btn, .date-preset');
    buttons.forEach(btn => {
      btn.addEventListener('touchstart', () => {
        btn.style.transform = 'scale(0.95)';
      });
      
      btn.addEventListener('touchend', () => {
        btn.style.transform = '';
      });
    });

    // Smooth scroll for mobile
    if ('scrollBehavior' in document.documentElement.style) {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    
    // Track form submission
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        'event_category': 'engagement',
        'event_label': 'timeline_calculation'
      });
    }
    
    this.calculateTimeline();
    this.showTimelineResults();
  }

  autoCalculate() {
    const graduationDate = document.getElementById('graduationDate').value;
    if (graduationDate) {
      this.calculateTimeline();
      if (!this.timelineResults.classList.contains('hidden')) {
        this.updateTimelineResults();
      }
    }
  }

  calculateTimeline() {
    const graduationDate = new Date(document.getElementById('graduationDate').value + 'T00:00:00');
    const isSTEM = document.getElementById('isSTEM').value === 'yes';
    const stemOptEndDate = document.getElementById('stemOptEndDate').value;
    
    // Calculate OPT timeline based on current USCIS regulations
    const timeline = this.calculateOPTTimeline(graduationDate, isSTEM, stemOptEndDate);
    
    // Store results for display
    this.timelineData = timeline;
  }

  calculateOPTTimeline(graduationDate, isSTEM, stemOptEndDate) {
    const timeline = {
      graduation: graduationDate,
      earliestFiling: this.addDays(graduationDate, -90),
      latestFiling: this.addDays(graduationDate, 60),
      optStartWindow: {
        from: graduationDate,
        to: this.addDays(graduationDate, 60)
      },
      optDuration: isSTEM ? 24 : 12,
      isSTEM: isSTEM
    };

    // Calculate STEM extension timeline if applicable
    if (isSTEM) {
      // If OPT end date is provided, use it; otherwise calculate default
      if (stemOptEndDate) {
        timeline.optEnd = new Date(stemOptEndDate + 'T00:00:00');
      } else {
        // Default: 1 year after graduation
        timeline.optEnd = this.addDays(graduationDate, 365);
      }
      
      // STEM extension filing window: 90 days before OPT expires
      timeline.stemFilingWindow = {
        from: this.addDays(timeline.optEnd, -90),
        to: timeline.optEnd
      };
      
      // Total OPT period (standard + STEM extension)
      timeline.totalOptPeriod = {
        from: graduationDate,
        to: timeline.optEnd
      };
    }

    // Calculate countdown days
    const today = new Date();
    timeline.daysUntilEarliest = this.daysBetween(today, timeline.earliestFiling);
    timeline.daysUntilLatest = this.daysBetween(today, timeline.latestFiling);

    return timeline;
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / oneDay);
  }

  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateShort(date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatDateRange(from, to) {
    return `${this.formatDateShort(from)} → ${this.formatDateShort(to)}`;
  }

  showTimelineResults() {
    this.timelineResults.classList.remove('hidden');
    this.updateTimelineResults();
    
    // Smooth scroll to results
    setTimeout(() => {
      this.timelineResults.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  updateTimelineResults() {
    if (!this.timelineData) return;

    const data = this.timelineData;

    // Update timeline dates
    document.getElementById('earliestFiling').textContent = this.formatDate(data.earliestFiling);
    document.getElementById('latestFiling').textContent = this.formatDate(data.latestFiling);
    document.getElementById('startWindow').textContent = this.formatDateRange(data.optStartWindow.from, data.optStartWindow.to);
    
    // Update OPT duration
    const durationElement = document.getElementById('optDuration');
    const durationTextElement = document.getElementById('optDurationText');
    
    if (data.optDuration === 24) {
      durationElement.textContent = '24 months';
      durationTextElement.textContent = 'STEM extension eligible';
    } else {
      durationElement.textContent = '12 months';
      durationTextElement.textContent = 'Standard OPT period';
    }

    // Show/hide STEM timeline
    if (data.isSTEM) {
      this.stemTimeline.classList.remove('hidden');
      
      // Update STEM timeline
      if (data.stemFilingWindow) {
        document.getElementById('stemFilingWindow').textContent = this.formatDateRange(
          data.stemFilingWindow.from, 
          data.stemFilingWindow.to
        );
      }
      
      if (data.totalOptPeriod) {
        document.getElementById('totalOptPeriod').textContent = this.formatDateRange(
          data.totalOptPeriod.from, 
          data.totalOptPeriod.to
        );
      }
    } else {
      this.stemTimeline.classList.add('hidden');
    }

    // Update countdown
    this.updateCountdown(data);
    
    // Add animation to timeline items
    this.animateTimelineItems();
  }

  updateCountdown(data) {
    const earliestElement = document.getElementById('daysUntilEarliest');
    const latestElement = document.getElementById('daysUntilLatest');

    // Update earliest filing countdown
    if (data.daysUntilEarliest > 0) {
      earliestElement.textContent = data.daysUntilEarliest;
      earliestElement.style.color = data.daysUntilEarliest <= 30 ? 'var(--accent-warning)' : 'var(--accent-primary)';
    } else if (data.daysUntilEarliest === 0) {
      earliestElement.textContent = 'Today!';
      earliestElement.style.color = 'var(--accent-success)';
    } else {
      earliestElement.textContent = Math.abs(data.daysUntilEarliest);
      earliestElement.style.color = 'var(--accent-danger)';
    }

    // Update latest filing countdown
    if (data.daysUntilLatest > 0) {
      latestElement.textContent = data.daysUntilLatest;
      latestElement.style.color = data.daysUntilLatest <= 30 ? 'var(--accent-warning)' : 'var(--accent-primary)';
    } else if (data.daysUntilLatest === 0) {
      latestElement.textContent = 'Today!';
      latestElement.style.color = 'var(--accent-success)';
    } else {
      latestElement.textContent = Math.abs(data.daysUntilLatest);
      latestElement.style.color = 'var(--accent-danger)';
    }
  }

  animateTimelineItems() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
    });
  }

  async checkUSCISStatus() {
    const receiptNumber = document.getElementById('receiptNumber').value.trim();
    
    if (!receiptNumber) {
      this.showError('Please enter a receipt number');
      return;
    }

    if (receiptNumber.length < 10 || receiptNumber.length > 13) {
      this.showError('Receipt number should be 10-13 characters');
      return;
    }

    this.showLoading();
    
    try {
      // Simulate USCIS API call (in real implementation, this would call the actual USCIS API)
      const status = await this.simulateUSCISAPI(receiptNumber);
      this.displayUSCISResults(status);
    } catch (error) {
      this.showError('Failed to check status. Please try again.');
      console.error('USCIS API Error:', error);
    } finally {
      this.hideLoading();
    }
  }

  async simulateUSCISAPI(receiptNumber) {
    // This is a simulation - in production, you would make a real API call to USCIS
    // Note: USCIS doesn't provide a public API, so this is for demonstration purposes
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different statuses based on receipt number
        const statuses = [
          {
            receiptNumber: receiptNumber,
            formType: 'I-765',
            currentStatus: 'Case Was Received',
            lastUpdated: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            statusBadge: 'Received'
          },
          {
            receiptNumber: receiptNumber,
            formType: 'I-765',
            currentStatus: 'Case Is Being Actively Reviewed',
            lastUpdated: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            statusBadge: 'Reviewing'
          },
          {
            receiptNumber: receiptNumber,
            formType: 'I-765',
            currentStatus: 'Request for Additional Evidence Was Mailed',
            lastUpdated: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            statusBadge: 'RFE'
          }
        ];
        
        // Randomly select a status for demonstration
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        resolve(randomStatus);
      }, 2000); // Simulate network delay
    });
  }

  displayUSCISResults(status) {
    const resultsDiv = document.getElementById('uscisResults');
    const statusBadge = document.getElementById('statusBadge');
    
    // Update status badge color based on status
    statusBadge.textContent = status.statusBadge;
    statusBadge.className = 'status-badge';
    
    if (status.statusBadge === 'Received') {
      statusBadge.style.background = 'var(--accent-info)';
    } else if (status.statusBadge === 'Reviewing') {
      statusBadge.style.background = 'var(--accent-warning)';
    } else if (status.statusBadge === 'RFE') {
      statusBadge.style.background = 'var(--accent-danger)';
    }
    
    // Update other fields
    document.getElementById('displayReceiptNumber').textContent = status.receiptNumber;
    document.getElementById('formType').textContent = status.formType;
    document.getElementById('currentStatus').textContent = status.currentStatus;
    document.getElementById('lastUpdated').textContent = status.lastUpdated;
    
    // Show results
    resultsDiv.classList.remove('hidden');
    
    // Scroll to results
    setTimeout(() => {
      resultsDiv.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  showLoading() {
    this.loadingOverlay.classList.remove('hidden');
    this.checkStatusBtn.disabled = true;
    this.checkStatusBtn.innerHTML = '<span class="btn-text">Checking...</span><span class="btn-icon">⏳</span>';
  }

  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
    this.checkStatusBtn.disabled = false;
    this.checkStatusBtn.innerHTML = '<span class="btn-text">Check Status</span><span class="btn-icon">🔍</span>';
  }

  showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
        <button class="error-close">×</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-danger);
      color: white;
      padding: 16px 20px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      transform: translateX(400px);
      transition: var(--transition);
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification);
    }, 5000);

    // Close button functionality
    notification.querySelector('.error-close').addEventListener('click', () => {
      this.removeNotification(notification);
    });
  }

  removeNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  initializeDateSelector() {
    // Populate year selector (current year + 10 years)
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year <= currentYear + 10; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
    
    // Set current year as default
    yearSelect.value = currentYear;
    
    // Populate day selector
    this.updateDaySelector();
    
    // Set current month as default
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.value = new Date().getMonth();
    
    // Update days when month changes
    monthSelect.addEventListener('change', () => {
      this.updateDaySelector();
    });
    
    // Update days when year changes
    yearSelect.addEventListener('change', () => {
      this.updateDaySelector();
    });
  }
  
  updateDaySelector() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const daySelect = document.getElementById('daySelect');
    
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    // Clear existing days
    daySelect.innerHTML = '';
    
    // Get number of days in selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add day options
    for (let day = 1; day <= daysInMonth; day++) {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = day;
      daySelect.appendChild(option);
    }
    
    // Set current day as default
    const currentDay = new Date().getDate();
    if (currentDay <= daysInMonth) {
      daySelect.value = currentDay;
    }
  }
  
  setDateSelectorValues(date) {
    const monthSelect = document.getElementById('monthSelect');
    const daySelect = document.getElementById('daySelect');
    const yearSelect = document.getElementById('yearSelect');
    
    monthSelect.value = date.getMonth();
    yearSelect.value = date.getFullYear();
    
    // Update days for the selected month/year
    this.updateDaySelector();
    
    // Set the day
    daySelect.value = date.getDate();
  }
}

// Initialize the planner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OPTPlanner();
  
  // Add some additional mobile enhancements
  if ('ontouchstart' in window) {
    // Add touch-specific styles
    document.body.classList.add('touch-device');
    
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  // Add intersection observer for animations
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all panels for animation
    document.querySelectorAll('.input-panel, .timeline-section, .uscis-section, .info-section').forEach(panel => {
      observer.observe(panel);
    });
  }
});

// Add CSS for error notifications and additional styles
const style = document.createElement('style');
style.textContent = `
  .error-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .error-icon {
    font-size: 1.2rem;
  }
  
  .error-message {
    flex: 1;
    font-weight: 500;
  }
  
  .error-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: var(--transition);
  }
  
  .error-close:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .animate-in {
    animation: slideInUp 0.6s ease-out;
  }
  
  .touch-device .btn:active,
  .touch-device .date-preset:active {
    transform: scale(0.95);
  }
  
  /* Additional animations for timeline items */
  .timeline-item {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }
  
  .timeline-item.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Hover effects for interactive elements */
  .timeline-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  
  .stat-item:hover .stat-number {
    transform: scale(1.1);
  }
  
  /* Focus styles for accessibility */
  .btn:focus,
  input:focus,
  select:focus,
  .date-preset:focus {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }
  
  /* Form actions spacing */
  .form-actions {
    margin-top: 20px;
  }
`;
document.head.appendChild(style); 