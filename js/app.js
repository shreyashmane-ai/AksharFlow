/*
 * AksharFlow — app.js
 * High-performance UI engine for bidirectional Indic font conversion studio.
 */

(function () {
  "use strict";

  const $ = function (id) {
    return document.getElementById(id);
  };

  const data =
    (typeof IndicConverterData !== "undefined" && IndicConverterData) ||
    (typeof module !== "undefined" && require("./fonts.js"));

  function findFont(fontId) {
    for (let i = 0; i < data.FONTS.length; i++) {
      if (data.FONTS[i].id === fontId) return data.FONTS[i];
    }
    return null;
  }

  const els = {
    input: $("inputText"),
    sourceFont: $("sourceFontSelect"),
    convert: $("convertBtn"),
    sample: $("sampleBtn"),
    clear: $("clearBtn"),
    pasteBtn: $("pasteInputBtn"),
    swapBtn: $("swapBtn"),
    inputStatus: $("inputStatus"),
    targetFont: $("targetFontSelect"),
    fontSize: $("fontSize"),
    submit: $("submitBtn"),
    filtered: $("filteredOut"),
    copyFiltered: $("copyFilteredBtn"),
    downloadFiltered: $("downloadFilteredBtn"),
    filteredCharCount: $("filteredCharCount"),
    filteredStatus: $("filteredStatus"),
    liveModeToggle: $("liveModeToggle"),
    inCharCount: $("inCharCount"),
    inWordCount: $("inWordCount"),
    inLineCount: $("inLineCount"),
    outWordCount: $("outWordCount"),
    outLineCount: $("outLineCount"),
    toastContainer: $("toastContainer")
  };

  // Curated Preset Samples for Demonstration & Testing
  const PRESET_SAMPLES = {
    standard: "esllZ vkius ,d mnkgj.k fn;k gS tks esjs fy, cgqr mi;ksxh gSA",
    official: "dk;kZy; vkns'k % Jh izdk'k 'kekZ dks rRdky izHkko ls ofj\"B vf/kdkjh in ij inksUur fd;k tkrk gSA",
    kruti050: "Hkkjr d¨ 12345 v©j 6789 Ádk'k dh vko';drk gSA",
    complex: "jk\"Vªh; ifj\"kn~ }kjk fo|ky; esa Kku] foKku ,oa {kek ij fo'ks\"k O;k[;ku vk;ksftr fd;k x;kA"
  };

  let lastUnicode = "";
  let liveConvertEnabled = true;
  let liveDebounceTimer = null;

  /* ---------- Toast System ---------- */
  function showToast(message, type) {
    if (!els.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    
    let iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    if (type === "warn" || type === "error") {
      iconSvg = '<svg class="toast-icon" style="color:var(--accent-rose)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }

    toast.innerHTML = iconSvg + "<span>" + message + "</span>";
    els.toastContainer.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add("show");
    });

    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 2800);
  }

  /* ---------- Theme Management ---------- */
  (function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem("aksharflow-theme") || localStorage.getItem("font-converter-theme");
    } catch (e) { /* storage unavailable */ }
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem("aksharflow-theme", next);
        } catch (e) { /* storage unavailable */ }
        showToast("Theme switched to " + (next === "dark" ? "Cosmic Dark" : "Warm Light"));
      });
    }
  })();

  /* ---------- Status Helpers ---------- */
  function setStatus(el, msg, cls) {
    if (!el) return;
    el.textContent = msg;
    el.className = "status" + (cls ? " " + cls : "");
  }

  /* ---------- Text Statistics Counter ---------- */
  function getStats(text) {
    if (!text) return { chars: 0, words: 0, lines: 0 };
    const chars = text.length;
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    return { chars: chars, words: words, lines: lines };
  }

  function updateCounts() {
    const inText = els.input ? els.input.value : "";
    const inStats = getStats(inText);
    if (els.inCharCount) els.inCharCount.textContent = inStats.chars;
    if (els.inWordCount) els.inWordCount.textContent = inStats.words;
    if (els.inLineCount) els.inLineCount.textContent = inStats.lines;

    const outText = els.filtered ? (els.filtered.textContent || "") : "";
    const outStats = getStats(outText);
    if (els.outWordCount) els.outWordCount.textContent = outStats.words;
    if (els.outLineCount) els.outLineCount.textContent = outStats.lines;
    if (els.filteredCharCount) {
      els.filteredCharCount.textContent = outStats.chars ? outStats.chars + " chars" : "0 chars";
    }
  }

  /* ---------- Main Conversion Routine ---------- */
  function convert(isSilent) {
    const raw = els.input.value;
    lastUnicode = "";
    els.filtered.textContent = "";
    setStatus(els.inputStatus, "");
    setStatus(els.filteredStatus, "");

    if (!raw.trim()) {
      if (!isSilent) {
        setStatus(els.inputStatus, "Please paste or type text in Box 1.");
      }
      updateCounts();
      return;
    }

    const manual = els.sourceFont.value;
    let result;

    if (manual === "auto") {
      result = IndicDetector.detectAndConvert(raw);
    } else {
      if (IndicDetector.isUnicodeDevanagari(raw)) {
        result = {
          alreadyUnicode: true,
          fontId: null,
          fontLabel: null,
          confidence: 1,
          output: raw
        };
      } else {
        const fontEntry = findFont(manual);
        result = {
          alreadyUnicode: false,
          fontId: manual,
          fontLabel: fontEntry ? fontEntry.label : manual,
          confidence: 1,
          output: IndicConverter.convertLegacy(raw, manual)
        };
      }
    }

    lastUnicode = result.output;

    if (result.alreadyUnicode) {
      setStatus(
        els.inputStatus,
        "✨ Unicode Devanagari detected — ready for typography formatting or reverse conversion.",
        "status-detected"
      );
    } else if (result.fontId) {
      const pct = Math.round(result.confidence * 100);
      setStatus(
        els.inputStatus,
        "✓ Auto-Detected: " + result.fontLabel + " (Confidence " + pct + "%)",
        "status-detected"
      );
    } else {
      setStatus(
        els.inputStatus,
        "Could not detect source font. Try choosing a specific font manually.",
        "status-warn"
      );
    }

    renderOutput();
    updateCounts();
  }

  /* ---------- Output Renderer ---------- */
  function renderOutput() {
    if (!lastUnicode) return;
    const target = els.targetFont.value;
    const fontEntry = findFont(target);
    els.filtered.style.fontSize = els.fontSize.value;

    if (fontEntry && fontEntry.hasReverse) {
      // Reverse legacy conversion
      const legacy = IndicConverter.convertToLegacy(lastUnicode, fontEntry.id);
      els.filtered.textContent = legacy;
      els.filtered.style.fontFamily = "\"" + fontEntry.label + "\", sans-serif";
      setStatus(els.filteredStatus, "Converted to: " + fontEntry.label, "status-detected");
    } else {
      // Modern Unicode rendering
      els.filtered.textContent = lastUnicode;
      els.filtered.style.fontFamily = target;
      setStatus(els.filteredStatus, "Rendered in: " + selectedLabel(els.targetFont), "status-detected");
    }
  }

  function submitFont() {
    if (!lastUnicode) {
      setStatus(els.filteredStatus, "Convert something first — Box 1 is empty.", "status-warn");
      showToast("Please enter source text first", "warn");
      return;
    }
    renderOutput();
    updateCounts();
    showToast("Applied font: " + selectedLabel(els.targetFont));
  }

  function selectedLabel(select) {
    const opt = select.options[select.selectedIndex];
    return opt ? opt.textContent.replace(/^[✨🔄\s]+/, "") : "";
  }

  /* ---------- Clipboard & Download Helpers ---------- */
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      onCopySuccess();
    } catch (e) {
      setStatus(els.filteredStatus, "Copy failed — select the text manually.", "status-error");
      showToast("Copy failed — please copy manually", "error");
    }
    document.body.removeChild(ta);
  }

  function onCopySuccess() {
    setStatus(els.filteredStatus, "Output copied to clipboard.", "status-detected");
    showToast("✓ Copied output to clipboard!");
    
    // Animate copy button
    if (els.copyFiltered) {
      const originalText = els.copyFiltered.innerHTML;
      els.copyFiltered.classList.add("btn-copied");
      els.copyFiltered.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span>';
      setTimeout(function () {
        els.copyFiltered.classList.remove("btn-copied");
        els.copyFiltered.innerHTML = originalText;
      }, 2000);
    }
  }

  function copyOutput() {
    const text = els.filtered.textContent;
    if (!text) {
      showToast("Nothing to copy — output is empty", "warn");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onCopySuccess).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function download(filename, text) {
    if (!text) {
      showToast("Output is empty — nothing to download", "warn");
      return;
    }
    const blob = new Blob(["\ufeff" + text], {
      type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded " + filename);
  }

  /* ---------- Swap Functionality ---------- */
  function swapText() {
    const outText = els.filtered.textContent || "";
    if (!outText.trim()) {
      showToast("Output is empty — nothing to swap", "warn");
      return;
    }
    els.input.value = outText;
    els.sourceFont.value = "auto";
    convert();
    showToast("Swapped text to Box 1!");
  }

  /* ---------- Paste Functionality ---------- */
  function pasteInput() {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (clipText) {
        if (clipText) {
          els.input.value = clipText;
          convert();
          showToast("Pasted from clipboard!");
        }
      }).catch(function () {
        els.input.focus();
        showToast("Press Ctrl+V to paste into Box 1");
      });
    } else {
      els.input.focus();
      showToast("Press Ctrl+V to paste into Box 1");
    }
  }

  /* ---------- Event Listeners ---------- */
  els.convert.addEventListener("click", function () {
    convert();
    if (els.input.value.trim()) {
      showToast("Converted successfully!");
    }
  });

  els.sample.addEventListener("click", function () {
    els.input.value = PRESET_SAMPLES.standard;
    convert();
    showToast("Loaded standard Hindi sample");
  });

  els.clear.addEventListener("click", function () {
    els.input.value = "";
    els.filtered.textContent = "";
    lastUnicode = "";
    setStatus(els.inputStatus, "");
    setStatus(els.filteredStatus, "");
    updateCounts();
    showToast("Cleared studio workspace");
  });

  if (els.pasteBtn) {
    els.pasteBtn.addEventListener("click", pasteInput);
  }

  if (els.swapBtn) {
    els.swapBtn.addEventListener("click", swapText);
  }

  els.submit.addEventListener("click", submitFont);
  els.copyFiltered.addEventListener("click", copyOutput);

  els.downloadFiltered.addEventListener("click", function () {
    download("aksharflow-output.txt", els.filtered.textContent);
  });

  // Target font and size instant change
  els.targetFont.addEventListener("change", function () {
    if (lastUnicode) {
      renderOutput();
      updateCounts();
    }
  });

  els.fontSize.addEventListener("change", function () {
    els.filtered.style.fontSize = els.fontSize.value;
  });

  els.sourceFont.addEventListener("change", function () {
    if (els.input.value.trim()) {
      convert();
    }
  });

  // Live real-time conversion toggle
  if (els.liveModeToggle) {
    els.liveModeToggle.addEventListener("click", function () {
      liveConvertEnabled = !liveConvertEnabled;
      if (liveConvertEnabled) {
        els.liveModeToggle.classList.add("active");
        showToast("Live Real-time Convert Enabled");
        if (els.input.value.trim()) convert(true);
      } else {
        els.liveModeToggle.classList.remove("active");
        showToast("Live Convert Disabled (Manual mode)");
      }
    });
  }

  // Real-time input listener with debouncing
  els.input.addEventListener("input", function () {
    updateCounts();
    if (liveConvertEnabled) {
      clearTimeout(liveDebounceTimer);
      liveDebounceTimer = setTimeout(function () {
        convert(true);
      }, 120);
    } else {
      setStatus(els.inputStatus, "");
    }
  });

  // Preset Chips
  document.querySelectorAll(".preset-chip").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const presetKey = btn.getAttribute("data-preset");
      if (PRESET_SAMPLES[presetKey]) {
        els.input.value = PRESET_SAMPLES[presetKey];
        convert();
        showToast("Loaded preset: " + btn.textContent);
      }
    });
  });

  // Global Keyboard Shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl + Enter to Convert
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      convert();
      showToast("Converted via shortcut (Ctrl+↵)");
    }
    // Ctrl + Shift + C to Copy output
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.key === "c")) {
      e.preventDefault();
      copyOutput();
    }
  });

  // Initialize
  updateCounts();
})();
