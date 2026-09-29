# AksharFlow — Intelligent Hindi Font & Unicode Studio

**AksharFlow** is a modern, high-speed, 100% client-side Indic font conversion studio. It converts text typed in legacy (non-Unicode) Devanagari typewriter fonts — **Kruti Dev 010**, **DevLys 010**, and **Kruti Dev 050** — into standard **Unicode Devanagari**, and offers bidirectional reverse conversion back into legacy fonts.

Designed and Developed by **Shreyash Mane**.

---

## 🌟 Key Features

- **Bidirectional Conversions**:
  - Legacy Remington layout (`Kruti Dev 010`, `DevLys 010`, `Kruti Dev 050`) ➔ Standard Unicode Devanagari.
  - Unicode Devanagari ➔ Legacy Remington layout (`Kruti Dev 010`, `Kruti Dev 050`).
- **Heuristic Auto-Detection**: Scores font character frequencies to automatically identify Kruti Dev 010, DevLys, Kruti Dev 050, or native Unicode Devanagari.
- **Instant Typography Studio (Box 2)**: Render converted Unicode Devanagari directly into selected typographic font families (*Noto Sans Devanagari*, *Mangal*, *Nirmala UI*, *Aparajita*, *Kokila*, *Segoe UI*, *Tahoma*) with adjustable sizes.
- **Studio Divider & Swap Action**: Swap output text back into Box 1 for chaining or multi-step reverse workflows.
- **Quick Preset Samples**: One-click presets for Standard Hindi, Government Circulars, Kruti 050 Digits & Matras, and Complex Conjuncts & Reph.
- **Smart Text Statistics**: Live real-time character count, word count, and line count for both source input and target output.
- **Clipboard & Export**: One-click copy with animated toast feedback, paste-from-clipboard integration, and BOM-prefixed UTF-8 `.txt` file export.
- **Cosmic Obsidian & Warm Light Themes**: Rich dark/light glassmorphic UI with animated mesh aura and theme memory.

---

## ⚙️ How it Works

The conversion engine implements the standard contextual `kru2uni`-style algorithm:

1. **Quote Normalization**: Normalize smart quotes (`“ ” ‘ ’`) to straight equivalents.
2. **Ordered Precedence Mapping**: Applies the priority-ordered character map (longest and specific sequences first).
3. **Special Glyph Expansion**: Resolves combined glyph markers (`±`, `Æ`, `Ç`, `¯`, `É`, `Ê`) that encode complex reph/anusvara/matra combinations.
4. **Contextual Reordering**:
   - Moves the pre-base chhoti-i matra (`ि`) and chhoti-i + anusvara (`िं`) from before to after its target consonant or half-letter conjunct.
   - Moves the reph (`र्`) superscript mark to the start of its syllable cluster.
5. **Virama & Matra Cleanup**: Cleans up stray viramas (`्`), spaces before matras, and spacing artifacts.
6. **Mixed-Text Preservation**: Non-Devanagari characters (English alphanumeric, symbols, punctuation) pass through untouched.

The reverse path mirrors this: quote normalization, i-matra and reph reordering, then an ordered Unicode → legacy table.

---

## 📁 Project Structure

```
text converter/
├── index.html        # Modern 2-Box Studio UI with responsive glassmorphism
├── styles.css        # Cosmic dark & warm light design system, tokens, and animations
├── test.js           # Comprehensive Node test runner (68 assertions)
├── PROJECT.md        # Architecture & documentation
└── js/
    ├── fonts.js      # Ordered conversion tables (forward + reverse) and font registry
    ├── converter.js  # Core conversion engine: convertLegacy & convertToLegacy
    ├── detector.js   # Heuristic auto font detection & Unicode scoring
    └── app.js        # Reactive UI studio wiring, live convert, toasts, shortcuts, clipboard
```

---

## 🧪 Testing & Validation

Run the test suite with Node:

```bash
node test.js
```

Covers forward conversions (010 & 050), reverse conversions, round-trips, and font detection — 68 assertions, all passing.
