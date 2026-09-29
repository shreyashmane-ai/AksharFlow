# ✨ AksharFlow · Intelligent Hindi Font & Unicode Studio

<div align="center">

![AksharFlow Banner](https://img.shields.io/badge/AksharFlow-Indic%20Typography%20Studio-f95721?style=for-the-badge&logo=devanagari)

**Next-Gen Bidirectional Converter for Legacy Devanagari Typewriter Fonts & Unicode**

[![Tests](https://img.shields.io/badge/Tests-68%2F68%20Passing-10b981?style=flat-square&logo=node.js)](test.js)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Vanilla%20JS)-6366f1?style=flat-square)](#)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-f59e0b?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](#)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Shreyash%20Mane-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/shreyash-mane-b715541a7/)
[![GitHub](https://img.shields.io/badge/GitHub-shreyashmane--ai-181717?style=flat-square&logo=github)](https://github.com/shreyashmane-ai)

</div>

---

## 📖 Overview

**AksharFlow** is a modern, ultra-fast, and completely client-side Indic font conversion studio. It seamlessly translates text typed in legacy (non-Unicode) Devanagari Remington typewriter fonts — **Kruti Dev 010**, **DevLys 010**, and **Kruti Dev 050** — into standard **Unicode Devanagari**, as well as bidirectional **reverse conversion** back into legacy typewriter formats.

Designed with a sleek **Cosmic Obsidian & Warm Light** glassmorphism interface, it runs 100% locally in your web browser with zero server transmission — ensuring total privacy for sensitive documents, legal papers, and government records.

---

## 🌟 Key Features

- 🔄 **Bidirectional High-Fidelity Conversion**:
  - **Forward**: Legacy Kruti Dev 010 / DevLys 010 / Kruti Dev 050 $\rightarrow$ Standard Unicode Devanagari.
  - **Reverse**: Standard Unicode Devanagari $\rightarrow$ Legacy Kruti Dev 010 / Kruti Dev 050.
- ⚡ **Live Real-Time Conversion**: Automatically converts as you type with debounced input, or converts on-demand via shortcut (`Ctrl + Enter`).
- 🧠 **Heuristic Auto-Detection**: Analyzes glyph frequencies to automatically differentiate between Kruti Dev 010, DevLys 010, Kruti Dev 050, and pre-existing Unicode.
- 🎨 **Instant Typography Studio (Box 2)**: Render converted Unicode Devanagari directly into selected typographic font families (*Noto Sans Devanagari*, *Mangal*, *Nirmala UI*, *Aparajita*, *Kokila*, *Segoe UI*, *Tahoma*) with customizable font sizes (`Small`, `Normal`, `Large`, `X-Large`).
- 🔁 **Studio Swap Action**: Instantly swap output text back into Box 1 for chaining or multi-step reverse workflows.
- 📋 **Quick Preset Samples**: One-click preset loader for *Standard Hindi*, *Govt / Official Letters*, *Kruti 050 Digits & Matras*, and *Complex Conjuncts & Reph*.
- 📊 **Live Text Statistics**: Real-time counter for **Characters**, **Words**, and **Lines** across both source input and target output.
- 💾 **Clipboard & File Export**: One-click copy with animated toast feedback, paste integration, and UTF-8 `.txt` (BOM-prefixed) file download.
- 🌓 **Cosmic Dark & Warm Light Themes**: Symmetrical glassmorphic UI with animated mesh aura and theme memory.

---

## 📊 Font Support Matrix

| Font Family | Encoding Standard | Keyboard Layout | Universal Web Support | Primary Use Case |
| :--- | :--- | :--- | :---: | :--- |
| **Kruti Dev 010** | Legacy ASCII (Non-Unicode) | Remington Typewriter | ❌ Requires Font | Govt typing tests, court records, DTP |
| **DevLys 010** | Legacy ASCII (Non-Unicode) | Remington Typewriter | ❌ Requires Font | Newspaper publishing & print typography |
| **Kruti Dev 050** | Legacy ASCII (Special Charset) | Remington (with Hindi Digits) | ❌ Requires Font | Documents with Hindi numerals (०–९) & math |
| **Unicode Devanagari** | UTF-8 / ISO 10646 (U+0900–U+097F) | InScript / Phonetic / Remington | ✅ Universal Native | Web, mobile, social media, databases |

---

## ⚙️ How the Conversion Engine Works

AksharFlow implements an enhanced contextual `kru2uni` linguistic algorithm:

```
[Legacy Remington Input (ASCII)]
               │
               ▼
   1. Smart Quote Normalization (“ ” ‘ ’ ➔ " ')
               │
               ▼
   2. Ordered Precedence Map (Longest sequences first)
               │
               ▼
   3. Special Glyph Expansion (±, Æ, Ç, ¯, É, Ê)
               │
               ▼
   4. Contextual Reordering:
      • Pre-base Chhoti-i Matra (f ➔ ि) moved after consonant
      • Chhoti-i + Anusvara (fa ➔ िं) moved after consonant
      • Superscript Reph (Z ➔ र्) moved to start of syllable cluster
               │
               ▼
   5. Virama & Spacing Cleanup pass
               │
               ▼
[Clean Unicode Devanagari Output (U+0900–U+097F)]
```

The **reverse conversion** mirrors this pipeline: normalizing quotes, reordering pre-base matras and rephs, and applying an ordered Unicode $\rightarrow$ legacy mapping table.

---

## 📁 Project Structure

```
AksharFlow/
├── index.html        # Symmetrical 2-Box Studio UI with glassmorphism
├── styles.css        # Cosmic Obsidian (Dark) & Warm Pearl (Light) design system
├── README.md         # Project documentation & reference
├── PROJECT.md        # Technical specifications
├── test.js           # Comprehensive Node.js unit test suite (68 assertions)
├── .gitignore        # Git ignore rules
└── js/
    ├── fonts.js      # Ordered conversion tables (forward + reverse) and font registry
    ├── converter.js  # Conversion engine: convertLegacy & convertToLegacy
    ├── detector.js   # Heuristic auto-detection and scoring engine
    └── app.js        # Reactive UI wiring, live debouncing, toasts, shortcuts
```

---

## 🚀 Quick Start & Usage

### 1. Run in Browser
No build tools, npm packages, or server installations are required:
```bash
# Simply open index.html in any modern browser
open index.html
```

### 2. Run Test Suite
AksharFlow includes a built-in zero-dependency Node.js test suite with 68 test assertions:

```bash
node test.js
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> | Convert text immediately |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> | Copy converted output to clipboard |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Navigate controls smoothly |

---

## 👤 Author & Connect

Designed and Developed by **[Shreyash Mane](https://www.linkedin.com/in/shreyash-mane-b715541a7/)**.

* **LinkedIn**: [linkedin.com/in/shreyash-mane-b715541a7](https://www.linkedin.com/in/shreyash-mane-b715541a7/)
* **GitHub**: [@shreyashmane-ai](https://github.com/shreyashmane-ai)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
