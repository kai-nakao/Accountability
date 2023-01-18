const {
  loadFixture,
  time,
} = require('@nomicfoundation/hardhat-network-helpers')
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Contract.sol', function () {
  async function deployContractFixture() {
    const AccountabilityFactory = await ethers.getContractFactory(
      'Accountability',
    )
    const AccountabilityNFTsFactory = await ethers.getContractFactory(
      'AccountabilityNFTs',
    )
    const [owner, addr1, addr2] = await ethers.getSigners()

    const accountabilityNfts = await AccountabilityNFTsFactory.deploy(
      'Accountability NFTs',
      'ACCT',
      owner.address,
      0,
      owner.address,
    )

    await accountabilityNfts.deployed()
    console.log('AccountabilityNFTs deployed to:', accountabilityNfts.address)
    const accountability = await AccountabilityFactory.deploy(
      accountabilityNfts.address,
    )

    await accountability.deployed()
    console.log('Accountability deployed to:', accountability.address)

    // Fixtures can return anything you consider useful for your tests
    return { accountability, accountabilityNfts, owner, addr1, addr2 }
  }

  it('Should be able to deposit funds into the contract using the lockFunds function', async function () {
    const { accountability, owner, addr1 } = await loadFixture(
      deployContractFixture,
    )

    await accountability.lockFunds(time.duration.minutes(1), {
      value: ethers.BigNumber.from(1000),
    })
    // check lockedFunds mapping
    const lockedFunds = await accountability.lockedFunds(owner.address)
    expect(lockedFunds.amount).to.equal(ethers.BigNumber.from(1000))
    expect(lockedFunds.time).to.equal(60)
    expect(lockedFunds.lockedAt).to.equal(await time.latest())
  })

  it('Should be able to withdraw funds from the contract using the withdrawFunds function', async function () {
    const { accountability, owner, addr1 } = await loadFixture(
      deployContractFixture,
    )
    await accountability.lockFunds(time.duration.minutes(1), {
      value: ethers.BigNumber.from(1000),
    })
    lockedFunds = await accountability.lockedFunds(owner.address)

    // Try and withdraw before the time has passed
    await expect(accountability.connect(owner).withdraw()).to.be.revertedWith(
      "You can't withdraw yet.",
    )
  })

  it("Should reject a withdrawal if the user doen't have an NFT from the NFT contract", async function () {
    const { accountability, owner, addr1 } = await loadFixture(
      deployContractFixture,
    )
    await accountability.lockFunds(time.duration.minutes(1), {
      value: ethers.BigNumber.from(1000),
    })
    lockedFunds = await accountability.lockedFunds(owner.address)

    // Wait 1 minute
    await time.increase(time.duration.minutes(1))

    // Fail to withdraw does not have an NFT
    await expect(accountability.connect(owner).withdraw()).to.be.revertedWith(
      'You do not own an NFT from the other smart contract.',
    )
  })

  it('Should reject a withdrawal if the user has 0 funds', async function () {
    const { accountability, owner, addr1 } = await loadFixture(
      deployContractFixture,
    )
    await expect(accountability.connect(owner).withdraw()).to.be.revertedWith(
      'You have no locked funds.',
    )
  })

  it('Successfully withdraw funds if the time has passed and the user has an NFT', async function () {
    const {
      accountability,
      accountabilityNfts,
      owner,
      addr1,
    } = await loadFixture(deployContractFixture)
    await accountability.lockFunds(time.duration.minutes(1), {
      value: ethers.BigNumber.from(1000),
    })

    // Wait 1 minute
    await time.increase(time.duration.minutes(1))

    // we need to mint an NFT for the owner
    await accountabilityNfts.mintTo(owner.address, 'url')

    await accountability.connect(owner).withdraw()

    // Expect the lockedFunds mapping to be empty
    const lockedFunds = await accountability.lockedFunds(owner.address)
    expect(lockedFunds.amount).to.equal(ethers.BigNumber.from(0)) // 0
  })
})
