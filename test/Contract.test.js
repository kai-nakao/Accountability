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
  // Should be able to deposit funds into the contract using the lockFunds function
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

  // Should reject a withdrawal if the user does not have an NFT from the contract
  // Should reject a withdrawal if the user has 0 funds
  // Maybe let's try replicate some kind of reentrancy attack
})
