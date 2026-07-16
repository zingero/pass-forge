import { commonWords } from './words';

export interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidSimilar: boolean;
  memorable: boolean;
}

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

export function generateMemorablePassword(length: number, options: PasswordOptions): string {
  const { uppercase, lowercase, numbers, symbols } = getCharsets(options);
  let result = '';

  const reservedNumbers = options.numbers ? 2 : 0;
  const reservedSymbols = options.symbols ? 2 : 0;
  const wordBudget = length - reservedNumbers - reservedSymbols;

  if (options.uppercase || options.lowercase) {
    while (result.length < wordBudget) {
      const word = commonWords[getUnbiasedIndex(commonWords.length)];
      let processedWord: string;
      if (options.uppercase && !options.lowercase) {
        processedWord = word.toUpperCase();
      } else if (options.uppercase) {
        processedWord = word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        processedWord = word;
      }

      if (result.length + processedWord.length <= wordBudget) {
        result += processedWord;
      } else {
        break;
      }
    }
  }

  if (options.numbers && result.length < length) {
    const numDigits = Math.min(length - result.length, 2 + getUnbiasedIndex(2));
    for (let i = 0; i < numDigits; i++) {
      result += numbers[getUnbiasedIndex(numbers.length)];
    }
  }

  if (options.symbols && result.length < length) {
    const symbolsToAdd = Math.min(length - result.length, 2);
    for (let i = 0; i < symbolsToAdd; i++) {
      result += symbols[getUnbiasedIndex(symbols.length)];
    }
  }

  while (result.length < length) {
    let chars = '';
    if (options.uppercase) chars += uppercase;
    if (options.lowercase) chars += lowercase;
    if (options.numbers) chars += numbers;
    if (options.symbols) chars += symbols;

    if (chars.length === 0) break;
    result += chars[getUnbiasedIndex(chars.length)];
  }

  return result;
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
