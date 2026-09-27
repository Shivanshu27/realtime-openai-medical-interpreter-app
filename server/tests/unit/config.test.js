const config = require('../../src/config');

describe('Server Config', () => {
  it('should load default port as a number', () => {
    expect(typeof config.port).toBe('number');
    expect(config.port).toBeGreaterThan(0);
  });

  it('should set mockMode to boolean', () => {
    expect(typeof config.mockMode).toBe('boolean');
  });

  it('should provide default mongo database name', () => {
    expect(config.mongoDbName).toBeDefined();
    expect(typeof config.mongoDbName).toBe('string');
  });
});
