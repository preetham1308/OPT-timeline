class OPTGuide {
  constructor() {
    this.currentSection = 'overview';
    this.init();
  }

  init() {
    try {
      this.bindEvents();
      this.initNavigation();
      this.initPDFDownload();
      console.log('✅ OPTGuide initialized successfully');
    } catch (error) {
      console.error('❌ OPTGuide initialization failed:', error);
    }
  }

  bindEvents() {
    // Navigation tab clicks
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
        this.switchSection(section);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.navigateWithArrowKeys(e.key);
      }
    });

    // Smooth scrolling for anchor links
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

  initNavigation() {
    // Set initial active section
    this.showSection(this.currentSection);
    
    // Update active tab
    this.updateActiveTab(this.currentSection);
  }

  initPDFDownload() {
    const downloadBtn = document.getElementById('downloadPdf');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        this.downloadPDF();
      });
    }
    
    // Initialize PDF viewer functionality
    this.initPDFViewer();
  }

  switchSection(sectionName) {
    if (sectionName === this.currentSection) return;
    
    // Hide current section
    this.hideSection(this.currentSection);
    
    // Show new section
    this.showSection(sectionName);
    
    // Update current section
    this.currentSection = sectionName;
    
    // Update active tab
    this.updateActiveTab(sectionName);
    
    // Scroll to top of new section
    this.scrollToSection(sectionName);
  }

  showSection(sectionName) {
    const section = document.getElementById(sectionName);
    if (section) {
      section.classList.add('active');
      section.style.display = 'block';
    }
  }

  hideSection(sectionName) {
    const section = document.getElementById(sectionName);
    if (section) {
      section.classList.remove('active');
      section.style.display = 'none';
    }
  }

  updateActiveTab(sectionName) {
    // Remove active class from all tabs
    const allTabs = document.querySelectorAll('.nav-tab');
    allTabs.forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Add active class to current tab
    const activeTab = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
  }

  scrollToSection(sectionName) {
    const section = document.getElementById(sectionName);
    if (section) {
      const headerHeight = document.querySelector('.guide-header').offsetHeight;
      const navHeight = document.querySelector('.guide-navigation').offsetHeight;
      const totalOffset = headerHeight + navHeight + 20;
      
      const elementPosition = section.offsetTop - totalOffset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }

  navigateWithArrowKeys(key) {
    const sections = ['overview', 'preparation', 'application', 'submission', 'tracking', 'pdf-guide'];
    const currentIndex = sections.indexOf(this.currentSection);
    
    let newIndex;
    if (key === 'ArrowLeft') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
    } else if (key === 'ArrowRight') {
      newIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
    }
    
    if (newIndex !== undefined) {
      this.switchSection(sections[newIndex]);
    }
  }

  downloadPDF() {
    const pdfFileName = '(Updated 01 -2025) Student-Facing OPT USCIS E-Filing Instructions - US Letter (11 x 8.5 in).pdf';
    
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      // Use the correct path for the PDF file
      link.href = pdfFileName;
      link.download = pdfFileName;
      link.style.display = 'none';
      
      // Append to body and trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      // Show success message
      this.showDownloadSuccess();
      
      console.log('📥 PDF download initiated:', pdfFileName);
    } catch (error) {
      console.error('❌ PDF download failed:', error);
      this.showDownloadError();
    }
  }

  showDownloadSuccess() {
    const successMsg = document.createElement('div');
    successMsg.className = 'download-notification success';
    successMsg.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">PDF download started successfully!</span>
      </div>
    `;
    
    this.showNotification(successMsg);
  }

  showDownloadError() {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'download-notification error';
    errorMsg.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">❌</span>
        <span class="notification-text">Download failed. Please try again.</span>
      </div>
    `;
    
    this.showNotification(errorMsg);
  }

  showNotification(notification) {
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${notification.classList.contains('success') ? '#28a745' : '#dc3545'};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Utility method to get section names for navigation
  getSectionNames() {
    return ['overview', 'preparation', 'application', 'submission', 'tracking', 'pdf-guide'];
  }

  // Method to go to a specific section programmatically
  goToSection(sectionName) {
    if (this.getSectionNames().includes(sectionName)) {
      this.switchSection(sectionName);
    }
  }

  // Method to get current section
  getCurrentSection() {
    return this.currentSection;
  }

  // PDF Viewer functionality
  initPDFViewer() {
    this.currentPage = 1;
    this.totalPages = 15; // Set total pages for USCIS guide
    this.pdfFrame = document.getElementById('pdfFrame');
    
    // Initialize PDF controls
    this.initPDFControls();
    
    // Add PDF event listeners
    this.addPDFEventListeners();
    
    // Initialize page info
    this.updatePageInfo();
    this.updateNavigationButtons();
    
    // Try to detect PDF loading
    this.detectPDFLoading();
  }

  initPDFControls() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const downloadBtn = document.getElementById('downloadPdfInline');
    const openNewTabBtn = document.getElementById('openPdfNewTab');
    const fullscreenBtn = document.getElementById('fullscreenPdf');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.goToPreviousPage());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.goToNextPage());
    }
    
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadPDF());
    }
    
    if (openNewTabBtn) {
      openNewTabBtn.addEventListener('click', () => this.openPDFInNewTab());
    }
    
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }
  }

  addPDFEventListeners() {
    // Keyboard navigation for PDF
    document.addEventListener('keydown', (e) => {
      if (this.currentSection === 'pdf-guide') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.goToPreviousPage();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.goToNextPage();
        } else if (e.key === 'Escape' && this.isFullscreen) {
          this.exitFullscreen();
        }
      }
    });

    // Mouse wheel navigation (optional)
    if (this.pdfFrame) {
      this.pdfFrame.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) {
          this.goToNextPage();
        } else {
          this.goToPreviousPage();
        }
      });
    }
  }

  detectPDFLoading() {
    if (this.pdfFrame) {
      this.pdfFrame.addEventListener('load', () => {
        console.log('✅ PDF loaded successfully');
        this.updatePageInfo();
      });

      this.pdfFrame.addEventListener('error', () => {
        console.error('❌ PDF failed to load');
        this.showPDFError();
      });
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePDFPage();
      this.updatePageInfo();
      this.updateNavigationButtons();
      console.log(`📄 Moved to page ${this.currentPage}`);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePDFPage();
      this.updatePageInfo();
      this.updateNavigationButtons();
      console.log(`📄 Moved to page ${this.currentPage}`);
    }
  }

  updatePDFPage() {
    if (this.pdfFrame) {
      // Add loading state
      this.showPDFLoading();
      
      // Use a more reliable method to navigate PDF pages
      const baseUrl = '%28Updated%2001%20-2025%29%20Student-Facing%20OPT%20USCIS%20E-Filing%20Instructions%20-%20US%20Letter%20%2811%20x%208.5%20in%29.pdf';
      const newSrc = `${baseUrl}#page=${this.currentPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
      
      // Force iframe reload with new page
      this.pdfFrame.src = '';
      setTimeout(() => {
        this.pdfFrame.src = newSrc;
        // Hide loading after a short delay
        setTimeout(() => {
          this.hidePDFLoading();
        }, 500);
      }, 100);
    }
  }

  showPDFLoading() {
    // Add a subtle loading indicator
    if (this.pdfFrame) {
      this.pdfFrame.style.opacity = '0.7';
      this.pdfFrame.style.transition = 'opacity 0.3s ease';
    }
  }

  hidePDFLoading() {
    if (this.pdfFrame) {
      this.pdfFrame.style.opacity = '1';
    }
  }

  // Add method to go to specific page
  goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePDFPage();
      this.updatePageInfo();
      this.updateNavigationButtons();
      console.log(`📄 Jumped to page ${this.currentPage}`);
    }
  }

  updatePageInfo() {
    const currentPageEl = document.querySelector('.current-page');
    const totalPagesEl = document.querySelector('.total-pages');
    
    if (currentPageEl) {
      currentPageEl.textContent = this.currentPage;
    }
    
    if (totalPagesEl) {
      totalPagesEl.textContent = this.totalPages;
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentPage <= 1;
      // Update button styling based on disabled state
      if (this.currentPage <= 1) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
      } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
      }
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= this.totalPages;
      // Update button styling based on disabled state
      if (this.currentPage >= this.totalPages) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
      } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
      }
    }
  }

  openPDFInNewTab() {
    const pdfUrl = '%28Updated%2001%20-2025%29%20Student-Facing%20OPT%20USCIS%20E-Filing%20Instructions%20-%20US%20Letter%20%2811%20x%208.5%20in%29.pdf';
    window.open(pdfUrl, '_blank');
  }

  toggleFullscreen() {
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  enterFullscreen() {
    const pdfViewer = document.querySelector('.pdf-viewer');
    if (pdfViewer) {
      pdfViewer.classList.add('fullscreen');
      this.isFullscreen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  exitFullscreen() {
    const pdfViewer = document.querySelector('.pdf-viewer');
    if (pdfViewer) {
      pdfViewer.classList.remove('fullscreen');
      this.isFullscreen = false;
      document.body.style.overflow = '';
    }
  }

  showPDFError() {
    const pdfViewer = document.querySelector('.pdf-viewer');
    if (pdfViewer) {
      pdfViewer.classList.add('error');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OPTGuide();
  
  // Add some additional interactive features
  
  // Add smooth reveal animations for cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe all cards and timeline items
  document.querySelectorAll('.overview-card, .timeline-step, .form-section, .submission-step, .tracking-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
  
  // Add hover effects for interactive elements
  document.querySelectorAll('.overview-card, .timeline-step, .form-section, .submission-step, .tracking-card').forEach(el => {
    el.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });
    
    el.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Add progress indicator
  const addProgressIndicator = () => {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      z-index: 1000;
      transition: width 0.1s ease-out;
    `;
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = scrollPercent + '%';
    });
  };
  
  addProgressIndicator();
}); 