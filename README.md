# SCP Foundation Secure Catalogue

A responsive React single-page application created for COMP.6210 Assignment 1. The application converts five supplied legacy SCP subject pages into structured JSON and presents them in a modern catalogue designed for desktop and mobile use.

## Features

- Five SCP records loaded dynamically from `public/data/scp-subjects.json`
- Responsive desktop and mobile layouts
- Full-text subject search
- Object-class filters
- Keyboard navigation and a `/` search shortcut
- Direct record links using URL hashes
- Accessible semantic headings, controls, labels, and focus states
- Loading, empty, and connection-error states
- Automated UI tests using Vitest and React Testing Library
- GitHub Pages deployment workflow

## Local setup

```bash
npm install
npm run dev
```

## Testing and production build

```bash
npm test
npm run build
npm run preview
```

## GitHub Pages deployment

1. Create a public GitHub repository and upload this project.
2. In the repository, open **Settings > Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Push to the `main` branch. The included workflow tests, builds, and deploys the site automatically.

## Project structure

```text
public/
  data/             Converted SCP JSON records
  images/           Supplied archive images
scripts/            HTML-to-JSON conversion utility
src/
  components/       React interface components
  test/             Test configuration
  App.jsx            Application state and filtering
  App.test.jsx       Automated UI tests
  styles.css         Responsive visual design
.github/workflows/  GitHub Pages deployment
```
