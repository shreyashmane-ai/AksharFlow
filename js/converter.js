/*
 * converter.js - Legacy Devanagari font -> Unicode conversion engine.
 *
 * Implements the standard contextual "kru2uni"-style algorithm:
 *   1. Normalize common copy-paste corruption (smart quotes).
 *   2. Apply the ordered character map (longest/specific sequences first).
 *   3. Resolve special font glyphs (±, Æ, Ç, ¯, É, Ê).
 *   4. Reorder the pre-base i-matra (ि) and i-matra+anusvara (िं).
 *   5. Move the reph (र्) mark to the front of its syllable.
 *   6. Clean up stray viramas / spacing.
 *
 * Characters that are not part of the font map (English words, punctuation,
 * line breaks) are passed through unchanged, so mixed Hindi-English text is
 * preserved.
 */

(function (global) {
  "use strict";

  const data =
    (typeof global.IndicConverterData !== "undefined" && global.IndicConverterData) ||
    (typeof require !== "undefined" ? require("./fonts.js") : null);

  function replaceAll(text, from, to) {
    return text.split(from).join(to);
  }

  function replaceFirst(text, from, to) {
    const i = text.indexOf(from);
    if (i < 0) return text;
    return text.slice(0, i) + to + text.slice(i + from.length);
  }

  // Matras scanned while moving a reph (र्) to the end of its syllable.
  const REPH_MATRA_STR = "\u093e\u093f\u0940\u0941\u0942\u0943\u0947\u0948\u094b\u094c\u0902:\u0901\u0945";

  /*
   * Convert text typed in a legacy font (e.g. Kruti Dev 010 / DevLys 010)
   * into Unicode Devanagari.
   */
  function convertLegacy(text, fontId) {
    if (!text) return "";

    const resolved = data.getMap(fontId);
    if (!resolved) return text;
    const map = resolved.map;
    const special = resolved.special;

    let t = text;

    // Prevent a space from detaching a conjunct / reph placeholder.
    t = replaceAll(t, " \u00aa", "\u00aa");
    t = replaceAll(t, " ~j", "~j");
    t = replaceAll(t, " z", "z");

    // Ordered character mapping.
    for (let i = 0; i < map.length; i++) {
      t = replaceAll(t, map[i][0], map[i][1]);
    }

    // Special glyphs that produce placeholders for the passes below.
    for (let i = 0; i < special.length; i++) {
      t = replaceAll(t, special[i][0], special[i][1]);
    }

    // Reorder chhoti-i matra: "f" is typed BEFORE its consonant.
    t = reorderMatching(t, "f", "\u093f");

    // Reorder chhoti-i + anusvara (ings): "fa" typed before its consonant.
    t = reorderMatching(t, "fa", "\u093f\u0902");

    // Fix an i-matra that landed on a half-letter:
    //   "ि्" + X  ->  "्" + X + "ि"
    t = reorderMatching(t, "\u093f\u094d", "TMP_I_HALF", true);

    // Move reph (र्) to the start of its syllable.
    t = replaceAll(t, "\u094dZ", "Z");
    t = moveReph(t);

    // Matra spacing / line-break cleanup.
    for (let i = 0; i < data.MATRA_SET.length; i++) {
      const e = data.MATRA_SET[i];
      t = replaceAll(t, " " + e, e);
      t = replaceAll(t, "," + e, e + ",");
      t = replaceAll(t, "\u094d" + e, e + ",");
    }

    // Final cleanup. (Patterns are deliberately 3-codepoint runs; a single
    // "\u094d\u0930" here would flatten real conjunct-ra ligatures like प्र.)
    t = replaceAll(t, "\u094d\u094d\u0930", "\u094d\u0930");
    t = replaceAll(t, "\u094d\u0930\u094d", "\u0930\u094d");
    t = replaceAll(t, "\u094d\u094d", "\u094d");
    t = replaceAll(t, "\u094d ", " ");

    return t.trim();
  }

  /*
   * Replace every occurrence of "marker" + nextChar with
   * nextChar + replacement (moving a pre-base matra after its consonant).
   * If keepVirama is true, apply the wrong-ee fix instead.
   */
  function reorderMatching(text, marker, replacement, keepVirama) {
    let t = text;
    const re = new RegExp(escapeRegExp(marker) + "(.?)", "g");
    let m;
    while ((m = re.exec(t)) !== null) {
      const next = m[1] !== undefined ? m[1] : "";
      let from = marker + next;
      let to;
      if (keepVirama) {
        to = "\u094d" + next + "\u093f";
      } else {
        to = next + replacement;
      }
      t = replaceFirst(t, from, to);
    }
    return t;
  }

  function moveReph(text) {
    let t = text;
    const re = /(.?)Z/g;
    let m;
    while ((m = re.exec(t)) !== null) {
      let collected = m[1] !== undefined ? m[1] : "";
      let idx = t.indexOf(collected + "Z");
      let broken = false;
      // Walk leftwards over matras/vowels to find the start of the syllable.
      while (idx >= 0 && data.MATRA_VOWEL_SET.indexOf(t[idx]) !== -1) {
        idx -= 1;
        if (idx < 0) {
          broken = true;
          break;
        }
        collected = t[idx] + collected;
      }
      if (!broken) {
        t = replaceFirst(t, collected + "Z", "\u0930\u094d" + collected);
      }
    }
    return t;
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /*
   * Convert Unicode Devanagari back into a legacy font encoding (e.g. Kruti
   * Dev 010 or Kruti Dev 050). Mirrors the reverse algorithm of the
   * lingodesi converter: normalise quotes, reorder the pre-base i-matra and
   * the reph, then apply the ordered Unicode -> legacy table.
   */
  function convertToLegacy(text, fontId) {
    if (!text) return "";

    const resolved = data.getReverse(fontId);
    if (!resolved || !resolved.font.hasReverse) return text;
    const reverse = resolved.reverse;

    let t = text;

    // Curly/straight quotes alternate between the open and close keys.
    while (t.indexOf("'") !== -1) {
      t = replaceFirst(t, "'", "^");
      t = replaceFirst(t, "'", "*");
    }
    while (t.indexOf("\"") !== -1) {
      t = replaceFirst(t, "\"", "\u00df");
      t = replaceFirst(t, "\"", "\u00de");
    }

    // Move the pre-base i-matra: "Xि" -> "fX".
    let p = t.indexOf("\u093f");
    while (p !== -1) {
      if (p === 0) {
        p = t.indexOf("\u093f", p + 1);
        continue;
      }
      const ch = t[p - 1];
      t = replaceAll(t, ch + "\u093f", "f" + ch);
      p -= 1;
      while (p > 0 && t[p - 1] === "\u094d") {
        const half = t[p - 2] + "\u094d";
        t = replaceAll(t, half + "f", "f" + half);
        p -= 2;
      }
      p = t.indexOf("\u093f", p + 1);
    }

    // Move a reph (र्) to the end of its syllable: "र्" + matras -> matras + "Z".
    t += "  ";
    let r = t.indexOf("\u0930\u094d");
    while (r > 0) {
      let end = r + 2;
      while (REPH_MATRA_STR.indexOf(t[end + 1]) !== -1) end += 1;
      const matras = t.slice(r + 2, end + 1);
      t = replaceAll(t, "\u0930\u094d" + matras, matras + "Z");
      r = t.indexOf("\u0930\u094d");
    }
    t = t.slice(0, -2);

    // Ordered Unicode -> legacy mapping.
    for (let k = 0; k < reverse.length; k++) {
      if (t.indexOf(reverse[k][0]) !== -1) {
        t = replaceAll(t, reverse[k][0], reverse[k][1]);
      }
    }

    return t;
  }

  const api = {
    convertLegacy: convertLegacy,
    convertToLegacy: convertToLegacy
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.IndicConverter = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
