describe('email service', () => {
  describe('module structure', () => {
    test('exports sendResetEmail function', () => {
      delete process.env.SMTP_HOST;
      jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();

      const email = require('../services/email');
      expect(typeof email.sendResetEmail).toBe('function');

      console.warn.mockRestore();
      console.log.mockRestore();
    });
  });

  describe('sendResetEmail behavior', () => {
    let originalEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
      jest.resetModules();
      jest.clearAllMocks();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('logs to console when SMTP not configured', async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();

      const { sendResetEmail } = require('../services/email');
      await sendResetEmail('test@example.com', 'https://example.com/reset');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Password Reset Email'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('test@example.com'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('https://example.com/reset'));

      consoleSpy.mockRestore();
    });

    test('logs separator lines', async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();

      const { sendResetEmail } = require('../services/email');
      await sendResetEmail('user@test.com', 'https://app.com/reset');

      const calls = consoleSpy.mock.calls.map((c) => c[0]);
      expect(calls.some((c) => c.includes('━'))).toBe(true);

      consoleSpy.mockRestore();
    });

    test('warns about missing SMTP config on module load', () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();

      require('../services/email');
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('SMTP not configured'));

      warnSpy.mockRestore();
    });

    test('does not warn when SMTP is configured', () => {
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_USER = 'user@test.com';
      process.env.SMTP_PASS = 'password';

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();

      require('../services/email');
      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('SMTP configuration', () => {
    let originalEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
      jest.resetModules();
      jest.clearAllMocks();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('creates transporter with correct host', () => {
      const nodemailer = require('nodemailer');
      const createTransportSpy = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: jest.fn(),
      });

      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password123';

      require('../services/email');

      expect(createTransportSpy).toHaveBeenCalledWith(
        expect.objectContaining({ host: 'smtp.example.com' })
      );

      createTransportSpy.mockRestore();
    });

    test('uses port 587 as default', () => {
      const nodemailer = require('nodemailer');
      const createTransportSpy = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: jest.fn(),
      });

      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password123';
      delete process.env.SMTP_PORT;

      require('../services/email');

      expect(createTransportSpy).toHaveBeenCalledWith(
        expect.objectContaining({ port: 587, secure: false })
      );

      createTransportSpy.mockRestore();
    });

    test('uses secure mode for port 465', () => {
      const nodemailer = require('nodemailer');
      const createTransportSpy = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: jest.fn(),
      });

      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password123';
      process.env.SMTP_PORT = '465';

      require('../services/email');

      expect(createTransportSpy).toHaveBeenCalledWith(
        expect.objectContaining({ port: 465, secure: true })
      );

      createTransportSpy.mockRestore();
    });

    test('includes auth credentials', () => {
      const nodemailer = require('nodemailer');
      const createTransportSpy = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: jest.fn(),
      });

      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'secret123';

      require('../services/email');

      expect(createTransportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: { user: 'user@example.com', pass: 'secret123' },
        })
      );

      createTransportSpy.mockRestore();
    });
  });
});
