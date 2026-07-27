const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600">
  <defs>
    <!-- Rich 3D Metallic Gold Gradient for Chevron Wings -->
    <linearGradient id="gold-wing-left" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8A6B29" />
      <stop offset="25%" stop-color="#D8B45A" />
      <stop offset="50%" stop-color="#FFF6C5" />
      <stop offset="75%" stop-color="#C7A144" />
      <stop offset="100%" stop-color="#8A6B29" />
    </linearGradient>

    <linearGradient id="gold-wing-right" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#8A6B29" />
      <stop offset="25%" stop-color="#C7A144" />
      <stop offset="50%" stop-color="#FFF6C5" />
      <stop offset="75%" stop-color="#D8B45A" />
      <stop offset="100%" stop-color="#8A6B29" />
    </linearGradient>

    <!-- Metallic Gold for Dividers and Realty text -->
    <linearGradient id="gold-bright" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C7A144" />
      <stop offset="50%" stop-color="#FFF8D0" />
      <stop offset="100%" stop-color="#C7A144" />
    </linearGradient>
  </defs>

  <!-- CHEVRON EMBLEM -->
  <g>
    <!-- Outer Roof Chevron (Left & Right) -->
    <polygon points="472,40 500,40 276,368 236,368" fill="url(#gold-wing-left)" />
    <polygon points="528,40 500,40 724,368 764,368" fill="url(#gold-wing-right)" />

    <!-- Middle Roof Chevron -->
    <polygon points="474,104 500,104 330,368 294,368" fill="url(#gold-wing-left)" />
    <polygon points="526,104 500,104 670,368 706,368" fill="url(#gold-wing-right)" />

    <!-- Inner Roof Chevron -->
    <polygon points="476,168 500,168 382,368 350,368" fill="url(#gold-wing-left)" />
    <polygon points="524,168 500,168 618,368 650,368" fill="url(#gold-wing-right)" />

    <!-- Center Roof Peak Gable -->
    <polygon points="500,260 536,316 516,316 500,292 484,316 464,316" fill="url(#gold-bright)" />

    <!-- 4 Small Gold Window Dots (2x2) -->
    <rect x="486" y="328" width="11" height="11" rx="2" fill="url(#gold-bright)" />
    <rect x="503" y="328" width="11" height="11" rx="2" fill="url(#gold-bright)" />
    <rect x="486" y="345" width="11" height="11" rx="2" fill="url(#gold-bright)" />
    <rect x="503" y="345" width="11" height="11" rx="2" fill="url(#gold-bright)" />
  </g>

  <!-- ALPHAPREMIER TEXT (White Outlined/Hollow Typography) -->
  <text 
    x="500" 
    y="450" 
    text-anchor="middle" 
    fill="none" 
    stroke="#FFFFFF" 
    stroke-width="2.8" 
    stroke-linejoin="round"
    font-family="system-ui, -apple-system, sans-serif" 
    font-weight="500" 
    font-size="62" 
    letter-spacing="18"
    style="letter-spacing: 0.28em; font-family: 'Segoe UI', Arial, sans-serif;"
  >ALPHAPREMIER</text>

  <!-- REALTY LINE ACCENTS & TEXT -->
  <!-- Left Accent Line and Circle Dot -->
  <circle cx="150" cy="520" r="9" fill="url(#gold-bright)" />
  <line x1="165" y1="520" x2="365" y2="520" stroke="url(#gold-bright)" stroke-width="4" />

  <!-- REALTY Text -->
  <text 
    x="500" 
    y="532" 
    text-anchor="middle" 
    fill="url(#gold-bright)" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-weight="300" 
    font-size="36" 
    letter-spacing="20"
    style="letter-spacing: 0.5em; font-family: 'Segoe UI', Arial, sans-serif;"
  >REALTY</text>

  <!-- Right Accent Line and Circle Dot -->
  <line x1="635" y1="520" x2="835" y2="520" stroke="url(#gold-bright)" stroke-width="4" />
  <circle cx="850" cy="520" r="9" fill="url(#gold-bright)" />
</svg>`;

// Ensure directories exist
fs.mkdirSync(path.join(__dirname, 'src', 'assets', 'images'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'public', 'assets', 'images'), { recursive: true });

const srcImgPath = path.join(__dirname, 'src', 'assets', 'images', 'alpha-premier-logo.png');
const publicImgPath = path.join(__dirname, 'public', 'assets', 'images', 'alpha-premier-logo.png');

sharp(Buffer.from(svgLogo))
  .png()
  .toFile(srcImgPath)
  .then(() => {
    fs.copyFileSync(srcImgPath, publicImgPath);
    console.log('Saved PNG images successfully to:', srcImgPath, publicImgPath);
  })
  .catch(err => console.error('Error generating image:', err));
