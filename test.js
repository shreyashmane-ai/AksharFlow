const fs = require('fs');
const path = require('path');

const dir = 'E:/My Projects/text converter/js';
global.IndicConverterData = require(path.join(dir, 'fonts.js'));
global.IndicConverter = require(path.join(dir, 'converter.js'));
global.IndicDetector = require(path.join(dir, 'detector.js'));

// Expected outputs are byte-verified against the production converter at
// lingodesi.com (the extracted "kru2uni" implementation).
const cases = [
  // [legacy input, expected Unicode]
  ["dbZ dqN ugha dgk fd", "कई कुछ नहीं कहा कि"],
  ["vkius vk;k", "आपने आया"],
  ["fganh", "हिंदी"],
  ["dksbZ", "कोई"],
  ["Hkkjr", "भारत"],
  ["eSa", "मैं"],
  ["vki", "आप"],
  ["mudk", "उनका"],
  ["gekjs", "हमारे"],
  ["lwjt", "सूरज"],
  ["D;k", "क्या"],
  ["gS", "है"],
  ["deZ", "कर्म"],
  ["drkZ", "कर्ता"],
  ["dhfrZ", "कीर्ति"],
  ["dkz;", "का्रय"],
  ["eSlZl", "मैर्सस"],
  ["izrf", "प्रति"],
  ["izdk'k", "प्रकाश"],
  ["vki dqN Hkh dg ldrs gSa", "आप कुछ भी कह सकते हैं"],
  ["123 å", "123 ०"],
  ["dke eaftye", "काम मंजिलम"],
  ["izse", "प्रेम"],
  ["fo|ky;", "विद्यालय"],
  ["lalkj", "संसार"],
  ["vf/kdkj", "अधिकार"],
  ["Kku", "ज्ञान"],
  ["x.kuk", "गणना"],
  ["{kek", "क्षमा"],
  ["vkt", "आज"],
  ["yksx", "लोग"],
  ["v/;kid", "अध्यापक"],
  ["blh dkj.k mls dke ugha feyk", "इसी कारण उसे काम नहीं मिला"],
];

// Kruti Dev 050 forward cases. Expected outputs are byte-verified against
// pramukhfontconverter.com's Kruti Dev 050 converter.
const cases050 = [
  // [legacy input, expected Unicode]
  ["Hkkjr", "भारत"],
  ["dksbZ Hkh", "कोई भी"],
  ["izdk'k", "प्रकाश"],
  ["fganh", "हिंदी"],
  ["esllZ vkius ,d mnkgj.k fn;k gS t\u00a8 esjs fy, cgqr mi;\u00a8xh gSA", "मेसर्स आपने एक उदाहरण दिया है जो मेरे लिए बहुत उपयोगी है।"],
  ["\u00d2kjr", "भारत"],           // Òkjr  (050 key for bh)
  ["d\u00a8", "को"],                // d¨    (050 key for "o" matra)
  ["d\u00a9", "कौ"],                // d©    (050 key for "au" matra)
  ["\u00c1dk'k", "प्रकाश"],        // Ádk'k (050 key for pra)
  ["\u00e5k", "ञ"],                 // åk
  ["vkW", "ऑ"],                     // vkW
  ["AA", "॥"],                      // AA
  ["0 12345 6789", "० १२३४५ ६७८९"],
  ["dkS vkSj d\u00a9", "कौ और कौ"] // mixed 010-style + 050-style
];

let pass = 0;
let fail = 0;
for (const [input, expected] of cases) {
  const out = global.IndicConverter.convertLegacy(input, 'krutidev');
  const ok = out === expected;
  if (ok) pass++;
  else fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + JSON.stringify(input) + '\n       got: ' + JSON.stringify(out) + '\n       exp: ' + JSON.stringify(expected));
}

console.log('\nKruti Dev 050 forward:');
for (const [input, expected] of cases050) {
  const out = global.IndicConverter.convertLegacy(input, 'krutidev050');
  const ok = out === expected;
  if (ok) pass++;
  else fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + JSON.stringify(input) + '\n       got: ' + JSON.stringify(out) + '\n       exp: ' + JSON.stringify(expected));
}

// Reverse (Unicode -> legacy). The 010 expectations are byte-verified against
// the lingodesi converter; the 050 expectations against pramukhfontconverter.com.
const reverseCases = [
  // [fontId, unicode, expected legacy]
  ["krutidev", "भारत", "Hkkjr"],
  ["krutidev", "कोई भी", "dksbZ Hkh"],
  ["krutidev", "हिंदी", "fganh"],
  ["krutidev", "कीर्ति", "dhfrZ"],
  ["krutidev", "कर्म", "deZ"],
  ["krutidev050", "भारत", "\u00d2kjr"],
  ["krutidev050", "तो", "r\u00a8"],
  ["krutidev050", "जो", "t\u00a8"],
  ["krutidev050", "कौ", "d\u00a9"],
  ["krutidev050", "प्रकाश", "\u00c1dk'k"],
  ["krutidev050", "हिंदी", "fganh"],
  ["krutidev050", "कीर्ति", "dhfrZ"],
  ["krutidev050", "मेसर्स आपने एक उदाहरण दिया है जो मेरे लिए बहुत उपयोगी है।", "esllZ vkius ,d mnkgj.k fn;k gS t\u00a8 esjs fy, cgqr mi;\u00a8xh gSA"],
  ["krutidev050", "ऑ", "vkW"],
  ["krutidev050", "ञ", "\u00e5k"],
  ["krutidev050", "॥", "AA"],
  ["krutidev050", "०१२३४५६७८९", "0123456789"]
];
console.log('\nReverse (Unicode -> legacy):');
for (const [fontId, input, expected] of reverseCases) {
  const out = global.IndicConverter.convertToLegacy(input, fontId);
  const ok = out === expected;
  if (ok) pass++;
  else fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  [' + fontId + '] ' + JSON.stringify(input) + '\n       got: ' + JSON.stringify(out) + '\n       exp: ' + JSON.stringify(expected));
}

// Round trips
console.log('\nRound trips:');
const roundTrips = [
  ["krutidev", "विद्यालय"],
  ["krutidev", "अध्यापक"],
  ["krutidev050", "मेसर्स आपने एक उदाहरण दिया है जो मेरे लिए बहुत उपयोगी है।"],
  ["krutidev050", "राष्ट्रीय परिषद्"]
];
for (const [fontId, unicode] of roundTrips) {
  const legacy = global.IndicConverter.convertToLegacy(unicode, fontId);
  const back = global.IndicConverter.convertLegacy(legacy, fontId);
  const ok = back === unicode;
  if (ok) pass++;
  else fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  [' + fontId + '] ' + JSON.stringify(unicode) + '\n       legacy: ' + JSON.stringify(legacy) + '\n       back:   ' + JSON.stringify(back));
}

console.log('\nDetector tests:');
console.log(JSON.stringify(global.IndicDetector.detectAndConvert("dbZ dqN ugha dgk fd")));
console.log(JSON.stringify(global.IndicDetector.detectAndConvert("\u00d2kjr d\u00a8 d\u00a9")));  // 050-specific keys detected
console.log(JSON.stringify(global.IndicDetector.detectAndConvert("यह पहले से ही यूनिकोड है")));

console.log('\nResult: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
