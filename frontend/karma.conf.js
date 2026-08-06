// Karma configuration file, see link for more information
// https://karma-runner.github.io/6.4/config/configuration-file.html

// The project is zoneless (no zone.js in build polyfills) and no system Chrome is
// installed. Playwright's Chromium binary is used as the Chrome binary for the
// ChromeHeadless launcher.
process.env.CHROME_BIN =
  '/home/bouna/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome';

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/frontend'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
      check: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadless'],
    singleRun: true,
    autoWatch: false,
    restartOnFileChange: true,
  });
};
