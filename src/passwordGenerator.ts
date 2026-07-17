import { commonWords } from './words';

export interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidSimilar: boolean;
  memorable: boolean;
}

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 32;

const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

function getUnbiasedIndex(max: number): number {
  if (max <= 0) throw new RangeError('max must be a positive integer');
  if (max === 1) return 0;
  const rejectThreshold = max * Math.floor(0x100000000 / max);
  const arr = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(arr);
    value = arr[0];
  } while (value >= rejectThreshold);
  return value % max;
}

function getCharsets(options: PasswordOptions) {
  let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowercase = 'abcdefghijklmnopqrstuvwxyz';
  let numbers = '0123456789';

  if (options.avoidSimilar) {
    uppercase = uppercase.replace(/[IO]/g, '');
    lowercase = lowercase.replace(/[l]/g, '');
    numbers = numbers.replace(/[10]/g, '');
  }

  return { uppercase, lowercase, numbers, symbols: SYMBOLS };
}

function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getUnbiasedIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export function generateMemorablePassword(length: number, options: PasswordOptions): string {
  if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
    throw new Error('Please select at least one option');
  }

  const { numbers, symbols } = getCharsets(options);
  let result = '';

  const reservedNumbers = options.numbers ? 2 : 0;
  const reservedSymbols = options.symbols ? 2 : 0;
  const wordBudget = length - reservedNumbers - reservedSymbols;

  if (options.uppercase || options.lowercase) {
    while (result.length < wordBudget) {
      const remaining = wordBudget - result.length;
      const candidates = commonWords.filter(w => w.length <= remaining && remaining - w.length !== 1);
      if (candidates.length === 0) break;

      const word = candidates[getUnbiasedIndex(candidates.length)];
      let processedWord: string;
      if (options.uppercase && !options.lowercase) {
        processedWord = word.toUpperCase();
      } else if (options.uppercase) {
        processedWord = word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        processedWord = word;
      }

      result += processedWord;
    }

    // Pad remaining characters with random letters if words couldn't fill the budget
    const { uppercase, lowercase } = getCharsets(options);
    while (result.length < wordBudget) {
      let chars = '';
      if (options.uppercase) chars += uppercase;
      if (options.lowercase) chars += lowercase;
      result += chars[getUnbiasedIndex(chars.length)];
    }
  }

  if (options.numbers && result.length < length) {
    const remaining = length - result.length;
    const numDigits = options.symbols ? Math.ceil(remaining / 2) : remaining;
    for (let i = 0; i < numDigits; i++) {
      result += numbers[getUnbiasedIndex(numbers.length)];
    }
  }

  if (options.symbols && result.length < length) {
    const symbolsToAdd = length - result.length;
    for (let i = 0; i < symbolsToAdd; i++) {
      result += symbols[getUnbiasedIndex(symbols.length)];
    }
  }

  // When words are present, shuffle only the suffix to preserve readability
  if (options.uppercase || options.lowercase) {
    const wordPart = result.slice(0, wordBudget);
    const nonWordPart = result.slice(wordBudget);
    return wordPart + shuffleString(nonWordPart);
  }
  // No words — shuffle the entire result to avoid ordering bias
  return shuffleString(result);
}

export function generateRandomPassword(length: number, options: PasswordOptions): string {
  const { uppercase, lowercase, numbers, symbols } = getCharsets(options);

  let chars = '';
  const requiredChars: string[] = [];

  if (options.uppercase) {
    chars += uppercase;
    requiredChars.push(uppercase[getUnbiasedIndex(uppercase.length)]);
  }
  if (options.lowercase) {
    chars += lowercase;
    requiredChars.push(lowercase[getUnbiasedIndex(lowercase.length)]);
  }
  if (options.numbers) {
    chars += numbers;
    requiredChars.push(numbers[getUnbiasedIndex(numbers.length)]);
  }
  if (options.symbols) {
    chars += symbols;
    requiredChars.push(symbols[getUnbiasedIndex(symbols.length)]);
  }

  if (chars === '') {
    throw new Error('Please select at least one option');
  }

  if (length < requiredChars.length) {
    throw new Error('Password length is too short for the selected options');
  }

  const allChars: string[] = [...requiredChars];
  for (let i = requiredChars.length; i < length; i++) {
    allChars.push(chars[getUnbiasedIndex(chars.length)]);
  }

  // Fisher-Yates shuffle to distribute required chars randomly
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = getUnbiasedIndex(i + 1);
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  return allChars.join('');
}

export function generatePassword(length: number, options: PasswordOptions): string {
  if (length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new RangeError(`Password length must be between ${MIN_LENGTH} and ${MAX_LENGTH}`);
  }
  return options.memorable
    ? generateMemorablePassword(length, options)
    : generateRandomPassword(length, options);
}

export type StrengthLevel = 'pathetic' | 'weak' | 'meh' | 'fair' | 'decent' | 'solid' | 'strong' | 'fortress' | 'unbreakable' | 'overkill';

export interface PasswordStrength {
  entropy: number;
  level: StrengthLevel;
  crackTime: string;
}

export function calculateEntropy(password: string, options?: PasswordOptions): number {
  if (!password) return 0;

  if (options?.memorable && (options.uppercase || options.lowercase)) {
    return calculateMemorableEntropy(password, options);
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += SYMBOLS.length;

  if (poolSize === 0) return 0;
  return password.length * Math.log2(poolSize);
}

function log2BigInt(n: bigint): number {
  if (n <= 0n) return 0;
  const s = n.toString(2);
  const bitLen = s.length;
  if (bitLen <= 53) {
    return Math.log2(Number(n));
  }
  // For large numbers, use top 53 bits for precision
  const topBits = Number(n >> BigInt(bitLen - 53));
  return Math.log2(topBits) + (bitLen - 53);
}

function calculateMemorableEntropy(password: string, options: PasswordOptions): number {
  const { numbers, symbols } = getCharsets(options);

  const reservedNumbers = options.numbers ? 2 : 0;
  const reservedSymbols = options.symbols ? 2 : 0;
  const wordBudget = password.length - reservedNumbers - reservedSymbols;

  if (wordBudget < 2) {
    // Too short for words, only digits/symbols contribute
    const digitEntropy = reservedNumbers * Math.log2(numbers.length || 1);
    const symbolEntropy = reservedSymbols * Math.log2(symbols.length || 1);
    return digitEntropy + symbolEntropy;
  }

  // Count words by length
  const maxWordLen = commonWords.reduce((max, w) => Math.max(max, w.length), 0);
  const wordsByLength: number[] = new Array(maxWordLen + 1).fill(0);
  for (const w of commonWords) {
    wordsByLength[w.length]++;
  }

  // DP: paths[i] = total number of distinct word sequences that fill exactly i characters
  // This mirrors the generation algorithm's filtering: length <= remaining && remaining - length !== 1
  const paths: bigint[] = new Array(wordBudget + 1).fill(0n);
  paths[0] = 1n;

  for (let i = 2; i <= wordBudget; i++) {
    for (let L = 2; L <= Math.min(i, maxWordLen); L++) {
      if (i - L === 1) continue; // generation skips choices that leave exactly 1 char
      if (wordsByLength[L] > 0 && paths[i - L] > 0n) {
        paths[i] += BigInt(wordsByLength[L]) * paths[i - L];
      }
    }
  }

  // Entropy from the word portion
  const wordEntropy = paths[wordBudget] > 0n ? log2BigInt(paths[wordBudget]) : 0;

  // Each digit is chosen from the digit pool
  const digitEntropy = reservedNumbers * Math.log2(numbers.length || 1);

  // Each symbol is chosen from the symbol pool
  const symbolEntropy = reservedSymbols * Math.log2(symbols.length || 1);

  return wordEntropy + digitEntropy + symbolEntropy;
}

function formatCrackTime(seconds: number): string {
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = hours / 24;
  if (days < 365) return `${Math.round(days)} days`;
  const years = days / 365;
  if (years < 1e3) return `${formatNumber(years)} years`;
  if (years < 1e6) return `${formatNumber(years / 1e3)} thousand years`;
  if (years < 1e9) return `${formatNumber(years / 1e6)} million years`;
  if (years < 1e12) return `${formatNumber(years / 1e9)} billion years`;
  return `${formatNumber(years / 1e12)} trillion years`;
}

function formatNumber(n: number): string {
  if (n >= 100) return Math.round(n).toLocaleString();
  if (n >= 10) return Math.round(n).toString();
  return n.toFixed(1);
}

export function getPasswordStrength(password: string, options?: PasswordOptions): PasswordStrength {
  const entropy = calculateEntropy(password, options);

  let level: StrengthLevel;
  if (entropy < 20) level = 'pathetic';
  else if (entropy < 35) level = 'weak';
  else if (entropy < 45) level = 'meh';
  else if (entropy < 55) level = 'fair';
  else if (entropy < 65) level = 'decent';
  else if (entropy < 75) level = 'solid';
  else if (entropy < 85) level = 'strong';
  else if (entropy < 100) level = 'fortress';
  else if (entropy < 120) level = 'unbreakable';
  else level = 'overkill';

  // Assume 10 billion guesses per second (modern GPU cluster)
  const guessesPerSecond = 1e10;
  const combinations = Math.pow(2, entropy);
  const avgSeconds = combinations / (2 * guessesPerSecond);
  const crackTime = formatCrackTime(avgSeconds);

  return { entropy, level, crackTime };
}
