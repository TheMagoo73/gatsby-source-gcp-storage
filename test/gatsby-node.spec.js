const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const sinonChai = require("sinon-chai")
const sinon = require("sinon")

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()

const rewire = require('rewire')

const {Storage, Bucket, File} = require('@google-cloud/storage')
const {Readable} = require('stream')
const sourceNodes = rewire('../src/gatsby-node')

// Mock the Gatsby API
const apiMock = {
    actions: {
        createNode: sinon.spy()
    },
    reporter: {
        panic: sinon.stub(),
        warn: sinon.stub(),
        info: sinon.stub()
    },
    createNodeId: sinon.stub(),
    store: sinon.stub(),
    cache: sinon.stub()
}

// Mock gatsby-source-filesystem helper function
const createFileNodeFromBufferStub = sinon.stub().resolves({id: '9876'})

// Mock the @Google Storage API
class FileStub {
    constructor() {}

    getMetadata() { return Promise.resolve([
        {
            mediaLink: 'https://foo.com/files/bar.md',
            name: 'files/bar.md',
            bucket: 'fooBucket',
            md5hash: 'ABC123'
        }
    ])}
    createReadStream() { return Promise.resolve(new Readable())}
}

class BucketStub {
    constructor() {}

    getFiles(options) { 
        if(options.directory !== '/')
            return Promise.resolve([[new FileStub()],[]])
        else
            return Promise.resolve([[],[]])
    }
}

class StorageStub {
    constructor() {}

    bucket() { return new BucketStub()}
}

// Arrange stubs
sourceNodes.__set__("createFileNodeFromBuffer", createFileNodeFromBufferStub)
sourceNodes.__set__("Storage", StorageStub)

describe('gatsby-source-gcp-storage', ()=> {

    beforeEach(() => {
        apiMock.reporter.panic.resetHistory()
        apiMock.reporter.warn.resetHistory()
        apiMock.actions.createNode.resetHistory()
        createFileNodeFromBufferStub.resetHistory()
    })

    it('validates required options', async () => {

        const params = [
            {gcpTokenFile: null, gcpBucketName: "bucket"},
            {gcpTokenFile: "token", gcpBucketName: null}
        ]

        for(let i=0; i< params.length; i++){
            apiMock.reporter.panic.resetHistory()
            await sourceNodes.sourceNodes(apiMock, params[i])
            apiMock.reporter.panic.should.be.calledOnce
        }
    })

    it('works', async () => {
        await sourceNodes.sourceNodes(apiMock, {gcpTokenFile: "token", gcpBucketName: "bucket", storageDirectory: "/foo"})
        apiMock.reporter.panic.should.not.be.called
        apiMock.actions.createNode.should.be.calledOnce
        apiMock.actions.createNode.args[0][0].internal.type.should.deep.equals('GcpStorage')
        apiMock.actions.createNode.args[0][0].internal.mediaType.should.deep.equals('application/gcpfile')
        apiMock.actions.createNode.args[0][0].localFile___NODE.should.deep.equals('9876')
    })

    it("defaults to the root directory", async () => {
        await sourceNodes.sourceNodes(apiMock, {gcpTokenFile: "token", gcpBucketName: "bucket"})
        apiMock.reporter.warn.should.be.calledOnce
    })

    it('type can be renamed', async () => {
        await sourceNodes.sourceNodes(apiMock, {gcpTokenFile: "token", gcpBucketName: "bucket", storageDirectory: "/foo", name: "FooDocs"})
        apiMock.actions.createNode.args[0][0].internal.type.should.deep.equals('FooDocs')
    })

})