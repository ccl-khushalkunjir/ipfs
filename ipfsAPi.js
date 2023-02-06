'use strict'

const IPFS = require('ipfs');
let IPFSNative

const ipfs = async function ipfs() {
    console.log('inside ipfs func start')
    try {
        const ipfs = await IPFS.create({
            start: true,
            EXPERIMENTAL: {
                pubsub: true,
            },
            config: {
                Addresses: {
                    Swarm: ['/ip4/0.0.0.0/tcp/4012', '/ip4/127.0.0.1/tcp/4013/ws'],
                    API: '/ip4/127.0.0.1/tcp/5012',
                    Gateway: '/ip4/127.0.0.1/tcp/9191',
                },
            },
        })
            .then(async (ipfs) => {
                console.log('after starting')
                await ipfs.files.mkdir('/user', { parents: true })
                IPFSNative = ipfs
                console.log('IPFSNative - 1', IPFSNative)
            })
            .catch((reason) => {
                console.log('failing reason', reason)
            })

        return ipfs
    } catch (error) {
        console.error('IPFS Error -->', error)
    }
    console.log('inside ipfs func end')
}
;(async () => await Promise.resolve(ipfs()))()

const IPFSNativeQuery = async (key) => {
    console.log('IPFSNativeQuery key', key)
    try {
        const stream = await IPFSNative.dag.get(key)
        if (stream) {
            return stream.value.payload.value
        } else {
            throw new Error('Error')
        }
    } catch (error) {
        throw error
    }
}

const IPFSFileStats = async (fileName) => {
    console.log('IPFSFileStats fileName', fileName)
    try {
        const data = await IPFSNative.files.stat(fileName)
        return data
    } catch (error) {
        if (error.code == 'ERR_NOT_FOUND' || error.message == `${fileName} does not exist`) {
            return undefined
        }
        throw error
    }
}

const IPFSWriteFile = async (path, content, options = {}) => {
    console.log('IPFSWriteFile path', path)
    console.log('IPFSWriteFile options', options)
    try {
        return IPFSNative.files.write(path, JSON.stringify(content), options)
    } catch (error) {
        console.log('error', error)
        throw error
    }
}

const IPFSAddFile = async (path, content, options = {}) => {
    console.log('IPFSAddFile path', path)
    console.log('IPFSAddFile JSON.stringify(content)', JSON.stringify(content))
    console.log('IPFSAddFile options', options)
    try {
        return IPFSNative.files.write(path, content, options)
    } catch (error) {
        throw error
    }
}

const IPFSGetFileCID = async (cid, options = {}) => {
    console.log('IPFSGetFileCID cid', cid)
    console.log('IPFSGetFileCID options', options)
    try {
        const chunks = []
        for await (const chunk of IPFSNative.cat(cid)) {
            chunks.push(chunk)
        }
        return chunks.toString()
    } catch (error) {
        if (error.code == 'ERR_NOT_FOUND' || error.message == `${cid} does not exist`) {
            return undefined
        }
        throw error
    }
}

const IPFSGetFile = async (path, options = {}) => {
    console.log('IPFSGetFile path', path)
    console.log('IPFSGetFile options', options)
    try {
        const chunks = []
        for await (const chunk of IPFSNative.files.read(path)) {
            chunks.push(chunk)
        }
        const result = chunks.toString()
        return JSON.parse(result)
    } catch (error) {
        console.log(error)
        if (error.code == 'ERR_NOT_FOUND' || error.message == `${path} does not exist`) {
            return undefined
        }
        throw error
    }
}

const IPFSRemoveFile = async (path, options = {}) => {
    console.log('IPFSRemoveFile path', path)
    console.log('IPFSRemoveFile options', options)
    try {
        await IPFSNative.files.read(path, options)
        let result = await IPFSNative.files.rm(path, options)
        for await (const gcResponse of IPFSNative.repo.gc()) {
            if (gcResponse.err) {
                throw gcResponse.err
            }
        }
        if (!result) {
            result = true
        }
        return result
    } catch (error) {
        if (error.code == 'ERR_NOT_FOUND' || error.message == 'file does not exist') {
            return undefined
        }
        throw error
    }
}

// ipfs()

module.exports = {
    ipfs,
    IPFSNativeQuery,
    IPFSFileStats,
    IPFSWriteFile,
    IPFSGetFile,
    IPFSRemoveFile,
    IPFSGetFileCID,
    IPFSAddFile,
}