const ipfs = require("./ipfsAPi");

async function main () {
    await ipfs.ipfs()

    await ipfs.IPFSAddFile({
        path: 'hello.txt',
        content: Buffer.from('Hello World 101')
      })

    await ipfs
    
}

main()




