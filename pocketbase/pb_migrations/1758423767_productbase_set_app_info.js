/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const APP_NAME = process.env.POCKETBASE_APPLICATION_NAME
  const APP_URL = process.env.POCKETBASE_API_URL

  const settings = app.settings();
  settings.meta.appName = APP_NAME || 'ProductBase';
  settings.meta.appURL = APP_URL || `http://localhost:${ process.env.PORT || 8100 }`;

  // log for sanity check
  console.log('ProductBase: Updating App Settings |',
    `APP_NAME=${settings.meta.appName}`,
    `APP_URL=${settings.meta.appURL}`,
  )

  return app.save(settings);
}, (app) => {
  const settings = app.settings();

  return app.save(settings);
})
