<div align="center">
  <img src="./public/img/socials/github-social.png" alt="Prism Banner" width="100%" />

# Prism: Precision at Speed

  [![Version](https://img.shields.io/badge/version-0.15.1--beta-blue.svg)](https://github.com/Whitestar14/mathlly)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vue.js](https://img.shields.io/badge/Vue.js-35495E?logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
</div>

Prism is a comprehensive, professional-grade suite of mathematical and development utilities designed to optimize technical workflows. Built with a focus on precision, performance, and accessibility, Prism integrates advanced calculation engines with essential formatting and conversion tools into a unified, responsive interface.

## System Overview

Prism is engineered as a high-performance Progressive Web Application (PWA) utilizing a modern frontend stack. The platform provides a seamless experience across desktop and mobile environments, offering offline functionality and robust state persistence.

## Core Functional Modules

### Advanced Calculation Suite
*   **Standard Mode**: Optimized for general-purpose arithmetic with support for high-precision decimal operations and fraction formatting.
*   **Scientific Mode**: Supports complex mathematical functions including trigonometry, logarithms, and exponentiation, utilizing Abstract Syntax Tree (AST) transformations for accurate evaluation.
*   **Programmer Mode**: Facilitates low-level data manipulation with multi-base support (HEX, DEC, OCT, BIN) and 16/32/64-bit bitwise operations.

### Multi-Category Unit Conversion
*   **Physical Quantities**: High-precision conversion for length, weight, volume, area, speed, time, power, pressure, and angle.
*   **Developer-Specific**: Specialized converters for CSS units (relative and absolute) and data sizes (binary and decimal prefixes).
*   **Real-time Currency**: Integrated exchange rate conversion with automated updates and localized caching for offline reliability.

### Developer Utilities
*   **Base64 Processor**: Efficient encoding and decoding of text and binary data with support for file uploads and URL-safe formatting.
*   **Color Engineering**: A comprehensive color manipulation suite featuring palette management, contrast accessibility checking (WCAG compliance), gradient generation, and harmony visualization.
*   **Regex Engine**: (Planned) Real-time regular expression testing and structural analysis.

## Technical Architecture

The application is built with a modular, scalable architecture:

*   **Framework**: Vue 3 (Composition API) for reactive UI management.
*   **Type Safety**: TypeScript implementation across the entire codebase ensuring rigorous data integrity.
*   **State Management**: Pinia for centralized, reactive application state.
*   **Persistence Layer**: IndexedDB integration via Dexie.js for secure, client-side data storage of history and user preferences.
*   **Mathematical Logic**: Math.js engine for robust numerical evaluation and AST-based scientific calculations.
*   **Design System**: Tailwind CSS for utility-first styling combined with Radix Vue for accessible, headless component logic.

## User Experience Features

*   **Advanced Theme Engine**: Multiple professional color profiles including Orion, Mira, Ayu, Siena, and Dracula with support for system-preference synchronization.
*   **Command Palette**: Rapid command execution and navigation via a centralized searchable interface (Ctrl+K).
*   **Keyboard Orchestration**: Extensive, context-aware shortcut system for power-user efficiency.
*   **Responsive Panels**: Adaptive layout management using a proprietary draggable panel system for mobile and desktop parity.
*   **Developer Tools**: Integrated performance monitoring and state inspection through the experimental DevDock.

## Installation and Deployment

### Prerequisites
*   Node.js 18.x or higher
*   pnpm 9.x or higher

### Build Instructions
```bash
# Install dependencies
pnpm install

# Execute development server
pnpm dev

# Generate production build
pnpm build
```

## Project Structure
*   `features/`: Encapsulated functional modules (calculator, tools, converters).
*   `shared/components/`: Reusable UI elements and layout containers.
*   `shared/composables/`: Shared business logic and reactive utilities.
*   `shared/stores/`: Global state definitions.
*   `shared/utils/`: Core mathematical and formatting algorithms.

## License

This project is licensed under the MIT License.
