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

  it('returns error message when no options are selected', () => {
    const options: PasswordOptions = { ...defaultOptions, uppercase: false, lowercase: false, numbers: false, symbols: false };
    const password = generateRandomPassword(16, options);
    expect(password).toBe('Please select at least one option');
  });

  it('excludes similar characters when avoidSimilar is true', () => {
    const options: PasswordOptions = { ...defaultOptions, avoidSimilar: true, symbols: false };
    // Generate many passwords to ensure similar chars are excluded
    for (let i = 0; i < 20; i++) {
      const password = generateRandomPassword(32, options);
      expect(password).not.toMatch(/[Il10O]/);
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
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    // Use a longer length to ensure there's room for symbols after words and numbers
    let hasSymbols = false;
    for (let i = 0; i < 10; i++) {
      const password = generateMemorablePassword(32, options);
      if (/[!@#$%^&*]/.test(password)) {
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

  it('pads with available characters when words do not fill the length', () => {
    // Short words + long length means padding is needed
    const options: PasswordOptions = { ...defaultOptions, memorable: true };
    const password = generateMemorablePassword(32, options);
    expect(password.length).toBeLessThanOrEqual(32);
    expect(password.length).toBeGreaterThan(0);
  });

  it('breaks the padding loop when no character sets are enabled', () => {
    const options: PasswordOptions = {
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    // With no chars, it should stop padding and return what it has
    const password = generateMemorablePassword(32, options);
    expect(password.length).toBeLessThanOrEqual(32);
  });

  it('pads with uppercase and lowercase characters when both are enabled', () => {
    const options: PasswordOptions = {
      uppercase: true,
      lowercase: true,
      numbers: false,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    // Use length 32 to force padding after words fill up
    const password = generateMemorablePassword(32, options);
    expect(password.length).toBeLessThanOrEqual(32);
    expect(password).toMatch(/^[A-Za-z]+$/);
  });

  it('pads with only uppercase characters when only uppercase is enabled', () => {
    const options: PasswordOptions = {
      uppercase: true,
      lowercase: false,
      numbers: false,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    // Use length 32 to force padding after words
    const password = generateMemorablePassword(32, options);
    expect(password.length).toBeLessThanOrEqual(32);
    // Padded chars should be uppercase only (words are capitalized too)
    expect(password).toMatch(/^[A-Za-z]+$/);
  });

  it('pads with only lowercase characters when only lowercase is enabled', () => {
    const options: PasswordOptions = {
      uppercase: false,
      lowercase: true,
      numbers: false,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    const password = generateMemorablePassword(32, options);
    expect(password.length).toBeLessThanOrEqual(32);
    expect(password).toMatch(/^[a-z]+$/);
  });

  it('pads with only numbers when only numbers is enabled', () => {
    const options: PasswordOptions = {
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      avoidSimilar: false,
      memorable: true,
    };
    const password = generateMemorablePassword(32, options);
    expect(password.length).toBeLessThanOrEqual(32);
    // Words are lowercase (uppercase disabled), padding + numbers appended are digits
    expect(password).toMatch(/^[a-z0-9]+$/);
  });

  it('pads with only symbols when only symbols is enabled', () => {
    const options: PasswordOptions = {
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: true,
      avoidSimilar: false,
      memorable: true,
    };
    const password = generateMemorablePassword(32, options);
    expect(password.length).toBeLessThanOrEqual(32);
    // Words are lowercase, symbols appended, padding is symbols
    expect(password).toMatch(/^[a-z!@#$%^&*]+$/);
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
});
