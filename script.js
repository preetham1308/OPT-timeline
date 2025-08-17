class OPTPlanner {
  constructor() {
    this.selectedDate = null;
    this.currentDate = new Date();
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
    const graduationDate = document.getElementById('graduationDate');
    const isSTEM = document.getElementById('isSTEM');
    
    if (!graduationDate || !isSTEM) {
      console.error('❌ Required form elements not found');
      return;
    }

    const date = new Date(graduationDate.value);
    const stemExtension = isSTEM.value === 'yes';
    
    if (isNaN(date.getTime())) {
      alert('Please select a valid graduation date');
      return;
    }

    this.calculateTimeline(date, stemExtension);
  }

  handleDateChange(e) {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      this.updateDateDisplay(date);
    }
  }

  handleSTEMChange(e) {
    const stemOptEndGroup = document.getElementById('stemOptEndGroup');
    if (stemOptEndGroup) {
      stemOptEndGroup.style.display = e.target.value === 'yes' ? 'block' : 'none';
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
    if (!results) return;

    // Calculate key dates
    const earliestFiling = new Date(graduationDate);
    earliestFiling.setDate(earliestFiling.getDate() - 90);

    const latestFiling = new Date(graduationDate);
    latestFiling.setDate(latestFiling.getDate() + 60);

    const optStart = new Date(graduationDate);
    const optEnd = new Date(graduationDate);
    optEnd.setDate(optEnd.getDate() + (stemExtension ? 365 + 730 : 365));

    const stemFilingStart = new Date(optEnd);
    stemFilingStart.setDate(stemFilingStart.getDate() - 90);

    // Calculate days remaining
    const today = new Date();
    const daysUntilEarliest = Math.ceil((earliestFiling - today) / (1000 * 60 * 60 * 24));
    const daysUntilLatest = Math.ceil((latestFiling - today) / (1000 * 60 * 60 * 24));
    
    // Debug logging
    console.log('📅 Timeline Calculation:', {
      graduationDate: graduationDate.toLocaleDateString(),
      earliestFiling: earliestFiling.toLocaleDateString(),
      latestFiling: latestFiling.toLocaleDateString(),
      optStart: optStart.toLocaleDateString(),
      today: today.toLocaleDateString(),
      daysUntilEarliest,
      daysUntilLatest
    });

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
    if (graduationDate) graduationDate.value = formattedDate;
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OPTPlanner();
}); 