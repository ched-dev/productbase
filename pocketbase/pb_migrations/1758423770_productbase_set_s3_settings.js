/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const S3_FILES_ACCESS_KEY_ID = process.env.S3_FILES_ACCESS_KEY_ID
  const S3_FILES_SECRET_ACCESS_KEY = process.env.S3_FILES_SECRET_ACCESS_KEY
  const S3_FILES_ENDPOINT = process.env.S3_FILES_ENDPOINT
  const S3_FILES_REGION = process.env.S3_FILES_REGION
  const S3_FILES_BUCKET = process.env.S3_FILES_BUCKET
  const S3_BACKUPS_ACCESS_KEY_ID = process.env.S3_BACKUPS_ACCESS_KEY_ID
  const S3_BACKUPS_SECRET_ACCESS_KEY = process.env.S3_BACKUPS_SECRET_ACCESS_KEY
  const S3_BACKUPS_ENDPOINT = process.env.S3_BACKUPS_ENDPOINT
  const S3_BACKUPS_REGION = process.env.S3_BACKUPS_REGION
  const S3_BACKUPS_BUCKET = process.env.S3_BACKUPS_BUCKET

  // log for sanity check
  console.log('ProductBase: Updating Files Bucket Settings |',
    `S3_FILES_ACCESS_KEY_ID=${Boolean(S3_FILES_ACCESS_KEY_ID)}`,
    `S3_FILES_SECRET_ACCESS_KEY=${Boolean(S3_FILES_SECRET_ACCESS_KEY)}`,
    `S3_FILES_ENDPOINT=${S3_FILES_ENDPOINT}`,
    `S3_FILES_REGION=${S3_FILES_REGION}`,
    `S3_FILES_BUCKET=${S3_FILES_BUCKET}`
  )
  console.log('ProductBase: Updating Backups Bucket Settings |',
    `S3_BACKUPS_ACCESS_KEY_ID=${Boolean(S3_BACKUPS_ACCESS_KEY_ID)}`,
    `S3_BACKUPS_SECRET_ACCESS_KEY=${Boolean(S3_BACKUPS_SECRET_ACCESS_KEY)}`,
    `S3_BACKUPS_ENDPOINT=${S3_BACKUPS_ENDPOINT}`,
    `S3_BACKUPS_REGION=${S3_BACKUPS_REGION}`,
    `S3_BACKUPS_BUCKET=${S3_BACKUPS_BUCKET}`
  )

  const settings = app.settings();
  
  if (S3_FILES_ACCESS_KEY_ID && S3_FILES_SECRET_ACCESS_KEY && S3_FILES_ENDPOINT && S3_FILES_REGION && S3_FILES_BUCKET) {
    // files
    settings.s3.enabled = true;
    settings.s3.accessKey = S3_FILES_ACCESS_KEY_ID;
    settings.s3.secret = S3_FILES_SECRET_ACCESS_KEY;
    settings.s3.endpoint = S3_FILES_ENDPOINT;
    settings.s3.region = S3_FILES_REGION;
    settings.s3.bucket = S3_FILES_BUCKET;
    settings.s3.forcePathStyle = true;
  }
  if (S3_BACKUPS_ACCESS_KEY_ID && S3_BACKUPS_SECRET_ACCESS_KEY && S3_BACKUPS_ENDPOINT && S3_BACKUPS_REGION && S3_BACKUPS_BUCKET) {
    // backups
    settings.backups.s3.enabled = true;
    settings.backups.s3.accessKey = S3_BACKUPS_ACCESS_KEY_ID;
    settings.backups.s3.secret = S3_BACKUPS_SECRET_ACCESS_KEY;
    settings.backups.s3.endpoint = S3_BACKUPS_ENDPOINT;
    settings.backups.s3.region = S3_BACKUPS_REGION;
    settings.backups.s3.bucket = S3_BACKUPS_BUCKET;
    settings.backups.s3.forcePathStyle = true;
    settings.backups.cron = "0 0 * * *"; // every day at midnight
    settings.backups.cronMaxKeep = 10;
  }
  

  return app.save(settings);
}, (app) => {
  const settings = app.settings();

  // files
  settings.s3.enabled = false;
  settings.s3.accessKey = null;
  settings.s3.secret = null;
  settings.s3.endpoint = null;
  settings.s3.region = null;
  settings.s3.bucket = null;
  settings.s3.forcePathStyle = false;

  // backups
  settings.backups.s3.enabled = false;
  settings.backups.s3.accessKey = null;
  settings.backups.s3.secret = null;
  settings.backups.s3.endpoint = null;
  settings.backups.s3.region = null;
  settings.backups.s3.bucket = null;
  settings.backups.s3.forcePathStyle = false;

  return app.save(settings);
})
