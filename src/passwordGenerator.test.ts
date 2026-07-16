import { describe, it, expect } from 'vitest';
import { generateRandomPassword, generateMemorablePassword, generatePassword, PasswordOptions } from './passwordGenerator';

const defaultOptions: PasswordOptions = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidSimilar: false,
  memorable: false,
};

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
    const password = generateMemorablePassword(32, options);
    expect(password).toBe('');
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

  it('throws when length is too short for the selected options', () => {
    const options: PasswordOptions = { ...defaultOptions, memorable: false };
    expect(() => generateRandomPassword(2, options)).toThrow('Password length is too short for the selected options');
  });
});
