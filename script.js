class OPTPlanner {
  constructor() {
    this.selectedDate = null;
    this.selectedStemDate = null;
    this.currentDate = new Date();
    this.stemCurrentDate = new Date();
    this.init();
  }

  init() {
    try {
    this.bindEvents();
      this.initDatePicker();
      this.initUSCISRedirect();
      console.log('✅ OPTPlanner initialized successfully');
    } catch (error) {
      console.error('❌ OPTPlanner initialization failed:', error);
    }
  }

  bindEvents() {
    const form = document.getElementById('plannerForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    const graduationDate = document.getElementById('graduationDate');
    if (graduationDate) {
      graduationDate.addEventListener('change', (e) => this.handleDateChange(e));
    }

    const isSTEM = document.getElementById('isSTEM');
    if (isSTEM) {
      isSTEM.addEventListener('change', (e) => this.handleSTEMChange(e));
    }

    // Add direct click handler to Calculate Timeline button as backup
    const calculateBtn = document.querySelector('button[type="submit"]');
    if (calculateBtn) {
      calculateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCalculateClick();
      });
    }
  }

  initDatePicker() {
    const dateTriggerBtn = document.getElementById('dateTriggerBtn');
    const customPicker = document.getElementById('customDatePicker');
    
    if (!dateTriggerBtn || !customPicker) return;

    // Show/hide date picker
    dateTriggerBtn.addEventListener('click', () => {
      const isActive = customPicker.classList.contains('active');
      if (!isActive) {
        customPicker.classList.add('active');
        dateTriggerBtn.setAttribute('aria-expanded', 'true');
        this.renderCustomCalendar();
      } else {
        customPicker.classList.remove('active');
        dateTriggerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!customPicker.contains(e.target) && !dateTriggerBtn.contains(e.target)) {
        customPicker.classList.remove('active');
        dateTriggerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
      if (customPicker.classList.contains('active')) {
        if (e.key === 'Escape') {
          customPicker.classList.remove('active');
          dateTriggerBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Navigation buttons
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    const todayBtn = document.getElementById('todayBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCustomCalendar();
    });
    }
    
    if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCustomCalendar();
    });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentDate = new Date();
        this.renderCustomCalendar();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.selectedDate = null;
        const graduationDate = document.getElementById('graduationDate');
        if (graduationDate) graduationDate.value = '';
        customPicker.classList.remove('active');
        this.updateDateDisplay();
      });
    }

    // Initialize STEM date picker
    this.initSTEMDatePicker();
  }

  initSTEMDatePicker() {
    const stemDateTriggerBtn = document.getElementById('stemDateTriggerBtn');
    const stemCustomPicker = document.getElementById('stemCustomDatePicker');
    
    if (!stemDateTriggerBtn || !stemCustomPicker) {
      return;
    }

    // Show/hide STEM date picker
    stemDateTriggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isActive = stemCustomPicker.classList.contains('active');
      
      if (!isActive) {
        stemCustomPicker.classList.add('active');
        stemDateTriggerBtn.setAttribute('aria-expanded', 'true');
        this.renderSTEMCustomCalendar();
      } else {
        stemCustomPicker.classList.remove('active');
        stemDateTriggerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close STEM picker when clicking outside
    document.addEventListener('click', (e) => {
      if (stemCustomPicker.classList.contains('active') && 
          !stemCustomPicker.contains(e.target) && 
          !stemDateTriggerBtn.contains(e.target)) {
        stemCustomPicker.classList.remove('active');
        stemDateTriggerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close STEM picker when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && stemCustomPicker.classList.contains('active')) {
        stemCustomPicker.classList.remove('active');
        stemDateTriggerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Keyboard navigation support for STEM picker
    document.addEventListener('keydown', (e) => {
      if (stemCustomPicker.classList.contains('active')) {
        if (e.key === 'Escape') {
          stemCustomPicker.classList.remove('active');
          stemDateTriggerBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // STEM Navigation buttons
    const stemPrevBtn = document.getElementById('stemPrevMonth');
    const stemNextBtn = document.getElementById('stemNextMonth');
    const stemTodayBtn = document.getElementById('stemTodayBtn');
    const stemClearBtn = document.getElementById('stemClearBtn');
    
    if (stemPrevBtn) {
      stemPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.stemCurrentDate.setMonth(this.stemCurrentDate.getMonth() - 1);
        this.renderSTEMCustomCalendar();
      });
    }
    
    if (stemNextBtn) {
      stemNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.stemCurrentDate.setMonth(this.stemCurrentDate.getMonth() + 1);
        this.renderSTEMCustomCalendar();
      });
    }

    if (stemTodayBtn) {
      stemTodayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.stemCurrentDate = new Date();
        this.renderSTEMCustomCalendar();
      });
    }

    if (stemClearBtn) {
      stemClearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectedStemDate = null;
        const stemOptEndDate = document.getElementById('stemOptEndDate');
        if (stemOptEndDate) stemOptEndDate.value = '';
        stemCustomPicker.classList.remove('active');
        this.updateSTEMDateDisplay();
      });
    }

    // Add close button functionality
    const stemCloseBtn = document.getElementById('stemCloseBtn');
    if (stemCloseBtn) {
      stemCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stemCustomPicker.classList.remove('active');
        stemDateTriggerBtn.setAttribute('aria-expanded', 'false');
      });
    }
  }

  initUSCISRedirect() {
    const uscisForm = document.getElementById('uscisForm');
    const receiptInput = document.getElementById('receiptNumber');

    if (!uscisForm || !receiptInput) {
      console.warn('⚠️ USCIS form elements not found');
      return;
    }

    // Simple USCIS redirect - no complex integration needed
    console.log('✅ USCIS redirect initialized');
    
    // Handle form submission - redirect to official USCIS site with copied receipt
    uscisForm.addEventListener('submit', async (e) => {
      console.log('📝 USCIS Form submitted - redirecting to official site');
      e.preventDefault();
      const receiptNumber = receiptInput.value.trim();
      if (receiptNumber) {
        try {
          // Copy receipt number to clipboard
          await navigator.clipboard.writeText(receiptNumber);
          console.log('📋 Receipt number copied to clipboard:', receiptNumber);
          
          // Show success message
          this.showCopySuccess(receiptNumber);
          
          // Redirect to official USCIS case status checker
          const uscisUrl = `https://egov.uscis.gov/casestatus/landing.do`;
          console.log('🔗 Redirecting to:', uscisUrl);
          window.open(uscisUrl, '_blank');
        } catch (error) {
          console.error('❌ Failed to copy to clipboard:', error);
          // Still redirect even if copy fails
          const uscisUrl = `https://egov.uscis.gov/casestatus/landing.do`;
          window.open(uscisUrl, '_blank');
        }
      }
    });
    

    
    console.log('✅ USCIS redirect setup complete');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    this.handleCalculateClick();
  }

  handleCalculateClick() {
    const graduationDate = document.getElementById('graduationDate');
    const isSTEM = document.getElementById('isSTEM');
    const stemOptEndDate = document.getElementById('stemOptEndDate');
    
    if (!isSTEM) {
      return;
    }

    const stemExtension = isSTEM.value === 'yes';
    
    if (stemExtension) {
      // For STEM extension: Use OPT end date to calculate STEM filing window
      if (!stemOptEndDate || !stemOptEndDate.value) {
        alert('Please select your current OPT end date for STEM extension planning');
        return;
      }
      
      const optEndDate = new Date(stemOptEndDate.value);
      if (isNaN(optEndDate.getTime())) {
        alert('Please select a valid OPT end date');
        return;
      }
      
      this.calculateSTEMTimeline(optEndDate);
      
    } else {
      // For standard OPT: Use graduation date
      if (!graduationDate || !graduationDate.value) {
        alert('Please select a graduation date for standard OPT planning');
        return;
      }
      
      const date = new Date(graduationDate.value);
      if (isNaN(date.getTime())) {
        alert('Please select a valid graduation date');
        return;
      }
      
      this.calculateTimeline(date, false);
    }
  }

  handleDateChange(e) {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      this.updateDateDisplay(date);
    }
  }

  handleSTEMChange(e) {
    const stemOptEndGroup = document.getElementById('stemOptEndGroup');
    const graduationDateGroup = document.getElementById('graduationDateGroup');
    
    if (stemOptEndGroup && graduationDateGroup) {
      const isSTEM = e.target.value === 'yes';
      
      // Show/hide STEM OPT end date group
      stemOptEndGroup.style.display = isSTEM ? 'block' : 'none';
      
      // Show/hide graduation date group (only needed for standard OPT)
      graduationDateGroup.style.display = isSTEM ? 'none' : 'block';
      
      // Clear STEM date if switching from STEM to standard
      if (!isSTEM) {
        this.selectedStemDate = null;
        const stemOptEndDate = document.getElementById('stemOptEndDate');
        if (stemOptEndDate) stemOptEndDate.value = '';
        this.updateSTEMDateDisplay();
        
        // Hide STEM timeline
        const stemTimeline = document.getElementById('stemTimeline');
        if (stemTimeline) stemTimeline.classList.add('hidden');
      }
    }
  }

  updateDateDisplay(date) {
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
      const dateText = dateDisplay.querySelector('.date-text');
      if (dateText) {
        dateText.textContent = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
  }

  calculateTimeline(graduationDate, stemExtension) {
    const results = document.getElementById('timelineResults');
    if (!results) {
      return;
    }

    // Calculate key dates
    const earliestFiling = new Date(graduationDate);
    earliestFiling.setDate(earliestFiling.getDate() - 90);

    const latestFiling = new Date(graduationDate);
    latestFiling.setDate(latestFiling.getDate() + 60);

    const optStart = new Date(graduationDate);
    let optEnd = new Date(graduationDate);
    
    // Calculate OPT duration: 12 months for standard, 36 months total for STEM (12 + 24)
    if (stemExtension) {
      // For STEM: 12 months standard OPT + 24 months extension = 36 months total
      optEnd.setDate(optEnd.getDate() + (12 * 30) + (24 * 30)); // Approximate months to days
      
      // If STEM OPT end date is provided, use that for more accurate STEM filing window
      const stemOptEndDate = document.getElementById('stemOptEndDate');
      if (stemOptEndDate && stemOptEndDate.value) {
        const stemEndDate = new Date(stemOptEndDate.value);
        if (!isNaN(stemEndDate.getTime())) {
          // Calculate STEM filing window based on actual OPT end date
          const stemFilingStart = new Date(stemEndDate);
          stemFilingStart.setDate(stemFilingStart.getDate() - 90);
          
          console.log('📅 STEM OPT End Date provided:', stemEndDate.toLocaleDateString());
          console.log('📅 STEM Filing Window:', stemFilingStart.toLocaleDateString(), 'to', stemEndDate.toLocaleDateString());
        }
      }
    } else {
      // For standard OPT: 12 months
      optEnd.setDate(optEnd.getDate() + (12 * 30)); // Approximate months to days
    }

    const stemFilingStart = new Date(optEnd);
    stemFilingStart.setDate(stemFilingStart.getDate() - 90);

    // Calculate days remaining
    const today = new Date();
    const daysUntilEarliest = Math.ceil((earliestFiling - today) / (1000 * 60 * 60 * 24));
    const daysUntilLatest = Math.ceil((latestFiling - today) / (1000 * 60 * 60 * 24));

    // Update display
    this.updateTimelineDisplay({
      earliestFiling,
      latestFiling,
      optStart,
      optEnd,
      stemFilingStart,
      daysUntilEarliest,
      daysUntilLatest,
      stemExtension
    });

    results.classList.remove('hidden');
  }

  calculateSTEMTimeline(optEndDate) {
    const results = document.getElementById('timelineResults');
    if (!results) {
      return;
    }
    
    // Calculate STEM extension timeline based on OPT end date
    const stemFilingStart = new Date(optEndDate);
    stemFilingStart.setDate(stemFilingStart.getDate() - 90); // 90 days before OPT expires
    
    const stemExtensionEnd = new Date(optEndDate);
    stemExtensionEnd.setDate(stemExtensionEnd.getDate() + (24 * 30)); // Add 24 months
    
    // Calculate days remaining
    const today = new Date();
    const daysUntilStemFiling = Math.ceil((stemFilingStart - today) / (1000 * 60 * 60 * 24));
    const daysUntilOptExpires = Math.ceil((optEndDate - today) / (1000 * 60 * 60 * 24));
    
    // Update display
    this.updateSTEMTimelineDisplay({
      optEndDate,
      stemFilingStart,
      stemExtensionEnd,
      daysUntilStemFiling,
      daysUntilOptExpires
    });
    
    results.classList.remove('hidden');
  }

  updateSTEMTimelineDisplay(dates) {
    
    // Update timeline dates for STEM extension
    const earliestFiling = document.getElementById('earliestFiling');
    const latestFiling = document.getElementById('latestFiling');
    const startWindow = document.getElementById('startWindow');
    const startWindowText = document.getElementById('startWindowText');
    const optDuration = document.getElementById('optDuration');
    const optDurationText = document.getElementById('optDurationText');

    if (earliestFiling) earliestFiling.textContent = dates.stemFilingStart.toLocaleDateString();
    if (latestFiling) latestFiling.textContent = dates.optEndDate.toLocaleDateString();
    
    // Update OPT Start Window - for STEM, this is the current OPT end date
    if (startWindow) {
      startWindow.textContent = dates.optEndDate.toLocaleDateString();
    }
    if (startWindowText) {
      startWindowText.textContent = `Your current OPT end date`;
    }
    
    // Update OPT Duration - STEM extension adds 24 months
    if (optDuration) {
      optDuration.textContent = '24 months (STEM extension)';
    }
    if (optDurationText) {
      optDurationText.textContent = `Additional time with STEM extension: 24 months`;
    }

    // Update Time Remaining countdown for STEM filing
    const daysUntilEarliest = document.getElementById('daysUntilEarliest');
    const daysUntilLatest = document.getElementById('daysUntilLatest');
    
    if (daysUntilEarliest) {
      if (dates.daysUntilStemFiling > 0) {
        daysUntilEarliest.textContent = dates.daysUntilStemFiling;
      } else if (dates.daysUntilStemFiling === 0) {
        daysUntilEarliest.textContent = 'Today!';
      } else {
        daysUntilEarliest.textContent = 'Past due';
      }
    }
    
    if (daysUntilLatest) {
      if (dates.daysUntilOptExpires > 0) {
        daysUntilLatest.textContent = dates.daysUntilOptExpires;
      } else if (dates.daysUntilOptExpires === 0) {
        daysUntilLatest.textContent = 'Today!';
      } else {
        daysUntilLatest.textContent = 'Past due';
      }
    }
    
    // Update current time display
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    if (currentTimeDisplay) {
      const now = new Date();
      const timeString = now.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
      currentTimeDisplay.textContent = timeString;
    }

    // Show STEM timeline section
    const stemTimeline = document.getElementById('stemTimeline');
    if (stemTimeline) {
      stemTimeline.classList.remove('hidden');
      
      // Update STEM timeline dates
      const stemFilingWindow = document.getElementById('stemFilingWindow');
      const totalOptPeriod = document.getElementById('totalOptPeriod');
      
      if (stemFilingWindow) {
        stemFilingWindow.textContent = `${dates.stemFilingStart.toLocaleDateString()} - ${dates.optEndDate.toLocaleDateString()}`;
      }
      
      if (totalOptPeriod) {
        totalOptPeriod.textContent = '24 months (STEM extension)';
      }
    }

    // Update calendar buttons with STEM dates
    this.updateCalendarButtons({
      earliestFiling: dates.stemFilingStart,
      latestFiling: dates.optEndDate,
      optStart: dates.optEndDate,
      optEnd: dates.stemExtensionEnd,
      stemExtension: true
    });
  }

  updateTimelineDisplay(dates) {
    // Update countdown numbers
    const daysBefore = document.getElementById('daysBefore');
    const daysAfter = document.getElementById('daysAfter');
    const monthsOPT = document.getElementById('monthsOPT');

    if (daysBefore) daysBefore.textContent = Math.max(0, dates.daysUntilEarliest);
    if (daysAfter) daysAfter.textContent = Math.max(0, dates.daysUntilLatest);
    if (monthsOPT) monthsOPT.textContent = dates.stemExtension ? '24' : '12';

    // Update timeline dates
    const earliestFiling = document.getElementById('earliestFiling');
    const latestFiling = document.getElementById('latestFiling');
    const startWindow = document.getElementById('startWindow');
    const startWindowText = document.getElementById('startWindowText');
    const optDuration = document.getElementById('optDuration');
    const optDurationText = document.getElementById('optDurationText');

    if (earliestFiling) earliestFiling.textContent = dates.earliestFiling.toLocaleDateString();
    if (latestFiling) latestFiling.textContent = dates.latestFiling.toLocaleDateString();
    
    // Update OPT Start Window with earliest possible start date
    if (startWindow) {
      startWindow.textContent = dates.optStart.toLocaleDateString();
    }
    if (startWindowText) {
      startWindowText.textContent = `Earliest date you can begin working on OPT`;
    }
    
    // Update OPT Duration
    if (optDuration) {
      optDuration.textContent = dates.stemExtension ? '36 months' : '12 months';
    }
    if (optDurationText) {
      optDurationText.textContent = `Total time you can work on OPT: ${dates.stemExtension ? '36 months' : '12 months'}`;
    }

    // Update Time Remaining countdown
    const daysUntilEarliest = document.getElementById('daysUntilEarliest');
    const daysUntilLatest = document.getElementById('daysUntilLatest');
    
    if (daysUntilEarliest) {
      if (dates.daysUntilEarliest > 0) {
        daysUntilEarliest.textContent = dates.daysUntilEarliest;
      } else if (dates.daysUntilEarliest === 0) {
        daysUntilEarliest.textContent = 'Today!';
      } else {
        daysUntilEarliest.textContent = 'Past due';
      }
    }
    
    if (daysUntilLatest) {
      if (dates.daysUntilLatest > 0) {
        daysUntilLatest.textContent = dates.daysUntilLatest;
      } else if (dates.daysUntilLatest === 0) {
        daysUntilLatest.textContent = 'Today!';
      } else {
        daysUntilLatest.textContent = 'Past due';
      }
    }
    
    // Update current time display
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    if (currentTimeDisplay) {
      const now = new Date();
      const timeString = now.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
      currentTimeDisplay.textContent = timeString;
    }

    // Update STEM extension section
    const stemOptEndGroup = document.getElementById('stemOptEndGroup');
    if (stemOptEndGroup) {
      stemOptEndGroup.style.display = dates.stemExtension ? 'block' : 'none';
    }

    // Show/hide STEM timeline section
    const stemTimeline = document.getElementById('stemTimeline');
    if (stemTimeline) {
      if (dates.stemExtension) {
        stemTimeline.classList.remove('hidden');
        
        // Update STEM timeline dates
        const stemFilingWindow = document.getElementById('stemFilingWindow');
        const totalOptPeriod = document.getElementById('totalOptPeriod');
        
        if (stemFilingWindow) {
          stemFilingWindow.textContent = `${dates.stemFilingStart.toLocaleDateString()} - ${dates.optEnd.toLocaleDateString()}`;
        }
        
        if (totalOptPeriod) {
          totalOptPeriod.textContent = '36 months (12 + 24)';
        }
      } else {
        stemTimeline.classList.add('hidden');
      }
    }

    // Update calendar buttons with dates
    this.updateCalendarButtons(dates);
  }

    renderCustomCalendar() {
    const monthSpan = document.getElementById('currentMonth');
    const daysContainer = document.getElementById('pickerDays');
    
    if (!monthSpan || !daysContainer) return;
    
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
    
    // Render calendar grid (6 weeks x 7 days = 42 days)
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
      
      // Add click event with better visual feedback
      dayElement.addEventListener('click', () => {
        if (date.getMonth() === month) {
          // Remove previous selection
          const prevSelected = daysContainer.querySelector('.picker-day.selected');
          if (prevSelected) prevSelected.classList.remove('selected');
          
          // Add selection to clicked date
          dayElement.classList.add('selected');
          
          this.selectedDate = date;
          console.log('📅 Date selected:', date.toLocaleDateString());
          this.updateDateInput(this.selectedDate);
          
          // Update the trigger button text
          this.updateDateTriggerButton(date);
          
          // Close picker with smooth animation
          setTimeout(() => {
            const customPicker = document.getElementById('customDatePicker');
            if (customPicker) customPicker.classList.remove('active');
          }, 150);
        }
      });
      
      daysContainer.appendChild(dayElement);
    }
  }

  renderSTEMCustomCalendar() {
    const monthSpan = document.getElementById('stemCurrentMonth');
    const daysContainer = document.getElementById('stemPickerDays');
    
    if (!monthSpan || !daysContainer) {
      return;
    }
    
    const year = this.stemCurrentDate.getFullYear();
    const month = this.stemCurrentDate.getMonth();
    
    monthSpan.textContent = this.stemCurrentDate.toLocaleDateString('en-US', {
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
    
    // Render calendar grid (6 weeks x 7 days = 42 days)
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
      
      if (this.selectedStemDate && this.isSameDate(date, this.selectedStemDate)) {
        dayElement.classList.add('selected');
      }
      
      // Add click event with better visual feedback
      dayElement.addEventListener('click', () => {
        if (date.getMonth() === month) {
          // Remove previous selection
          const prevSelected = daysContainer.querySelector('.picker-day.selected');
          if (prevSelected) prevSelected.classList.remove('selected');
          
          // Add selection to clicked date
          dayElement.classList.add('selected');
          
          this.selectedStemDate = date;
          this.updateSTEMDateInput(this.selectedStemDate);
          
          // Update the trigger button text
          this.updateSTEMDateTriggerButton(date);
          
          // Close picker with smooth animation
          setTimeout(() => {
            const stemCustomPicker = document.getElementById('stemCustomDatePicker');
            if (stemCustomPicker) stemCustomPicker.classList.remove('active');
          }, 150);
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
    
    // Update hidden input
    if (graduationDate) {
      graduationDate.value = formattedDate;
    }

    // Update visual display
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const selectedDateText = document.getElementById('selectedDateText');
    if (selectedDateDisplay && selectedDateText) {
      selectedDateText.textContent = date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      selectedDateDisplay.style.display = 'block';
    }
  }
  
  updateDateTriggerButton(date) {
    const dateTriggerBtn = document.getElementById('dateTriggerBtn');
    if (dateTriggerBtn) {
      const btnText = dateTriggerBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
  }
  
  updateDateDisplay() {
    const dateTriggerBtn = document.getElementById('dateTriggerBtn');
    if (dateTriggerBtn) {
      const btnText = dateTriggerBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = 'Choose Graduation Date';
      }
    }

    // Hide the selected date display
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    if (selectedDateDisplay) {
      selectedDateDisplay.style.display = 'none';
    }
  }

  updateSTEMDateInput(date) {
    const formattedDate = date.toISOString().split('T')[0];
    const stemOptEndDate = document.getElementById('stemOptEndDate');
    
    // Update hidden input
    if (stemOptEndDate) stemOptEndDate.value = formattedDate;
  }
  
  updateSTEMDateTriggerButton(date) {
    const stemDateTriggerBtn = document.getElementById('stemDateTriggerBtn');
    if (stemDateTriggerBtn) {
      const btnText = stemDateTriggerBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        stemDateTriggerBtn.classList.add('selected');
      }
    }
  }
  
  updateSTEMDateDisplay() {
    const stemDateTriggerBtn = document.getElementById('stemDateTriggerBtn');
    if (stemDateTriggerBtn) {
      const btnText = stemDateTriggerBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = 'Choose OPT End Date';
        stemDateTriggerBtn.classList.remove('selected');
      }
    }
  }
  
  showCopySuccess(receiptNumber) {
    // Create a temporary success message
    const successMsg = document.createElement('div');
    successMsg.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 300px;
      ">
        <strong>✅ Receipt Number Copied!</strong><br>
        <span style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">${receiptNumber}</span><br>
        <small>Paste it on the USCIS website</small>
      </div>
    `;
    
    document.body.appendChild(successMsg);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
      if (successMsg.parentNode) {
        successMsg.parentNode.removeChild(successMsg);
      }
    }, 3000);
  }

  // Calendar Integration Methods
  updateCalendarButtons(dates) {
    // Update calendar button data attributes with dates
    const addEarliestFiling = document.getElementById('addEarliestFiling');
    const addLatestFiling = document.getElementById('addLatestFiling');

    // Update date displays
    const earliestFilingDate = document.getElementById('earliestFilingDate');
    const latestFilingDate = document.getElementById('latestFilingDate');

    if (earliestFilingDate) {
      earliestFilingDate.textContent = dates.earliestFiling.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    if (latestFilingDate) {
      latestFilingDate.textContent = dates.latestFiling.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (addEarliestFiling) {
      addEarliestFiling.dataset.date = dates.earliestFiling.toISOString();
      addEarliestFiling.disabled = false;
    }
    
    if (addLatestFiling) {
      addLatestFiling.dataset.date = dates.latestFiling.toISOString();
      addLatestFiling.disabled = false;
    }

    // Add event listeners for calendar buttons
    this.bindCalendarEvents();
  }

  bindCalendarEvents() {
    const calendarButtons = document.querySelectorAll('.calendar-add-btn');
    
    calendarButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.addToCalendar(button);
      });
    });
  }

  addToCalendar(button) {
    const date = button.dataset.date;
    const title = button.dataset.title;
    const description = button.dataset.description;
    
    if (!date) {
      console.error('No date available for calendar event');
      return;
    }

    const eventDate = new Date(date);
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1); // 1 hour duration

    // Create calendar event data
    const event = {
      title: title,
      description: description,
      start: eventDate.toISOString(),
      end: endDate.toISOString(),
      location: 'OPT Application Process',
      allDay: false
    };

    // Generate calendar links
    const googleCalendarUrl = this.generateGoogleCalendarUrl(event);
    const appleCalendarUrl = this.generateAppleCalendarUrl(event);
    const outlookUrl = this.generateOutlookUrl(event);

    // Show calendar options
    this.showCalendarOptions(button, {
      google: googleCalendarUrl,
      apple: appleCalendarUrl,
      outlook: outlookUrl
    });
  }

  generateGoogleCalendarUrl(event) {
    const startDate = new Date(event.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endDate = new Date(event.end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description,
      location: event.location,
      ctz: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  generateAppleCalendarUrl(event) {
    const startDate = new Date(event.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endDate = new Date(event.end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const params = new URLSearchParams({
      title: event.title,
      description: event.description,
      location: event.location,
      start: event.start,
      end: event.end,
      allDay: 'false'
    });

    return `data:text/calendar;charset=utf8,${this.generateICSContent(event)}`;
  }

  generateOutlookUrl(event) {
    const startDate = new Date(event.start).toISOString();
    const endDate = new Date(event.end).toISOString();
    
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.title,
      startdt: startDate,
      enddt: endDate,
      body: event.description,
      location: event.location
    });

    return `https://outlook.live.com/calendar/0/${params.toString()}`;
  }

  generateICSContent(event) {
    const startDate = new Date(event.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endDate = new Date(event.end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//OPT Planner//Calendar Event//EN',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  showCalendarOptions(button, urls) {
    // Create calendar options modal
    const modal = document.createElement('div');
    modal.className = 'calendar-modal';
    modal.innerHTML = `
      <div class="calendar-modal-content">
        <div class="calendar-modal-header">
          <h3>📅 Add to Calendar</h3>
          <button class="modal-close" onclick="this.closest('.calendar-modal').remove()">×</button>
        </div>
        <div class="calendar-modal-body">
          <p>Choose your calendar app:</p>
          <div class="calendar-options">
            <a href="${urls.google}" target="_blank" class="calendar-option google">
              <span class="option-icon">📅</span>
              <span class="option-text">Google Calendar</span>
            </a>
            <a href="${urls.apple}" download="opt-event.ics" class="calendar-option apple">
              <span class="option-icon">📅</span>
              <span class="option-text">Apple Calendar</span>
            </a>
            <a href="${urls.outlook}" target="_blank" class="calendar-option outlook">
              <span class="option-icon">📅</span>
              <span class="option-text">Outlook</span>
            </a>
          </div>
        </div>
      </div>
    `;

    // Add modal styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(modal);

    // Add success state to button
    button.classList.add('success');
    button.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Added!</span>';
    
    // Reset button after 3 seconds
    setTimeout(() => {
      button.classList.remove('success');
      button.innerHTML = '<span class="btn-icon">📅</span><span class="btn-text">Add</span>';
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OPTPlanner();
}); 