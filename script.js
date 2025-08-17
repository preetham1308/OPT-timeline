class OPTPlanner {
  constructor() {
    try {
      this.form = document.getElementById('plannerForm');
      this.timelineResults = document.getElementById('timelineResults');
      this.loadingOverlay = document.getElementById('loadingOverlay');
      this.stemOptEndGroup = document.getElementById('stemOptEndGroup');
      this.stemTimeline = document.getElementById('stemTimeline');
      
      // Custom date picker properties
      this.currentDate = new Date();
      this.selectedDate = null;
      
      this.init();
    } catch (error) {
      console.warn('OPTPlanner initialization warning:', error.message);
      // Continue with basic functionality even if some elements are missing
    }
  }

  init() {
    try {
      this.bindEvents();
      this.setDefaultDates();
      this.animateNumbersOnLoad();
      this.addMobileEnhancements();
      this.initUSCISIntegration();
    } catch (error) {
      console.warn('OPTPlanner init warning:', error.message);
      // Try to initialize USCIS integration even if other parts fail
      try {
        this.initUSCISIntegration();
      } catch (uscisError) {
        console.warn('USCIS integration warning:', uscisError.message);
      }
    }
  }

  bindEvents() {
    try {
      if (this.form) {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
      }
      
      // Auto-calculate on date changes
      const graduationDate = document.getElementById('graduationDate');
      const isSTEM = document.getElementById('isSTEM');
      
      if (graduationDate) {
        graduationDate.addEventListener('change', () => this.autoCalculate());
      }
      
      if (isSTEM) {
        isSTEM.addEventListener('change', () => this.handleSTEMChange());
      }
      
      // Date preset buttons
      this.bindDatePresets();
    } catch (error) {
      console.warn('OPTPlanner bindEvents warning:', error.message);
    }
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
    console.log('🔧 Initializing USCIS Integration...');
    
    // Test if we can find the elements
    const uscisForm = document.getElementById('uscisForm');
    const testSandboxBtn = document.getElementById('testSandboxBtn');
    const receiptInput = document.getElementById('receiptNumber');
    
    console.log('📋 USCIS Form found:', uscisForm);
    console.log('🧪 Test Sandbox Button found:', testSandboxBtn);
    console.log('📝 Receipt Input found:', receiptInput);
    
    // Test if elements exist in DOM
    if (!uscisForm) {
      console.error('❌ USCIS Form not found!');
      return;
    }
    
    if (!testSandboxBtn) {
      console.error('❌ Test Sandbox Button not found!');
      return;
    }
    
    if (!receiptInput) {
      console.error('❌ Receipt Input not found!');
      return;
    }
    
    // USCIS API Configuration
    this.uscisConfig = {
      sandbox: {
        baseUrl: 'https://api-int.uscis.gov',
        caseStatusUrl: '/case-status',
        accessTokenUrl: '/oauth/accesstoken'
      },
      production: {
        baseUrl: 'https://api.uscis.gov',
        caseStatusUrl: '/case-status',
        accessTokenUrl: '/oauth/accesstoken'
      },
      // ⚠️ SECURITY WARNING: Credentials should NEVER be in client-side code
      // These are exposed in network tab and can be stolen by anyone
      // Use server-side proxy instead
      credentials: {
        // REMOVED FOR SECURITY - Use server-side proxy
        clientId: null,
        clientSecret: null
      },
      // Staging receipt numbers for testing
      sandboxCases: [
        // With hist_case_data in payloads
        'EAC9999103403', 'EAC9999103404', 'EAC9999103405', 'EAC9999103410', 'EAC9999103411', 
        'EAC9999103416', 'EAC9999103419', 'LIN9999106498', 'LIN9999106499', 'LIN9999106504', 
        'LIN9999106505', 'LIN9999106506', 'SRC9999102777', 'SRC9999102778', 'SRC9999102779', 
        'SRC9999102780', 'SRC9999102781', 'SRC9999102782', 'SRC9999102783', 'SRC9999102784', 
        'SRC9999102785', 'SRC9999102786', 'SRC9999102787', 'SRC9999132710', 'SRC9999132719',
        // Without hist_case_data in payloads
        'EAC9999103400', 'EAC9999103402', 'EAC9999103406', 'EAC9999103407', 'EAC9999103408', 
        'EAC9999103409', 'EAC9999103412', 'EAC9999103413', 'EAC9999103414', 'EAC9999103415', 
        'EAC9999103420', 'EAC9999103421', 'EAC9999103424', 'EAC9999103425', 'EAC9999103426', 
        'EAC9999103428', 'EAC9999103429', 'EAC9999103431', 'EAC9999103432', 'LIN9999106501', 
        'LIN9999106507', 'SRC9999132694', 'SRC9999132695', 'SRC9999132706', 'SRC9999132707'
      ]
    };
    
    console.log('⚙️ USCIS Config loaded:', this.uscisConfig);
    
    // Handle form submission
    uscisForm.addEventListener('submit', (e) => {
      console.log('📝 USCIS Form submitted');
      e.preventDefault();
      const receiptNumber = receiptInput.value.trim();
      console.log('🔍 Receipt Number:', receiptNumber);
      if (receiptNumber) {
        this.checkUSCISStatus(receiptNumber);
      }
    });
    
    // Test sandbox button
    testSandboxBtn.addEventListener('click', () => {
      console.log('🧪 Test Sandbox Button clicked');
      const randomCase = this.uscisConfig.sandboxCases[
        Math.floor(Math.random() * this.uscisConfig.sandboxCases.length)
      ];
      console.log('🎲 Random test case:', randomCase);
      receiptInput.value = randomCase;
      this.checkUSCISStatus(randomCase);
    });
    
    // Test if we can manually trigger a click
    console.log('🧪 Testing button click manually...');
    setTimeout(() => {
      console.log('🔄 Testing manual click in 2 seconds...');
      testSandboxBtn.click();
    }, 2000);
    
    console.log('✅ USCIS Integration initialized');
  }
  
  async checkUSCISStatus(receiptNumber) {
    console.log('🚀 Starting USCIS status check for:', receiptNumber);
    
    try {
      // Show loading state
      console.log('⏳ Showing loading state...');
      this.showUSCISLoading();
      
      // Validate receipt number format
      if (!this.isValidReceiptNumber(receiptNumber)) {
        throw new Error('Invalid receipt number format. Must be 13 characters (3 letters + 10 digits).');
      }
      
      // 🔒 SECURE: Call Cloudflare Worker instead of USCIS directly
      console.log('🔒 Making secure API call through Cloudflare Worker...');
      
      try {
        // Call your Cloudflare Worker (replace with your actual domain)
        const workerUrl = 'https://uscis-api-worker.abc-preethamreddy.workers.dev/';
        
        const response = await fetch(workerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiptNumber: receiptNumber
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Secure API call successful:', data);
          this.displayUSCISResults(data);
        } else {
          const errorData = await response.json();
          throw new Error(`Worker error: ${errorData.error || response.statusText}`);
        }
        
      } catch (workerError) {
        console.warn('⚠️ Cloudflare Worker not available:', workerError.message);
        
        // Show helpful error message
        if (workerError.message.includes('Failed to fetch')) {
          this.showUSCISError(
            '🔒 Cloudflare Worker not deployed yet. ' +
            'Please follow the deployment guide to set up secure USCIS API integration. ' +
            'Your credentials will be protected once deployed.'
          );
        } else {
          this.showUSCISError(
            `🔒 Worker Error: ${workerError.message}. ` +
            'Please check your Cloudflare Worker configuration.'
          );
        }
        
        // Track security event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'security_warning', {
            'event_category': 'security',
            'event_label': 'worker_not_deployed'
          });
        }
        
        return;
      }
      
      // Track API usage for analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'uscis_status_check', {
          'event_category': 'api_usage',
          'event_label': 'case_status_check',
          'value': receiptNumber
        });
      }
      
      console.log('✅ USCIS status check completed securely');
      
    } catch (error) {
      console.error('❌ USCIS API Error:', error);
      this.showUSCISError(`Security check failed: ${error.message}`);
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
  
  // ⚠️ SECURITY WARNING: USCIS API Integration
  // 
  // NEVER implement OAuth2 client credentials flow in browser-side JavaScript!
  // This exposes your API credentials in the network tab where anyone can steal them.
  // 
  // SECURE APPROACHES:
  // 1. Backend API Proxy (recommended)
  // 2. API Gateway (Cloudflare Workers, AWS API Gateway)
  // 3. Server-side authentication only
  // 
  // The methods below are for demonstration only and will show security warnings.
  
  async getUSCISAccessToken() {
    console.error('🚨 SECURITY VIOLATION: Attempting to get access token from browser');
    throw new Error('SECURITY: OAuth2 client credentials cannot be implemented in browser. Use server-side proxy.');
  }
  
  async callUSCISAPIDirect(receiptNumber) {
    console.error('🚨 SECURITY VIOLATION: Attempting to call USCIS API directly from browser');
    throw new Error('SECURITY: Direct API calls cannot be implemented in browser. Use server-side proxy.');
  }
  
  async testUSCISConnectivity() {
    console.error('🚨 SECURITY VIOLATION: Attempting to test USCIS connectivity from browser');
    throw new Error('SECURITY: API connectivity tests cannot be implemented in browser. Use server-side proxy.');
  }
  
  async testUSCISEndpoint() {
    console.error('🚨 SECURITY VIOLATION: Attempting to test USCIS endpoint from browser');
    throw new Error('SECURITY: Endpoint tests cannot be implemented in browser. Use server-side proxy.');
  }
  
  async analyzeUSCISAuthError() {
    console.error('🚨 SECURITY VIOLATION: Attempting to analyze USCIS auth errors from browser');
    throw new Error('SECURITY: Auth error analysis cannot be implemented in browser. Use server-side proxy.');
  }
  
  async testDirectAPIKeyAuth() {
    console.error('🚨 SECURITY VIOLATION: Attempting to test direct API key auth from browser');
    throw new Error('SECURITY: Direct API key tests cannot be implemented in browser. Use server-side proxy.');
  }

  // Essential methods for the secure implementation
  showUSCISLoading() {
    const results = document.getElementById('uscisResults');
    const statusBadge = document.getElementById('statusBadge');
    
    if (results && statusBadge) {
      results.classList.remove('hidden');
      statusBadge.textContent = 'Checking...';
      statusBadge.className = 'status-badge pending';
      
      // Show loading state in results
      const elements = ['resultReceiptNumber', 'resultStatus', 'resultLastUpdated', 'resultDescription'];
      elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = 'Loading...';
      });
    }
  }
  
  displayUSCISResults(data) {
    const statusBadge = document.getElementById('statusBadge');
    
    if (statusBadge) {
      // Update status badge with better status mapping
      let badgeText = 'Processing';
      let badgeClass = 'pending';
      
      if (data.status.includes('Approved')) {
        badgeText = 'Approved';
        badgeClass = 'success';
      } else if (data.status.includes('Received')) {
        badgeText = 'Received';
        badgeClass = 'pending';
      } else if (data.status.includes('Review')) {
        badgeText = 'Reviewing';
        badgeClass = 'pending';
      } else if (data.status.includes('Evidence')) {
        badgeText = 'RFE Sent';
        badgeClass = 'warning';
      } else if (data.status.includes('Denied')) {
        badgeText = 'Denied';
        badgeClass = 'rejected';
      } else if (data.status.includes('Completed')) {
        badgeText = 'Completed';
        badgeClass = 'success';
      }
      
      statusBadge.textContent = badgeText;
      statusBadge.className = `status-badge ${badgeClass}`;
    }
    
    // Update result fields
    const elements = {
      'resultReceiptNumber': data.receiptNumber,
      'resultStatus': data.status,
      'resultLastUpdated': data.lastUpdated,
      'resultDescription': data.description
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
    
    // Log the full response for debugging
    console.log('📊 Full API response:', data);
  }
  
  showUSCISError(message) {
    const results = document.getElementById('uscisResults');
    const statusBadge = document.getElementById('statusBadge');
    
    if (results && statusBadge) {
      results.classList.remove('hidden');
      statusBadge.textContent = 'Error';
      statusBadge.className = 'status-badge rejected';
      
      const elements = {
        'resultReceiptNumber': 'N/A',
        'resultStatus': 'Error',
        'resultLastUpdated': 'N/A',
        'resultDescription': message
      };
      
      Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
      });
    }
  }

  isValidReceiptNumber(receiptNumber) {
    // Remove any dashes and validate format
    const cleanReceipt = receiptNumber.replace(/-/g, '');
    
    // Check if it matches the required format: 3 letters + 10 digits
    const regex = /^[a-zA-Z]{3}[0-9]{10}$/;
    
    if (!regex.test(cleanReceipt)) {
      return false;
    }
    
    // Check if it's one of the valid staging receipt numbers
    return this.uscisConfig.sandboxCases.includes(cleanReceipt);
  }

  // Old conflicting functions removed - using new USCIS integration

  // Native date input is now used - no need for complex custom functions
}