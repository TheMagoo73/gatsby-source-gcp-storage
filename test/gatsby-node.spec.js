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

    getFiles() { return Promise.resolve([[new FileStub()],[]])}
}

class StorageStub {
    constructor() {}

    bucket() { return new BucketStub()}
}

// Arrange stubs
sourceNodes.__set__("createFileNodeFromBuffer", createFileNodeFromBufferStub)
sourceNodes.__set__("Storage", StorageStub)

describe('gatsby-source-gcp-storage', ()=> {

    it('works', async () => {
        await sourceNodes.sourceNodes(apiMock, {gcpTokenFile: "token", gcpBucketName: "bucket"})
        apiMock.reporter.panic.should.not.be.called
        apiMock.actions.createNode.should.be.calledOnce
        createFileNodeFromBufferStub.should.be.calledOnce
    })

})