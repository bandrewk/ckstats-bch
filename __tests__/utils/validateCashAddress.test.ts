import { validateCashAddress } from '../../utils/validateCashAddress';

describe('validateCashAddress', () => {
  it('accepts the address from the CashAddr specification', () => {
    expect(
      validateCashAddress('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a')
    ).toBe(true);
  });

  it('accepts an address without a prefix', () => {
    expect(validateCashAddress('qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a')).toBe(
      true
    );
  });

  it('accepts an all-uppercase address', () => {
    expect(
      validateCashAddress('BITCOINCASH:QPM2QSZNHKS23Z7629MMS6S4CWEF74VCWVY22GDX6A')
    ).toBe(true);
  });

  it('rejects a mainnet payload under a testnet prefix', () => {
    // The checksum covers the prefix, so the same payload does not validate
    // under a different one.
    expect(
      validateCashAddress('bchtest:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a')
    ).toBe(false);
  });

  it('rejects a single altered character', () => {
    expect(
      validateCashAddress('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6b')
    ).toBe(false);
  });

  it('rejects mixed case', () => {
    expect(
      validateCashAddress('bitcoincash:QPm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a')
    ).toBe(false);
  });

  it('rejects an unknown prefix', () => {
    expect(
      validateCashAddress('dogecoin:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a')
    ).toBe(false);
  });

  it('rejects characters outside the charset', () => {
    expect(
      validateCashAddress('bitcoincash:bpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a')
    ).toBe(false);
  });

  it('rejects a truncated address', () => {
    expect(
      validateCashAddress('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6')
    ).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validateCashAddress('')).toBe(false);
  });

  it('rejects a Bitcoin legacy address', () => {
    expect(validateCashAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(false);
  });
});
