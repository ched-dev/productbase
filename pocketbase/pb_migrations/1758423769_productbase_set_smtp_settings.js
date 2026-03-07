/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const SEND_NAME = process.env.SMTP_SEND_NAME
  const SEND_ADDRESS = process.env.SMTP_SEND_ADDRESS
  const SERVER = process.env.SMTP_SERVER
  const PORT = process.env.SMTP_PORT
  const USER = process.env.SMTP_USER
  const PASSWORD = process.env.SMTP_PASSWORD
  
  const settings = app.settings();
  settings.meta.senderName = SEND_NAME || 'ProductBase';
  settings.meta.senderAddress = SEND_ADDRESS || 'noreply@server.net';

  if (SERVER && PORT && USER && PASSWORD) {
    // log for sanity check
    console.log('ProductBase: Updating SMTP Settings |',
      `SERVER=${SERVER}`,
      `PORT=${PORT}`,
      `USER=${USER}`,
      `PASSWORD=${Boolean(PASSWORD)}`
    );
    settings.smtp.enabled = true;
    settings.smtp.host = SERVER;
    settings.smtp.port = PORT;
    settings.smtp.username = USER;
    settings.smtp.password = PASSWORD;
  }

  return app.save(settings);
}, (app) => {
  const settings = app.settings();

  settings.smtp.enabled = false;
  settings.smtp.host = null;
  settings.smtp.port = null;
  settings.smtp.username = null;
  settings.smtp.password = null;

  return app.save(settings);
})
