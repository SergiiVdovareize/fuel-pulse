module.exports = {
  ci: {
    collect: {
      url: ['https://fuel.vdovareize.me/'],
      numberOfRuns: 1,
      settings: [
        {
          preset: 'desktop'
        },
        {
          formFactor: 'mobile',
          screenEmulation: {
            mobile: true,
            width: 390,
            height: 844,
            deviceScaleFactor: 3,
            disabled: false
          }
        }
      ]
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
