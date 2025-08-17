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
    this.initUSCISIntegration();
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
    
    // Set default date to today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    graduationInput.value = todayString;
    
    // Auto-calculate when date changes
    graduationInput.addEventListener('change', () => {
      this.autoCalculate();
    });
    
    // Mobile detection for logging
    const isMobile = () => {
      return window.innerWidth <= 768 || 
             /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    if (isMobile()) {
      console.log('Mobile device detected - Native date picker enabled');
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
      // If it's in the past, show how many days ago
      const daysAgo = Math.abs(data.daysUntilEarliest);
      if (daysAgo > 365) {
        const years = Math.floor(daysAgo / 365);
        const remainingDays = daysAgo % 365;
        earliestElement.textContent = `${years}y ${remainingDays}d ago`;
      } else if (daysAgo > 30) {
        const months = Math.floor(daysAgo / 30);
        const remainingDays = daysAgo % 30;
        earliestElement.textContent = `${months}m ${remainingDays}d ago`;
      } else {
        earliestElement.textContent = `${daysAgo}d ago`;
      }
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
      // If it's in the past, show how many days ago
      const daysAgo = Math.abs(data.daysUntilLatest);
      if (daysAgo > 365) {
        const years = Math.floor(daysAgo / 365);
        const remainingDays = daysAgo % 365;
        latestElement.textContent = `${years}y ${remainingDays}d ago`;
      } else if (daysAgo > 30) {
        const months = Math.floor(daysAgo / 30);
        const remainingDays = daysAgo % 30;
        latestElement.textContent = `${months}m ${remainingDays}d ago`;
      } else {
        latestElement.textContent = `${daysAgo}d ago`;
      }
      latestElement.style.color = 'var(--accent-danger)';
    }
  }

  animateTimelineItems() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
    });
  }

  initUSCISIntegration() {
    const uscisForm = document.getElementById('uscisForm');
    const testSandboxBtn = document.getElementById('testSandboxBtn');
    
    // USCIS API Configuration
    this.uscisConfig = {
      sandbox: {
        baseUrl: 'https://api-int.uscis.gov',
        caseStatusUrl: '/case-status',
        accessTokenUrl: '/oauth/accesstoken'
      },
      sandboxCases: [
        'EAC9999103403', 'EAC9999103404', 'EAC9999103405',
        'SRC9999102777', 'SRC9999102778', 'SRC9999102779',
        'LIN9999106498', 'LIN9999106499', 'LIN9999106504'
      ]
    };
    
    // Handle form submission
    uscisForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const receiptNumber = document.getElementById('receiptNumber').value.trim();
      if (receiptNumber) {
        this.checkUSCISStatus(receiptNumber);
      }
    });
    
    // Test sandbox button
    testSandboxBtn.addEventListener('click', () => {
      const randomCase = this.uscisConfig.sandboxCases[
        Math.floor(Math.random() * this.uscisConfig.sandboxCases.length)
      ];
      document.getElementById('receiptNumber').value = randomCase;
      this.checkUSCISStatus(randomCase);
    });
  }
  
  async checkUSCISStatus(receiptNumber) {
    try {
      // Show loading state
      this.showUSCISLoading();
      
      // For now, simulate API call with sandbox data
      // TODO: Replace with real USCIS API call when credentials are available
      const mockResponse = await this.simulateUSCISAPI(receiptNumber);
      
      // Display results
      this.displayUSCISResults(mockResponse);
      
      // Track API usage for analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'uscis_status_check', {
          'event_category': 'api_usage',
          'event_label': 'case_status_check',
          'value': receiptNumber
        });
      }
      
    } catch (error) {
      console.error('USCIS API Error:', error);
      this.showUSCISError('Failed to check case status. Please try again.');
    }
  }
  
  async simulateUSCISAPI(receiptNumber) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response based on receipt number pattern
    const mockResponses = {
      'EAC': {
        status: 'Case Was Received',
        description: 'Your Form I-765, Application for Employment Authorization, was received by USCIS.',
        lastUpdated: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      'SRC': {
        status: 'Case Is Being Actively Reviewed',
        description: 'USCIS is actively reviewing your Form I-765, Application for Employment Authorization.',
        lastUpdated: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      'LIN': {
        status: 'Request for Additional Evidence Was Sent',
        description: 'USCIS has sent a request for additional evidence for your Form I-765.',
        lastUpdated: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    };
    
    const prefix = receiptNumber.substring(0, 3);
    const response = mockResponses[prefix] || mockResponses['EAC'];
    
    return {
      receiptNumber,
      status: response.status,
      description: response.description,
      lastUpdated: response.lastUpdated,
      isSandbox: true
    };
  }
  
  showUSCISLoading() {
    const results = document.getElementById('uscisResults');
    const statusBadge = document.getElementById('statusBadge');
    
    results.classList.remove('hidden');
    statusBadge.textContent = 'Checking...';
    statusBadge.className = 'status-badge pending';
    
    // Show loading state in results
    document.getElementById('resultReceiptNumber').textContent = 'Loading...';
    document.getElementById('resultStatus').textContent = 'Loading...';
    document.getElementById('resultLastUpdated').textContent = 'Loading...';
    document.getElementById('resultDescription').textContent = 'Loading...';
  }
  
  displayUSCISResults(data) {
    const statusBadge = document.getElementById('statusBadge');
    
    // Update status badge
    statusBadge.textContent = data.status.includes('Received') ? 'Received' : 
                              data.status.includes('Review') ? 'Reviewing' : 
                              data.status.includes('Evidence') ? 'RFE Sent' : 'Processing';
    
    // Set badge color
    statusBadge.className = 'status-badge ' + (
      data.status.includes('Received') ? 'pending' :
      data.status.includes('Review') ? 'pending' :
      data.status.includes('Evidence') ? 'warning' : 'pending'
    );
    
    // Update result fields
    document.getElementById('resultReceiptNumber').textContent = data.receiptNumber;
    document.getElementById('resultStatus').textContent = data.status;
    document.getElementById('resultLastUpdated').textContent = data.lastUpdated;
    document.getElementById('resultDescription').textContent = data.description;
    
    // Add sandbox indicator if testing
    if (data.isSandbox) {
      const disclaimer = document.querySelector('.legal-disclaimer small');
      disclaimer.innerHTML = '🧪 Testing with USCIS Sandbox Data - Not Real Case';
    }
  }
  
  showUSCISError(message) {
    const results = document.getElementById('uscisResults');
    const statusBadge = document.getElementById('statusBadge');
    
    results.classList.remove('hidden');
    statusBadge.textContent = 'Error';
    statusBadge.className = 'status-badge rejected';
    
    document.getElementById('resultReceiptNumber').textContent = 'N/A';
    document.getElementById('resultStatus').textContent = 'Error';
    document.getElementById('resultLastUpdated').textContent = 'N/A';
    document.getElementById('resultDescription').textContent = message;
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

  // Native date input is now used - no need for complex custom functions
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