<div align="center">
  <img src="./public/img/socials/mathlly-social.png" alt="Mathlly Banner" width="100%" />
  
  # Mathlly
  ### Mathematical Precision for Modern Development
  
  [![Version](https://img.shields.io/badge/version-0.11.13--beta-blue.svg)](https://github.com/Whitestar14/mathlly)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vue.js](https://img.shields.io/badge/Vue.js-35495E?logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
</div>

---

## 🎯 Overview

Mathlly is a sophisticated, developer-oriented mathematical application that combines powerful calculation capabilities with an intuitive user interface. Designed for developers, engineers, and students, Mathlly offers multiple calculation modes, real-time base conversions, and advanced mathematical operations—all while maintaining the precision and reliability required for professional work.

### 🌟 What Makes Mathlly Special

- **Developer-First Design**: Built specifically for software developers with programmer mode featuring bitwise operations and multi-base number system support
- **Modern Architecture**: Leverages Vue 3 + Composition API with TypeScript for type safety and maintainability
- **Performance Optimized**: Efficient caching, lazy loading, and optimized bundle size for fast loading
- **Cross-Platform**: Responsive design that works seamlessly across desktop and mobile devices

---

## ✨ Current Features

### 🧮 Calculator Modes
- **Standard Calculator**: Essential arithmetic operations with history tracking
- **Programmer Calculator**: Multi-base support (HEX, DEC, OCT, BIN) with bitwise operations
- **Scientific Calculator**: Advanced mathematical functions and constants

### 🛠️ Developer Tools
- **Base64 Encoder/Decoder**: Quick encoding and decoding utilities
- **Real-time Base Conversion**: Instant conversion between number systems
- **Keyboard Shortcuts**: Comprehensive hotkey support for power users
- **Expression Syntax Highlighting**: Color-coded mathematical expressions

### 🎨 User Experience
- **Dual Theme Support**: Dark and light themes with system preference detection
- **Calculation History**: Persistent history with local storage
- **Mobile-Responsive**: Touch-optimized interface for mobile devices
- **Accessibility**: ARIA labels and keyboard navigation support
- **Progressive Web App**: Installable with offline capabilities

### ⚡ Technical Highlights
- **TypeScript**: Full type safety and enhanced developer experience
- **State Management**: Pinia for reactive state management
- **Local Storage**: DexieJS for efficient IndexedDB operations
- **Precise Calculations**: Decimal.js for accurate floating-point arithmetic
- **Bundle Analysis**: Webpack analyzer for optimization insights

---

## 🗺️ Roadmap: Building a Math Notebook

### Phase 1: Enhanced Calculator (Q1 2025) ✅
- [x] TypeScript migration for type safety
- [x] Improved caching and performance optimization
- [x] Enhanced syntax highlighting
- [x] Mobile responsiveness improvements

### Phase 2: Scientific Calculator (Q2 2025) 🚧
- [ ] **Advanced Functions**: Trigonometric, logarithmic, and exponential functions
- [ ] **Constants Library**: Mathematical and physical constants (π, e, c, etc.)
- [ ] **Unit Conversions**: Length, weight, temperature, and more
- [ ] **Statistical Functions**: Mean, median, standard deviation
- [ ] **Matrix Operations**: Basic matrix arithmetic and operations

### Phase 3: Math Notebook Core (Q3 2025) 📋
- [ ] **Rich Text Editor**: Markdown-based editor with LaTeX support
- [ ] **Equation Rendering**: Beautiful mathematical equation display
- [ ] **Interactive Calculations**: Embed live calculations within notes
- [ ] **Document Management**: Create, save, and organize math notebooks
- [ ] **Export Options**: PDF, LaTeX, and HTML export capabilities

### Phase 4: Collaboration & Sharing (Q4 2025) 🤝
- [ ] **Cloud Sync**: Cross-device synchronization
- [ ] **Sharing**: Share notebooks and calculations with others
- [ ] **Collaboration**: Real-time collaborative editing
- [ ] **Version Control**: Track changes and revisions
- [ ] **Public Gallery**: Share and discover community notebooks

### Phase 5: Advanced Features (2026) 🚀
- [ ] **Graphing Calculator**: 2D and 3D function plotting
- [ ] **Programming Integration**: Code execution within notebooks
- [ ] **Plugin System**: Extensible architecture for custom tools
- [ ] **AI Assistant**: Mathematical problem-solving assistance
- [ ] **Educational Tools**: Step-by-step solution explanations

### Phase 6: Platform Expansion (2026+) 🌐
- [ ] **Desktop Applications**: Native Windows, macOS, and Linux apps
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **API Platform**: RESTful API for third-party integrations
- [ ] **Educational Partnerships**: Integration with learning platforms
- [ ] **Enterprise Features**: Team management and advanced analytics

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

# Type checking
pnpm type-check

# Lint and fix
pnpm lint
```

### Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build optimized production bundle |
| `pnpm preview` | Preview production build locally |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm lint` | Lint and auto-fix code issues |
| `pnpm build:analyze` | Build with bundle analysis |

---

## 🏗️ Architecture

```
src/
├── assets/           # Static assets (fonts, images, global CSS)
├── components/       # Reusable Vue components
│   ├── base/        # Base UI components
│   ├── layout/      # Layout-specific components
│   └── ui/          # UI utility components
├── composables/      # Vue 3 composable functions
├── layouts/          # Page layouts and views
│   ├── calculators/ # Calculator-specific layouts
│   ├── tools/       # Tool layouts (Base64, etc.)
│   └── utility/     # Utility pages (Settings, etc.)
├── services/         # Business logic and services
│   ├── display/     # Display formatting services
│   ├── factory/     # Factory patterns
│   └── logic/       # Calculator logic
├── stores/           # Pinia state management
├── utils/            # Utility functions and helpers
│   ├── cache/       # Caching utilities
│   ├── constants/   # Application constants
│   └── misc/        # Miscellaneous utilities
└── router/           # Vue Router configuration
```

---

## 🛠️ Technology Stack

### Core Framework
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling

### State & Routing
- **[Pinia](https://pinia.vuejs.org/)** - Vue state management
- **[Vue Router](https://router.vuejs.org/)** - Official router for Vue.js

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix Vue](https://www.radix-vue.com/)** - Headless UI components
- **[Lucide Icons](https://lucide.dev/)** - Beautiful & consistent icons

### Utilities & Performance
- **[VueUse](https://vueuse.org/)** - Collection of Vue composition utilities
- **[DexieJS](https://dexie.org/)** - IndexedDB wrapper for local storage
- **[Math.js](https://mathjs.org/)** - Extensive math library
- **[Anime.js](https://animejs.com/)** - Lightweight animation library

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and ensure they follow our coding standards
4. **Add tests** for new functionality
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow the existing TypeScript and Vue 3 patterns
- **Testing**: Add unit tests for new features
- **Documentation**: Update documentation for API changes
- **Performance**: Consider performance implications of changes
- **Accessibility**: Ensure new features are accessible

### Areas We Need Help

- 🧮 Scientific calculator implementation
- 📝 Math notebook editor development
- 🎨 UI/UX improvements and design
- 🧪 Test coverage expansion
- 📚 Documentation and tutorials
- 🌐 Internationalization (i18n)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Icons**: [Lucide](https://lucide.dev/) for beautiful iconography
- **Fonts**: [Inter](https://rsms.me/inter/) and [Geist Mono](https://vercel.com/font) for typography
- **Inspiration**: The developer community's need for better mathematical tools
- **Contributors**: All the amazing people who have contributed to this project

---

## 📞 Support & Community

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Whitestar14/mathlly/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/Whitestar14/mathlly/discussions)
- **📧 Contact**: [Your Email](mailto:your-email@example.com)
- **🐦 Twitter**: [@xijibomi](https://twitter.com/xijibomi)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Whitestar14">Whitestar Studios</a></p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>
