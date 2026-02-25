import { getConfig, quoteChar, indent } from './config';

describe('config', () => {
  describe('getConfig', () => {
    it('should return default config when no overrides given', () => {
      const config = getConfig();
      expect(config.testStyle).toBe('bdd');
      expect(config.indent).toBe(2);
      expect(config.singleQuote).toBe(true);
      expect(config.includeSetupTeardown).toBe(true);
      expect(config.importStyle).toBe('named');
    });

    it('should merge overrides with defaults', () => {
      const config = getConfig({ testStyle: 'flat', indent: 4 });
      expect(config.testStyle).toBe('flat');
      expect(config.indent).toBe(4);
      expect(config.singleQuote).toBe(true); // default preserved
    });
  });

  describe('quoteChar', () => {
    it('should return single quote by default', () => {
      expect(quoteChar(getConfig())).toBe("'");
    });

    it('should return double quote when configured', () => {
      expect(quoteChar(getConfig({ singleQuote: false }))).toBe('"');
    });
  });

  describe('indent', () => {
    it('should produce correct indentation', () => {
      const config = getConfig();
      expect(indent(0, config)).toBe('');
      expect(indent(1, config)).toBe('  ');
      expect(indent(2, config)).toBe('    ');
    });

    it('should respect custom indent size', () => {
      const config = getConfig({ indent: 4 });
      expect(indent(1, config)).toBe('    ');
      expect(indent(2, config)).toBe('        ');
    });
  });
});
