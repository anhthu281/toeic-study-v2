# TOEIC Study V2 - Interactive Learning Platform

A clean, modern static HTML/CSS/JavaScript web application for TOEIC practice and learning.

## Features

- **Part 5 Practice**: 20 original demo questions on grammar and vocabulary
- **Interactive Timer**: 20-minute countdown for realistic test conditions
- **Question Navigator**: Quick navigation to any question in the test
- **Mark for Review**: Flag questions to review later
- **Progress Tracking**: LocalStorage-based progress and results history
- **Answer Review**: Detailed explanations in English and Vietnamese
- **Dark Mode**: Comfortable viewing in different lighting conditions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Score Calculation**: Estimated TOEIC score based on accuracy

## Project Structure

```
toeic-study-v2/
├── index.html          # Main entry point
├── css/
│   └── style.css       # All styling (mobile-responsive)
├── js/
│   └── app.js          # All application logic
├── data/
│   └── part5.json      # Question bank (20 demo questions)
├── audio/
│   └── demo/           # Audio files (placeholder)
├── images/
│   └── part1/          # Images (placeholder)
├── README.md           # This file
└── LICENSE             # MIT License
```

## Usage

1. Open `index.html` in any modern web browser
2. Click "Start Practice" to begin the Part 5 test
3. Select answers from A, B, C, D options
4. Use Previous/Next to navigate between questions
5. Click "Mark" to flag questions for review
6. Submit the test when complete
7. Review your answers with explanations
8. Check your progress page for history

## Technologies

- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, CSS variables, media queries
- **Vanilla JavaScript** - No frameworks or dependencies
- **LocalStorage** - Browser-based data persistence

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Question Content

**Important**: These are 20 original demo questions created for educational practice. They are **NOT** official TOEIC/ETS questions. The TOEIC test is a registered trademark of Educational Testing Service (ETS).

## Development Notes

- Static site - no build process required
- No backend server needed
- No database required
- Self-contained in the repository
- Lightweight and fast loading

## License

MIT License - See LICENSE file for details

## Author

Created for TOEIC learning and practice (Demo Version 2)
