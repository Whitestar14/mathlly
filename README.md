<div align="center">
  <img src="./public/img/socials/github-social.png" alt="Prism Banner" width="100%" />

  # Prism
  ### Precision at Speed

  [![Version](https://img.shields.io/badge/version-0.13.0--beta-blue.svg)](https://github.com/Whitestar14/mathlly)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vue.js](https://img.shields.io/badge/Vue.js-35495E?logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
</div>

---

## �� Overview

Prism is a comprehensive developer toolkit that combines powerful mathematical calculations with essential coding utilities. Designed for developers, engineers, and technical professionals, Prism offers advanced calculators, encoding tools, color manipulation, and real-time evaluation—all while maintaining the precision and reliability required for professional development workflows.

### 🌟 What Makes Prism Special
- **Developer-First Design**: Mathematical tools specifically crafted for software development workflows
- **Unified Toolkit**: From advanced calculations to data encoding and color manipulation
- **Modern Architecture**: Built with Vue 3 + TypeScript for type safety and performance
- **Real-time Evaluation**: Instant feedback and validation across all tools
- **Cross-Platform**: Responsive design that works seamlessly across desktop and mobile
- **Progressive Web App**: Installable with offline capabilities

---

## ✨ Current Features

### 🧮 Advanced Calculator
- **Multiple Calculation Modes**: Standard, Scientific, and Programmer calculators
- **Programmer Mode**: Multi-base support (HEX, DEC, OCT, BIN) with bitwise operations
- **Real-time Base Conversion**: Instant conversion between number systems
- **Scientific Functions**: Trigonometric, logarithmic, and exponential functions

### 🛠️ Developer Tools
- **Base64 Encoder/Decoder**: Efficient encoding and decoding with instant preview
- **Color Manipulation**: Comprehensive color tools with palettes, gradients, and accessibility
- **Expression Syntax Highlighting**: Color-coded mathematical expressions
- **Keyboard Shortcuts**: Comprehensive hotkey support for power users

### 🎨 User Experience
- **Dual Theme Support**: Light and dark themes with system preference detection
- **Persistent Sessions**: Saved calculations and tool states
- **Mobile-Responsive**: Touch-optimized interface for all devices
- **Accessibility**: ARIA labels and keyboard navigation support

### ⚡ Technical Highlights
- **TypeScript**: Full type safety and enhanced developer experience
- **State Management**: Pinia for reactive state management
- **Local Storage**: Efficient IndexedDB operations with automatic persistence
- **Precise Calculations**: Decimal.js for accurate floating-point arithmetic
- **Real-time Sync**: Cross-tab synchronization for seamless workflows

---

## 🗺️ Roadmap

### Phase 2: Enhanced Scientific Calculator ✅
- Advanced mathematical functions and physical constants
- Matrix operations and statistical functions
- Unit conversions and engineering notation

### Phase 3: Developer Toolkit Expansion 🚧
- **Advanced Encoding Tools**: JWT, URL encoding, hash generators
- **Code Formatting**: JSON, XML, SQL beautification and validation
- **API Testing Tools**: HTTP request builders and response analysis
- **Regular Expression Tester**: Real-time regex testing and explanation

### Phase 4: Collaboration & Sharing 📋
- **Session Sharing**: Share calculation sessions and tool configurations
- **Export Capabilities**: PDF reports, code snippets, and formatted results
- **Cloud Sync**: Cross-device synchronization (planned)

### Phase 5: Platform Expansion 🌐
- **Desktop Applications**: Native Windows, macOS, and Linux apps
- **Mobile Apps**: Native iOS and Android applications
- **Plugin System**: Extensible architecture for custom tools

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **pnpm** 9.x or higher (recommended) or npm/yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Whitestar14/mathlly.git
cd mathlly

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

---

## Architecture

```plaintext
src/
├── features/calculator/     # Calculator implementation
├── features/tools/          # Developer tools (Base64, Color, etc.)
├── shared/components/       # Reusable UI components
├── shared/composables/      # Vue 3 composables
├── shared/stores/          # Pinia state management
└── shared/utils/           # Utility functions
```

---

## 🛠️ Technology Stack

### Core Framework
- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript with full type checking
- **Vite** - Next-generation frontend tooling and build system

### State & Data
- **Pinia** - Intuitive state management for Vue
- **Dexie.js** - IndexedDB wrapper for local data storage
- **VueUse** - Collection of essential Vue composition utilities

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix Vue** - Headless UI components for accessibility
- **Lucide Icons** - Consistent iconography system

---

## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Development Guidelines
- Follow existing TypeScript and Vue 3 patterns
- Add tests for new functionality
- Update documentation for API changes
- Consider performance implications
- Ensure accessibility compliance

---

## 📄 License

**MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p><strong>Built with ❤️ for developers, by developers</strong></p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>