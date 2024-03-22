// Write tests for your smart contracts here

const { expect } = require('chai'); // Import assertion library
const { ethers } = require('hardhat'); // Import ethers.js to interact with the Ethereum blockchain

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Start test block
// Run `npx hardhat test` to run the test
describe('Escrow', () => {
    let buyer, seller, inspector, lender
    let realEstate

    beforeEach(async () => {
        // Set up the signers
        [buyer, seller, inspector, lender] = await ethers.getSigners()

        // Deploy Real Estate contract on the blockchain
        const RealEstate = await ethers.getContractFactory('RealEstate') // Load the compiled contract
        realEstate = await RealEstate.deploy() // Deploy the contract

        // Mint the NFT
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        const Escrow = await ethers.getContractFactory('Escrow') // Load the compiled contract
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        // Approve the escrow contract to transfer the NFT
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        // List property
        transaction = await escrow.connect(seller).list(1, tokens(10), buyer.address, tokens(5))
        await transaction.wait()

        // Deposit earnest money into escrow
    })

    describe('Deployment', () => {

        it('Returns NFT address', async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })

        it('Returns seller', async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })

        it('Returns inspector', async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })

        it('Returns lender', async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })

    })

    describe('Listing', () => {
        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address) // Check if the escrow contract is the owner of the NFT
        })

        it('Updates as listed', async () => {
            const result = await escrow.isListed(1)
            expect(result).to.be.equal(true)
        })

        it('Returns buyer', async () => {
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })

        it('Returns purchase price', async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })

        it('Returns escrow amount', async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Deposits', () => {
        it('Updates contract balance', async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Inspection', () => {
        it('Updates inspection status', async () => {
            const transaction = await escrow.connect(inspector).updateInspection(1, true)
            await transaction.wait()
            const result = await escrow.inspectionPassed(1)
            expect(result).to.be.equal(true)
        })
    })
})
