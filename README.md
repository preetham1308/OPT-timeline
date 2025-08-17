# OPT Timeline Planner

A production-grade, mobile-friendly web application for F-1 students to calculate their OPT (Optional Practical Training) application timelines based on current USCIS regulations.

## 🌟 Features

### Core Functionality
- **OPT Timeline Calculator**: Automatically calculates filing windows based on graduation date
- **90/60 Day Rule**: Implements the standard OPT filing window (90 days before to 60 days after graduation)
- **STEM Extension Support**: Handles both 12-month and 24-month OPT periods
- **Real-time Countdown**: Shows days remaining until filing deadlines
- **USCIS Integration**: Direct links to official USCIS website for status checking

### Design & UX
- **Number Theme**: Floating background numbers (90, 60, 12, 24) representing key OPT rules
- **Smooth Animations**: CSS animations and transitions for enhanced user experience
- **Mobile-First Design**: Fully responsive with touch-optimized interactions
- **Modern UI**: Clean, professional interface with gradient accents
- **Accessibility**: High contrast support and reduced motion preferences

### Technical Features
- **Progressive Web App**: Works offline and provides app-like experience
- **Touch Optimized**: Enhanced touch feedback and mobile gestures
- **Performance**: Optimized animations and smooth scrolling
- **Cross-browser**: Compatible with all modern browsers

## 📱 Mobile Responsiveness

The application is designed with mobile-first principles:

- **Responsive Grid Layouts**: Automatically adapts to screen sizes
- **Touch-Friendly Buttons**: Minimum 44px touch targets
- **Mobile-Optimized Forms**: Easy date selection and form inputs
- **Smooth Mobile Scrolling**: Optimized for touch devices
- **Mobile-Specific Enhancements**: Touch feedback and gesture support

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)

### Installation
1. Clone or download the project files
2. Open `index.html` in a web browser
3. Or serve locally: `python3 -m http.server 8000`

### Usage
1. **Enter Graduation Details**: Select your graduation date and program level
2. **Choose STEM Status**: Indicate if you're eligible for STEM extension
3. **Calculate Timeline**: Get instant OPT filing windows and deadlines
4. **Check USCIS Status**: Use the integrated USCIS.gov link for application tracking

## 📊 OPT Rules Implemented

### Filing Windows
- **Earliest Filing**: 90 days before graduation date
- **Latest Filing**: 60 days after graduation date
- **OPT Start Window**: From graduation to 60 days after

### Duration Rules
- **Standard OPT**: 12 months
- **STEM Extension**: 24 months (if eligible)

### Important Notes
- OPT must start within 60 days of graduation
- File I-765 between 90 days before and 60 days after graduation
- Always verify dates with your DSO and current regulations

## 🛠️ Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic markup and modern structure
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript**: ES6+ classes and modern APIs
- **Responsive Design**: Mobile-first CSS architecture

### Key Components
- **OPTPlanner Class**: Main application logic and state management
- **Timeline Calculator**: Date calculations and OPT rule implementation
- **Mobile Enhancements**: Touch events and mobile-specific features
- **Animation System**: CSS animations with JavaScript triggers

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Mobile Testing

Use the included `mobile-test.html` file to test mobile responsiveness:

1. Open `mobile-test.html` in your browser
2. Use browser dev tools to simulate mobile devices
3. Test touch interactions and responsive layouts
4. Verify mobile-specific features

## 🎨 Customization

### Colors and Themes
The application uses CSS custom properties for easy theming:

```css
:root {
  --accent-primary: #00d4ff;
  --accent-secondary: #0099cc;
  --bg-primary: #0a0a0a;
  --text-primary: #ffffff;
}
```

### Animations
Customize animation durations and easing:

```css
:root {
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🔧 Development

### Project Structure
```
opt-planner/
├── index.html          # Main application
├── styles.css          # Styles and animations
├── script.js           # Application logic
├── mobile-test.html    # Mobile testing utility
└── README.md           # Documentation
```

### Adding Features
1. **New OPT Rules**: Modify `calculateOPTTimeline()` method in `script.js`
2. **UI Components**: Add HTML structure and corresponding CSS
3. **Animations**: Extend CSS animations and JavaScript triggers

## 📋 Testing Checklist

### Mobile Responsiveness
- [ ] Viewport meta tag present
- [ ] Responsive CSS grid layouts
- [ ] Touch-friendly button sizes (min 44px)
- [ ] Mobile-first media queries
- [ ] Smooth animations (reduced motion support)
- [ ] Proper spacing for mobile screens
- [ ] Form inputs optimized for mobile
- [ ] Navigation works on small screens

### Functionality
- [ ] Date calculations accurate
- [ ] Form validation working
- [ ] Results display correctly
- [ ] USCIS integration functional
- [ ] Error handling implemented
- [ ] Touch events working

## 🚨 Important Disclaimers

- **Not Legal Advice**: This tool is for planning purposes only
- **Verify with DSO**: Always confirm dates with your Designated School Official
- **Current Regulations**: Rules may change; verify with USCIS
- **Individual Cases**: Consult immigration attorney for complex situations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For questions or issues:
1. Check the documentation
2. Test on mobile devices
3. Verify browser compatibility
4. Review OPT regulations

---

**Built with ❤️ for F-1 students navigating their OPT journey** 