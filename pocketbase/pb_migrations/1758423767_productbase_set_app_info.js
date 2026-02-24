/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const APP_NAME = process.env.PB_APPLICATION_NAME
  const APP_URL = process.env.PB_API_URL

  // log for sanity check
  console.log('ProductBase: Updating App Settings |',
    `APP_NAME=${APP_NAME}`,
    `APP_URL=${APP_URL}`,
  )

  const settings = app.settings();
  settings.meta.appName = APP_NAME || 'Pocketbase';
  settings.meta.appURL = APP_URL || 'http://localhost:8100';

  return app.save(settings);
}, (app) => {
  const settings = app.settings();

  return app.save(settings);
})
