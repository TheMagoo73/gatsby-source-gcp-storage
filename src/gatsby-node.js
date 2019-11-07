"use strict"

const {Storage} = require('@google-cloud/storage')
const {createFileNodeFromBuffer} = require('gatsby-source-filesystem')
const path = require('path')
const mime = require('mime-types')
const toArray = require('stream-to-array')

exports.sourceNodes = async (api, pluginOptions) => {
    const {createNodeId, reporter, store, cache} = api
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

        return
    }

    if(!gcpBucketName) {
        reporter.panic(`
        
        gatsby-source-gcp-storage: gcpBucketName must be set.

        The GCP storage bucket name is required
        
        `)

        return
    }

    let files

    try{
        const storage = new Storage({keyFilename: gcpTokenFile})
        const gcpBucket = storage.bucket(gcpBucketName)

        files = await gcpBucket.getFiles({directory: storageDirectory || `/`})
    } catch(err) {
        reporter.panic(`
        
        gatsby-source-gcp-storage: unable to access storage.

        The GCP storage bucket/folder could not be accessed. Ensure that the bucker and path properties are correct, and the supplied SA account token has access

        `)
    }

    if(files[0].length < 1) {
        reporter.warn(`gatsby-source-gcp-storage: no files to process in ${gcpBucketName}/${storageDirectory}`)
    }else{
        let fileList = []

        files[0].forEach(f => {
            let r = async() => {
                const item = await f.getMetadata()
                reporter.info(`gatsby-source-gcp-storage: processing file ${item[0].name}`)
                const id = createNodeId(item[0].mediaLink)

                const parsedName = path.parse(item[0].name)

                reporter.info(`Boom... got ${parsedName.base}`)

                // Down load a buffer of the file, and use gatsby-source-filesystem to create a File node for it
                let parts = await toArray(f.createReadStream())
                let buffers = parts.map(p => (p instanceof Buffer) ? p : new Buffer(p))
                let buffer = Buffer.concat(buffers)

                const fileNode = await createFileNodeFromBuffer({
                    name: parsedName.name,
                    buffer: buffer,
                    cache: cache,
                    store: store,
                    createNode: createNode,
                    createNodeId: createNodeId,
                    parentNodeId: id,
                    ext: parsedName.ext
                })
 
                createNode({
                    bucket: item[0].bucket,
                    name: parsedName.base,
                    md5hash: item[0].md5Hash,
                    link: item[0].mediaLink,
                    id,
                    parent: null,
                    localFile___NODE: fileNode.id,
                    children: [],
                    internal: {
                        type: name,
                        mediaType: "application/gcpfile",
                        contentDigest: item[0].md5Hash
                    }
                })

                return Promise.resolve()
            }

            fileList.push(r())
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