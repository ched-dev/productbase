/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  console.log('ProductBase: Enabling Rate Limiting with default rules');
  const settings = app.settings();
  settings.rateLimits.enabled = true;
  settings.rateLimits.rules = [
    // defaults taken from base install
    { label: '*:auth', maxRequests: 2, duration: 3, audience: "" },
    { label: '*:create', maxRequests: 20, duration: 5, audience: "" },
    { label: '/api/batch', maxRequests: 3, duration: 1, audience: "" },
    { label: '/api/', maxRequests: 300, duration: 10, audience: "" },
    // added static app too
    { label: '/', maxRequests: 300, duration: 10, audience: "" },
  ]
  return app.save(settings);
}, (app) => {
  const settings = app.settings();
  settings.rateLimits.enabled = false;
  return app.save(settings);
})
