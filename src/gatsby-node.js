"use strict"

const {Storage} = require('@google-cloud/storage')

exports.sourceNodes = async (api, pluginOptions) => {
    const {createNodeId, reporter} = api
    const {createNode} = api.actions
    const {gcpTokenFile, gcpBucketName, storageDirectory} = pluginOptions

    let name
    if(!pluginOptions.name || pluginOptions.name == "") {
        name = "GcpStorage"
    } else {
        name = pluginOptions.name
    }

    if(!gcpTokenFile) {
        reporter.panic(`
        
        gatsby-source-gcp-storage: gcpTokenFile must be set.

        A GCP JSON token file is required to authenticate with the GCP storage API
        
        `)
    }

    if(!gcpBucketName) {
        reporter.panic(`
        
        gatsby-source-gcp-storage: gcpBucketName must be set.

        The GCP storage bucket name is required
        
        `)
    }

    const storage = new Storage({keyFilename: gcpTokenFile})
    const gcpBucket = storage.bucket(gcpBucketName)

    let files = await gcpBucket.getFiles({directory: storageDirectory || `/`})

    if(files[0].length < 1) {
        reporter.warn(`gatsby-source-gcp-storage: no files to process in ${gcpBucketName}/${storageDirectory}`)
    }else{
        let fileList = []

        files[0].forEach(f => {
            fileList.push(f.getMetadata().then(
                item => {
                    reporter.info(`gatsby-source-gcp-storage: processing file ${item[0].name}`)
                    const id = createNodeId(item[0].mediaLink)
            
                    createNode({
                        bucket: item[0].bucket,
                        fileName: item[0].name,
                        md5hash: item[0].md5Hash,
                        link: item[0].mediaLink,
                        id,
                        parent: null,
                        children: [],
                        internal: {
                            type: name,
                            mediaType: "application/text",
                            contentDigest: item[0].md5Hash
                        }
                    })
                }
            ))
        })

        await Promise.all(fileList)
    }
}



let example = 
{ kind: 'storage#object',
  id:
   'tf-state-laaso-cluster/terraform/state/default.tfstate/1566416769859377',
  selfLink:
   'https://www.googleapis.com/storage/v1/b/tf-state-laaso-cluster/o/terraform%2Fstate%2Fdefault.tfstate',
  name: 'terraform/state/default.tfstate',
  bucket: 'tf-state-laaso-cluster',
  generation: '1566416769859377',
  metageneration: '1',
  contentType: 'text/plain; charset=utf-8',
  storageClass: 'REGIONAL',
  size: '157',
  md5Hash: 'aVNsHnDjMiRU7Wooi0Uo2g==',
  mediaLink:
   'https://www.googleapis.com/download/storage/v1/b/tf-state-laaso-cluster/o/terraform%2Fstate%2Fdefault.tfstate?generation=1566416769859377&alt=media',
  crc32c: '6H2dzQ==',
  etag: 'CLH+jJndlOQCEAE=',
  timeCreated: '2019-08-21T19:46:09.858Z',
  updated: '2019-08-21T19:46:09.858Z',
  timeStorageClassUpdated: '2019-08-21T19:46:09.858Z' }