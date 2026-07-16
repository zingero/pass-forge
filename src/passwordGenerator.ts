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
  const limit = max * Math.floor(0x100000000 / max);
  const arr = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(arr);
    value = arr[0];
  } while (value >= limit);
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
  const { numbers, symbols } = getCharsets(options);
  let result = '';

  if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
    throw new Error('Please select at least one option');
  }

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

  // Shuffle only the non-word suffix (numbers + symbols) to preserve word readability
  const wordPart = result.slice(0, wordBudget);
  const nonWordPart = result.slice(wordBudget);
  return wordPart + shuffleString(nonWordPart);
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
  return options.memorable
    ? generateMemorablePassword(length, options)
    : generateRandomPassword(length, options);
}
