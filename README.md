# AI Content Detector (Frontend)

A clean, modern frontend application built with **React**, **Vite**, **JavaScript**, and **Tailwind CSS** for detecting AI-generated content across:

1. **Text** (Articles, essays, pasted copy)
2. **Documents** (PDF, DOCX, TXT)
3. **Images** (JPG, JPEG, PNG, WEBP)
4. **History** (Audit log table with probabilities and detailed inspection modal)

---

## Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or newer recommended).

### 2. Install Dependencies
Open your terminal in this directory and install the required packages:

```bash
npm install
```

### 3. Run the Development Server
Start the local Vite dev server:

```bash
npm run dev
```

### 4. View in Browser
Open the URL shown in your terminal, typically:
```
http://localhost:5173
```

---

## Project Structure

```
ai-content-detector/
├── index.html                  # Main HTML document
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS theme configuration
├── postcss.config.js           # PostCSS setup
├── src/
│   ├── main.jsx                # React root mount
│   ├── App.jsx                 # Main layout and hash/tab navigation
│   ├── index.css               # Tailwind CSS directives and styles
│   ├── components/
│   │   ├── Navbar.jsx          # Header navigation (Home | Text | Files | Images | History)
│   │   ├── Footer.jsx          # Responsive footer
│   │   ├── FeatureCard.jsx     # Reusable card component for Home page
│   │   ├── EmptyResult.jsx     # Reusable empty result placeholder for detector pages
│   │   ├── ViewModal.jsx       # Modal for inspecting history records
│   │   └── Icons.jsx           # SVG icon components
│   ├── pages/
│   │   ├── HomePage.jsx        # Home page with 3 detector cards
│   │   ├── TextDetectorPage.jsx# Large text input, word & char counts, clear/analyze
│   │   ├── FileDetectorPage.jsx# Drag & drop upload for PDF/DOCX/TXT with file size and remove
│   │   ├── ImageDetectorPage.jsx# Drag & drop upload for JPG/PNG/WEBP with image preview and remove
│   │   └── HistoryPage.jsx     # Placeholder table with filter tabs and details view
│   └── data/
│       └── mockHistory.js      # Sample audit records
```
