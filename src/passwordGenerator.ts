import { commonWords } from './words';

export interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidSimilar: boolean;
  memorable: boolean;
}

export function generateMemorablePassword(length: number, options: PasswordOptions): string {
  let result = '';
  const array = new Uint32Array(50);
  crypto.getRandomValues(array);
  let arrayIndex = 0;

  while (result.length < length && arrayIndex < array.length) {
    const word = commonWords[array[arrayIndex] % commonWords.length];
    const processedWord = options.uppercase
      ? word.charAt(0).toUpperCase() + word.slice(1)
      : word;

    if (result.length + processedWord.length <= length) {
      result += processedWord;
      arrayIndex++;
    } else {
      break;
    }
  }

  const remainingLength = length - result.length;

  if (options.numbers && remainingLength > 0) {
    const numDigits = Math.min(remainingLength, 2 + (array[arrayIndex] % 2));
    for (let i = 0; i < numDigits; i++) {
      result += (array[arrayIndex + i] % 10).toString();
    }
    arrayIndex += numDigits;
  }

  if (options.symbols && result.length < length) {
    const symbols = '!@#$%^&*';
    const symbolsToAdd = Math.min(length - result.length, 2);
    for (let i = 0; i < symbolsToAdd; i++) {
      result += symbols[array[arrayIndex + i] % symbols.length];
    }
  }

  while (result.length < length) {
    const chars = (options.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '') +
                 (options.lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '') +
                 (options.numbers ? '0123456789' : '') +
                 (options.symbols ? '!@#$%^&*' : '');

    if (chars.length === 0) break;
    result += chars[array[arrayIndex++] % chars.length];
  }

  return result;
}

export function generateRandomPassword(length: number, options: PasswordOptions): string {
  let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowercase = 'abcdefghijklmnopqrstuvwxyz';
  let numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (options.avoidSimilar) {
    uppercase = uppercase.replace(/[IO]/g, '');
    lowercase = lowercase.replace(/[l]/g, '');
    numbers = numbers.replace(/[10]/g, '');
  }

  let chars = '';
  if (options.uppercase) chars += uppercase;
  if (options.lowercase) chars += lowercase;
  if (options.numbers) chars += numbers;
  if (options.symbols) chars += symbols;

  if (chars === '') {
    return 'Please select at least one option';
  }

  let generatedPassword = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    generatedPassword += chars[array[i] % chars.length];
  }

  return generatedPassword;
}

export function generatePassword(length: number, options: PasswordOptions): string {
  return options.memorable
    ? generateMemorablePassword(length, options)
    : generateRandomPassword(length, options);
}
