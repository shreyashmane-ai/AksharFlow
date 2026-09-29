/*
 * detector.js - Automatic font detection for legacy Devanagari input.
 *
 * Rules:
 *   - If the text already contains Devanagari code points it is Unicode;
 *     nothing needs converting.
 *   - Otherwise convert the text with each supported legacy font map and
 *     score the result by how much valid Devanagari it produced. The map
 *     with the highest score wins.
 *
 * Kruti Dev 010 and DevLys 010 share the same character map, so when both
 * tie the first is chosen. The structure supports adding more fonts later.
 */

(function (global) {
  "use strict";

  const converter =
    (typeof global.IndicConverter !== "undefined" && global.IndicConverter) ||
    (typeof require !== "undefined" ? require("./converter.js") : null);
  const data =
    (typeof global.IndicConverterData !== "undefined" && global.IndicConverterData) ||
    (typeof require !== "undefined" ? require("./fonts.js") : null);

  const DEVANAGARI_RE = /[\u0900-\u097F\uA8E0-\uA8FF]/;
  const LATIN_LETTER_RE = /[A-Za-z]/;

  function isUnicodeDevanagari(text) {
    return DEVANAGARI_RE.test(text);
  }

  // Percentage of the meaningful characters (letters) that were converted
  // to Devanagari by a given map.
  function score(text, converted) {
    const letters = text.split("").filter(function (ch) {
      return LATIN_LETTER_RE.test(ch) || /[\u0080-\u024F]/.test(ch);
    }).length;
    const convertedChars = converted.split("").filter(function (ch) {
      return DEVANAGARI_RE.test(ch);
    }).length;
    const outLetters = converted.split("").filter(function (ch) {
      return LATIN_LETTER_RE.test(ch);
    }).length;
    // Reward Devanagari output, penalise leftover Latin letters.
    return convertedChars - outLetters * 2 - (letters > 0 ? letters * 0.5 : 0);
  }

  /*
   * Detect the source font and convert to Unicode.
   * Returns { alreadyUnicode, fontId, fontLabel, confidence, output }.
   */
  function detectAndConvert(text) {
    const result = {
      alreadyUnicode: false,
      fontId: null,
      fontLabel: null,
      confidence: 0,
      output: text
    };

    const trimmed = (text || "").trim();
    if (!trimmed) return result;

    if (isUnicodeDevanagari(trimmed)) {
      result.alreadyUnicode = true;
      result.output = text;
      return result;
    }

    let bestId = null;
    let bestLabel = null;
    let bestScore = -Infinity;
    let bestOutput = text;

    for (let i = 0; i < data.FONTS.length; i++) {
      const font = data.FONTS[i];
      if (!font.hasMap) continue;
      const output = converter.convertLegacy(text, font.id);
      const s = score(text, output);
      if (s > bestScore) {
        bestScore = s;
        bestId = font.id;
        bestLabel = font.label;
        bestOutput = output;
      }
    }

    if (bestId) {
      result.fontId = bestId;
      result.fontLabel = bestLabel;
      result.confidence = Math.max(0, Math.min(1, bestScore / Math.max(1, trimmed.length)));
      result.output = bestOutput;
    }

    return result;
  }

  const api = {
    isUnicodeDevanagari: isUnicodeDevanagari,
    detectAndConvert: detectAndConvert
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.IndicDetector = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
