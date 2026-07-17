import { describe, it, expect } from 'vitest';
import { generateRandomPassword, generateMemorablePassword, generatePassword, calculateEntropy, getPasswordStrength, PasswordOptions, MIN_LENGTH, MAX_LENGTH } from './passwordGenerator';

const defaultOptions: PasswordOptions = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidSimilar: false,
  memorable: false,
};

describe('constants', () => {
  it('exports MIN_LENGTH as 8', () => {
    expect(MIN_LENGTH).toBe(8);
  });

  it('exports MAX_LENGTH as 32', () => {
    expect(MAX_LENGTH).toBe(32);
  });
});

describe('generateRandomPassword', () => {
  it('generates a password of the specified length', () => {
    const password = generateRandomPassword(16, defaultOptions);
    expect(password).toHaveLength(16);
  });

  it('generates different passwords each time', () => {
    const p1 = generateRandomPassword(16, defaultOptions);
    const p2 = generateRandomPassword(16, defaultOptions);
    expect(p1).not.toEqual(p2);
  });

  it('respects minimum length of 8', () => {
    const password = generateRandomPassword(8, defaultOptions);
    expect(password).toHaveLength(8);
  });

  it('respects maximum length of 32', () => {
    const password = generateRandomPassword(32, defaultOptions);
    expect(password).toHaveLength(32);
  });

  it('contains only uppercase when only uppercase is selected', () => {
    const options: PasswordOptions = { ...defaultOptions, lowercase: false, numbers: false, symbols: false };
    const password = generateRandomPassword(16, options);
    expect(password).toMatch(/^[A-Z]+$/);
  });

  it('contains only lowercase when only lowercase is selected', () => {
    const options: PasswordOptions = { ...defaultOptions, uppercase: false, numbers: false, symbols: false };
    const password = generateRandomPassword(16, options);
    expect(password).toMatch(/^[a-z]+$/);
  });

  it('contains only numbers when only numbers is selected', () => {
    const options: PasswordOptions = { ...defaultOptions, uppercase: false, lowercase: false, symbols: false };
    const password = generateRandomPassword(16, options);
    expect(password).toMatch(/^[0-9]+$/);
  });

  it('contains only symbols when only symbols is selected', () => {
    const options: PasswordOptions = { ...defaultOptions, uppercase: false, lowercase: false, numbers: false };
    const password = generateRandomPassword(16, options);
    expect(password).toMatch(/^[!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/);
  });

  it('throws when no options are selected', () => {
    const options: PasswordOptions = { ...defaultOptions, uppercase: false, lowercase: false, numbers: false, symbols: false };
    expect(() => generateRandomPassword(16, options)).toThrow('Please select at least one option');
  });

  it('excludes similar characters when avoidSimilar is true', () => {
    const options: PasswordOptions = { ...defaultOptions, avoidSimilar: true, symbols: false };
    // Generate many passwords to ensure similar chars are excluded
    for (let i = 0; i < 20; i++) {
      const password = generateRandomPassword(32, options);
      expect(password).not.toMatch(/[Il10O]/);
    }
  });

  it('contains at least one character from each enabled class', () => {
    for (let i = 0; i < 20; i++) {
      const password = generateRandomPassword(16, defaultOptions);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
    }
  });
});

describe('generateMemorablePassword', () => {
  it('generates a password not exceeding the specified length', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    const password = generateMemorablePassword(16, options);
    expect(password.length).toBeLessThanOrEqual(16);
  });

  it('generates a password with capitalized words when uppercase is enabled', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    const password = generateMemorablePassword(20, options);
    expect(password).toMatch(/[A-Z]/);
  });

  it('generates different memorable passwords each time', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    const p1 = generateMemorablePassword(20, options);
    const p2 = generateMemorablePassword(20, options);
    expect(p1).not.toEqual(p2);
  });

  it('includes numbers when numbers option is enabled', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    const password = generateMemorablePassword(24, options);
    expect(password).toMatch(/[0-9]/);
  });

  it('includes symbols when symbols option is enabled', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: true, numbers: false };
    let hasSymbols = false;
    for (let i = 0; i < 10; i++) {
      const password = generateMemorablePassword(32, options);
      if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
        hasSymbols = true;
        break;
      }
    }
    expect(hasSymbols).toBe(true);
  });

  it('does not capitalize words when uppercase is disabled', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: true, uppercase: false, numbers: false, symbols: false };
    const password = generateMemorablePassword(20, options);
    // All word characters should be lowercase
    expect(password).toMatch(/^[a-z]+$/);
  });

  it('fills the length with words only when only letter options are enabled', () => {
    const options: PasswordOptions = {
      uppercase: true,
      lowercase: true,
      numbers: false,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    for (let i = 0; i < 20; i++) {
      const password = generateMemorablePassword(16, options);
      expect(password).toMatch(/^[A-Za-z]+$/);
      expect(password.length).toBeLessThanOrEqual(16);
      expect(password.length).toBeGreaterThanOrEqual(14);
    }
  });

  it('returns empty when no character sets are enabled', () => {
    const options: PasswordOptions = {
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    expect(() => generateMemorablePassword(32, options)).toThrow('Please select at least one option');
  });

  it('does not contain lowercase letters when lowercase is disabled', () => {
    const options: PasswordOptions = {
      uppercase: true,
      lowercase: false,
      numbers: true,
      symbols: true,
      avoidSimilar: false,
      memorable: true,
    };
    for (let i = 0; i < 10; i++) {
      const password = generateMemorablePassword(20, options);
      expect(password).not.toMatch(/[a-z]/);
    }
  });

  it('uppercase only: contains only uppercase words', () => {
    const options: PasswordOptions = {
      uppercase: true,
      lowercase: false,
      numbers: false,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    for (let i = 0; i < 10; i++) {
      const password = generateMemorablePassword(20, options);
      expect(password).toMatch(/^[A-Z]+$/);
      expect(password.length).toBeLessThanOrEqual(20);
    }
  });

  it('lowercase only: contains only lowercase words', () => {
    const options: PasswordOptions = {
      uppercase: false,
      lowercase: true,
      numbers: false,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    for (let i = 0; i < 10; i++) {
      const password = generateMemorablePassword(20, options);
      expect(password).toMatch(/^[a-z]+$/);
      expect(password.length).toBeLessThanOrEqual(20);
    }
  });

  it('numbers only: contains only numbers', () => {
    const options: PasswordOptions = {
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    const password = generateMemorablePassword(20, options);
    expect(password).toMatch(/^[0-9]+$/);
  });

  it('symbols only: contains only symbols', () => {
    const options: PasswordOptions = {
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: true,
      avoidSimilar: false,
      memorable: true,
    };
    const password = generateMemorablePassword(20, options);
    expect(password).toMatch(/^[!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/);
  });

  it('excludes similar characters in padding when avoidSimilar is true', () => {
    const options: PasswordOptions = {
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      avoidSimilar: true,
      memorable: true,
    };
    for (let i = 0; i < 20; i++) {
      const password = generateMemorablePassword(32, options);
      const digits = password.match(/[0-9]/g);
      if (digits) {
        expect(digits.join('')).not.toMatch(/[10]/);
      }
    }
  });

  describe('respects character class options in all combinations', () => {
    it('uppercase + numbers: no lowercase or symbols', () => {
      const options: PasswordOptions = {
        uppercase: true, lowercase: false, numbers: true, symbols: false,
        avoidSimilar: false, memorable: true,
      };
      for (let i = 0; i < 10; i++) {
        const password = generateMemorablePassword(20, options);
        expect(password).not.toMatch(/[a-z]/);
        expect(password).toMatch(/^[A-Z0-9]+$/);
      }
    });

    it('uppercase + symbols: no lowercase or numbers', () => {
      const options: PasswordOptions = {
        uppercase: true, lowercase: false, numbers: false, symbols: true,
        avoidSimilar: false, memorable: true,
      };
      for (let i = 0; i < 10; i++) {
        const password = generateMemorablePassword(20, options);
        expect(password).not.toMatch(/[a-z]/);
        expect(password).not.toMatch(/[0-9]/);
      }
    });

    it('lowercase + numbers: no uppercase or symbols', () => {
      const options: PasswordOptions = {
        uppercase: false, lowercase: true, numbers: true, symbols: false,
        avoidSimilar: false, memorable: true,
      };
      for (let i = 0; i < 10; i++) {
        const password = generateMemorablePassword(20, options);
        expect(password).not.toMatch(/[A-Z]/);
        expect(password).toMatch(/^[a-z0-9]+$/);
      }
    });

    it('lowercase + symbols: no uppercase or numbers', () => {
      const options: PasswordOptions = {
        uppercase: false, lowercase: true, numbers: false, symbols: true,
        avoidSimilar: false, memorable: true,
      };
      for (let i = 0; i < 10; i++) {
        const password = generateMemorablePassword(20, options);
        expect(password).not.toMatch(/[A-Z]/);
        expect(password).not.toMatch(/[0-9]/);
      }
    });

    it('numbers + symbols only: no letters at all', () => {
      const options: PasswordOptions = {
        uppercase: false, lowercase: false, numbers: true, symbols: true,
        avoidSimilar: false, memorable: true,
      };
      for (let i = 0; i < 10; i++) {
        const password = generateMemorablePassword(20, options);
        expect(password).not.toMatch(/[a-zA-Z]/);
      }
    });

    it('all four enabled: contains all character classes', () => {
      const options: PasswordOptions = {
        uppercase: true, lowercase: true, numbers: true, symbols: true,
        avoidSimilar: false, memorable: true,
      };
      let hasUpper = false, hasLower = false, hasDigit = false, hasSymbol = false;
      for (let i = 0; i < 20; i++) {
        const password = generateMemorablePassword(24, options);
        if (/[A-Z]/.test(password)) hasUpper = true;
        if (/[a-z]/.test(password)) hasLower = true;
        if (/[0-9]/.test(password)) hasDigit = true;
        if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) hasSymbol = true;
      }
      expect(hasUpper).toBe(true);
      expect(hasLower).toBe(true);
      expect(hasDigit).toBe(true);
      expect(hasSymbol).toBe(true);
    });

    it('uppercase + lowercase only: no numbers or symbols', () => {
      const options: PasswordOptions = {
        uppercase: true, lowercase: true, numbers: false, symbols: false,
        avoidSimilar: false, memorable: true,
      };
      for (let i = 0; i < 10; i++) {
        const password = generateMemorablePassword(20, options);
        expect(password).toMatch(/^[A-Za-z]+$/);
      }
    });
  });
});

describe('generatePassword', () => {
  it('delegates to generateRandomPassword when memorable is false', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: false };
    const password = generatePassword(16, options);
    expect(password).toHaveLength(16);
  });

  it('delegates to generateMemorablePassword when memorable is true', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    const password = generatePassword(20, options);
    expect(password.length).toBeLessThanOrEqual(20);
    expect(password.length).toBeGreaterThan(0);
  });

  it('pads with random letters when words cannot fill budget exactly', () => {
    // With numbers + symbols, wordBudget = length - 4. Use length=5 → wordBudget=1.
    // No words have length 1, so the word loop exits immediately and padding fills the gap.
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    const password = generateMemorablePassword(5, options);
    expect(password.length).toBe(5);
    expect(password).toMatch(/[A-Za-z]/); // padding produces a letter
  });

  it('pads memorable password when only numbers remain unfillable by words', () => {
    // wordBudget=2 (length=6), words of length 2 exist, but test wordBudget=1 with no symbols
    // length=3, numbers only reserved → wordBudget = 3 - 2 - 0 = 1
    const options: PasswordOptions = { ...defaultOptions, memorable: true, symbols: false };
    const password = generateMemorablePassword(3, options);
    expect(password.length).toBe(3);
  });

  it('pads with uppercase only when lowercase is disabled', () => {
    // length=5, numbers+symbols → wordBudget=1, no word of length 1 exists
    // padding loop uses only uppercase charset
    const options: PasswordOptions = {
      uppercase: true, lowercase: false, numbers: true, symbols: true,
      avoidSimilar: false, memorable: true,
    };
    const password = generateMemorablePassword(5, options);
    expect(password.length).toBe(5);
    expect(password).not.toMatch(/[a-z]/);
  });

  it('pads with lowercase only when uppercase is disabled', () => {
    const options: PasswordOptions = {
      uppercase: false, lowercase: true, numbers: true, symbols: true,
      avoidSimilar: false, memorable: true,
    };
    const password = generateMemorablePassword(5, options);
    expect(password.length).toBe(5);
    expect(password).not.toMatch(/[A-Z]/);
  });

  it('throws when length is too short for the selected options', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: false };
    expect(() => generateRandomPassword(2, options)).toThrow('Password length is too short for the selected options');
  });

  it('throws RangeError when length is below MIN_LENGTH', () => {
    expect(() => generatePassword(4, defaultOptions)).toThrow('Password length must be between 8 and 32');
  });

  it('throws RangeError when length is above MAX_LENGTH', () => {
    expect(() => generatePassword(100, defaultOptions)).toThrow('Password length must be between 8 and 32');
  });

  it('shuffles entire result when only numbers and symbols are selected (no ordering bias)', () => {
    const options: PasswordOptions = {
      uppercase: false, lowercase: false, numbers: true, symbols: true,
      avoidSimilar: false, memorable: true,
    };
    // Generate multiple passwords and verify they are not always digits-first
    let hasSymbolBeforeDigit = false;
    for (let i = 0; i < 20; i++) {
      const password = generateMemorablePassword(20, options);
      const firstSymbolIdx = password.search(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
      const firstDigitIdx = password.search(/[0-9]/);
      if (firstSymbolIdx >= 0 && firstDigitIdx >= 0 && firstSymbolIdx < firstDigitIdx) {
        hasSymbolBeforeDigit = true;
        break;
      }
    }
    expect(hasSymbolBeforeDigit).toBe(true);
  });
});

describe('calculateEntropy', () => {
  it('returns 0 for an empty string', () => {
    expect(calculateEntropy('')).toBe(0);
  });

  it('calculates entropy for lowercase-only password', () => {
    const entropy = calculateEntropy('abcdefgh');
    // 8 chars * log2(26) ≈ 37.6
    expect(entropy).toBeCloseTo(8 * Math.log2(26), 1);
  });

  it('calculates entropy for mixed case password', () => {
    const entropy = calculateEntropy('AbCdEfGh');
    // 8 chars * log2(52) ≈ 45.6
    expect(entropy).toBeCloseTo(8 * Math.log2(52), 1);
  });

  it('calculates entropy for all character classes', () => {
    const entropy = calculateEntropy('Ab1!');
    // 4 chars * log2(88) ≈ 25.8 (pool: 26 upper + 26 lower + 10 digits + 26 symbols)
    expect(entropy).toBeCloseTo(4 * Math.log2(88), 1);
  });

  it('accounts for digits in pool size', () => {
    const entropy = calculateEntropy('12345678');
    // 8 chars * log2(10) ≈ 26.6
    expect(entropy).toBeCloseTo(8 * Math.log2(10), 1);
  });
});

describe('getPasswordStrength', () => {
  it('returns pathetic for very short passwords', () => {
    const result = getPasswordStrength('ab');
    expect(result.level).toBe('pathetic');
    expect(result.entropy).toBeLessThan(20);
  });

  it('returns weak for short low-entropy passwords', () => {
    // 5 chars * log2(26) ≈ 23.5 → weak (20-35)
    const result = getPasswordStrength('abcde');
    expect(result.level).toBe('weak');
  });

  it('returns meh for slightly better passwords', () => {
    // 8 chars * log2(26) ≈ 37.6 → meh (35-45)
    const result = getPasswordStrength('abcdefgh');
    expect(result.level).toBe('meh');
  });

  it('returns fair for moderate passwords', () => {
    // 11 chars * log2(26) ≈ 51.7 → fair (45-55)
    const result = getPasswordStrength('abcdefghijk');
    expect(result.level).toBe('fair');
  });

  it('returns decent for good-ish passwords', () => {
    // 10 chars * log2(62) ≈ 59.5 → decent (55-65)
    const result = getPasswordStrength('Abcdefg123');
    expect(result.level).toBe('decent');
  });

  it('returns solid for pretty good passwords', () => {
    // 11 chars * log2(62) ≈ 65.5 → solid (65-75)
    const result = getPasswordStrength('Abcdefgh123');
    expect(result.level).toBe('solid');
  });

  it('returns strong for strong passwords', () => {
    // 12 chars * log2(88) ≈ 77.5 → strong (75-85)
    const result = getPasswordStrength('Abcdef1234!@');
    expect(result.level).toBe('strong');
  });

  it('returns fortress for very strong passwords', () => {
    // 14 chars * log2(88) ≈ 90.4 → fortress (85-100)
    const result = getPasswordStrength('Ab1!Cd2@Ef3#Gh');
    expect(result.level).toBe('fortress');
  });

  it('returns unbreakable for extremely strong passwords', () => {
    // 16 chars * log2(88) ≈ 103.3 → unbreakable (100-120)
    const result = getPasswordStrength('Ab1!Cd2@Ef3#Gh4$');
    expect(result.level).toBe('unbreakable');
  });

  it('returns overkill for ridiculously long complex passwords', () => {
    // 20 chars * log2(88) ≈ 129.2 → overkill (120+)
    const result = getPasswordStrength('Ab1!Cd2@Ef3#Gh4$Jk5&');
    expect(result.level).toBe('overkill');
  });

  it('includes a crack time string', () => {
    const result = getPasswordStrength('Ab1!Cd2@Ef3#Gh4$');
    expect(result.crackTime).toBeTruthy();
    expect(typeof result.crackTime).toBe('string');
  });

  it('returns instant for very weak passwords', () => {
    const result = getPasswordStrength('a');
    expect(result.crackTime).toBe('Instant');
  });

  it('calculates lower entropy for memorable passwords', () => {
    const memorableOptions: PasswordOptions = {
      uppercase: true, lowercase: true, numbers: true, symbols: true,
      avoidSimilar: false, memorable: true,
    };
    const password = 'TigerMaple72!@';
    const randomEntropy = calculateEntropy(password);
    const memorableEntropy = calculateEntropy(password, memorableOptions);
    expect(memorableEntropy).toBeLessThan(randomEntropy);
  });

  it('uses standard entropy for memorable passwords without letter options', () => {
    const options: PasswordOptions = {
      uppercase: false, lowercase: false, numbers: true, symbols: true,
      avoidSimilar: false, memorable: true,
    };
    // Should fall through to standard pool calculation (10 + 26 = 36)
    const entropy = calculateEntropy('12!@34#$', options);
    expect(entropy).toBeCloseTo(8 * Math.log2(36), 1);
  });

  it('returns minutes crack time for medium-low entropy', () => {
    // 9 lowercase chars → entropy ≈ 42.3 → ~4 minutes
    const result = getPasswordStrength('abcdefghi');
    expect(result.crackTime).toMatch(/minutes/);
  });

  it('returns hours crack time for medium entropy', () => {
    // 10 lowercase chars → entropy ≈ 47.0 → ~2 hours
    const result = getPasswordStrength('abcdefghij');
    expect(result.crackTime).toMatch(/hours/);
  });

  it('returns million years crack time for high entropy', () => {
    // 13 chars all classes → entropy ≈ 84 → ~31 million years
    const result = getPasswordStrength('Ab1!Cd2@Ef3#G');
    expect(result.crackTime).toMatch(/million years/);
  });

  it('calculates memorable entropy with numbers disabled', () => {
    const options: PasswordOptions = {
      uppercase: true, lowercase: true, numbers: false, symbols: true,
      avoidSimilar: false, memorable: true,
    };
    const entropy = calculateEntropy('TigerMaple!!', options);
    expect(entropy).toBeGreaterThan(0);
  });

  it('calculates memorable entropy with symbols disabled', () => {
    const options: PasswordOptions = {
      uppercase: true, lowercase: true, numbers: true, symbols: false,
      avoidSimilar: false, memorable: true,
    };
    const entropy = calculateEntropy('TigerMaple72', options);
    expect(entropy).toBeGreaterThan(0);
  });

  it('calculates memorable entropy with both numbers and symbols disabled', () => {
    const options: PasswordOptions = {
      uppercase: true, lowercase: true, numbers: false, symbols: false,
      avoidSimilar: false, memorable: true,
    };
    const entropy = calculateEntropy('TigerMaple', options);
    expect(entropy).toBeGreaterThan(0);
  });

  it('throws RangeError when length is below MIN_LENGTH in memorable mode', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    expect(() => generatePassword(7, options)).toThrow('Password length must be between 8 and 32');
  });

  it('throws RangeError when length is above MAX_LENGTH in memorable mode', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    expect(() => generatePassword(33, options)).toThrow('Password length must be between 8 and 32');
  });

  it('calculates memorable entropy with very short wordBudget (< 2)', () => {
    // password length 5, numbers + symbols enabled → wordBudget = 5 - 2 - 2 = 1 (< 2)
    const options: PasswordOptions = {
      uppercase: true, lowercase: true, numbers: true, symbols: true,
      avoidSimilar: false, memorable: true,
    };
    const entropy = calculateEntropy('Ab1!x', options);
    // Should return only digit + symbol entropy since wordBudget < 2
    expect(entropy).toBeGreaterThan(0);
    // 2 * log2(10) + 2 * log2(26)
    const expected = 2 * Math.log2(10) + 2 * Math.log2(26);
    expect(entropy).toBeCloseTo(expected, 1);
  });

  it('calculates memorable entropy with large wordBudget (triggers large bigint path)', () => {
    // A long password with no numbers/symbols → wordBudget = 28
    // The DP paths value should exceed 2^53, exercising the large bigint branch in log2BigInt
    const options: PasswordOptions = {
      uppercase: true, lowercase: true, numbers: false, symbols: false,
      avoidSimilar: false, memorable: true,
    };
    const longPassword = 'TigerMapleBrightSunnyFields';  // 27 chars
    const entropy = calculateEntropy(longPassword, options);
    expect(entropy).toBeGreaterThan(50);
  });

  it('returns days crack time for medium-high entropy', () => {
    // 11 lowercase chars → entropy ≈ 51.7 → days
    const result = getPasswordStrength('abcdefghijk');
    expect(result.crackTime).toMatch(/days/);
  });

  it('returns thousand years crack time for high entropy', () => {
    // 12 mixed case + digits → entropy ≈ 71.4 → thousands of years
    const result = getPasswordStrength('Abcdefgh1234');
    expect(result.crackTime).toMatch(/thousand years|million years/);
  });

  it('returns billion years crack time for very high entropy', () => {
    // 17 chars all classes → entropy ≈ 110 → billions
    const result = getPasswordStrength('Ab1!Cd2@Ef3#Gh4$J');
    expect(result.crackTime).toMatch(/billion years|trillion years/);
  });

  it('returns trillion years crack time for extreme entropy', () => {
    // 20+ chars all classes → very high entropy
    const result = getPasswordStrength('Ab1!Cd2@Ef3#Gh4$Jk5&Lm');
    expect(result.crackTime).toMatch(/trillion years/);
  });

  it('returns seconds crack time for low entropy', () => {
    // 4 lowercase chars → entropy ≈ 18.8 → a few seconds
    const result = getPasswordStrength('abcd');
    expect(result.crackTime).toMatch(/seconds|Instant/);
  });
});
