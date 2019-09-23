"use strict";

const {
  Storage
} = require('@google-cloud/storage');

exports.sourceNodes = async (api, pluginOptions) => {
  const {
    reporter
  } = api;
  const {
    name,
    gcpTokenFile,
    gcpBucketName,
    storageDirectory
  } = pluginOptions;

  if (!gcpTokenFile) {
    reporter.panic(`
        
        gatsby-source-gcp-storage: gcpTokenFile must be set.

        A GCP JSON token file is required to authenticate with the GCP storage API
        
        `);
  }

  if (!gcpBucketName) {
    reporter.panic(`
        
        gatsby-source-gcp-storage: gcpBucketName must be set.

        The GCP storage bucket name is required
        
        `);
  }

  const storage = new Storage({
    keyFilename: gcpTokenFile
  });
  const gcpBucket = storage.bucket(gcpBucketName);
  gcpBucket.getFiles({
    directory: storageDirectory || `/`
  }, (err, files) => {
    if (err) {
      reporter.panic(`

            gatsby-source-gcp-storage: unable to access storage bucket

            Check the bucket ${gcpBucketName} exists, and that the provided token has access to it.
            
            `);
    } else {
      if (files.length < 1) reporter.warn(`gatsby-source-gcp-storage: no files to process in ${gcpBucketName}/${storageDirectory}`);
      files.forEach(f => {
        f.getMetadata().then(m => reporter.info(`gatsby-source-gcp-storage: processing file ${m[0].name}`));
      });
    }
  });
};