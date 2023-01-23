import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractRead,
  Web3Button,
} from '@thirdweb-dev/react'
import type { NextPage } from 'next'
import { useSession, signIn, signOut } from 'next-auth/react'
import { ACCOUNTABILITY_CONTRACT_ADDRESS } from '../const/consts'
import styles from '../styles/Home.module.css'
import { BigNumber, ethers } from 'ethers'
import { useState } from 'react'

const Home: NextPage = () => {
  const address = useAddress()
  const { data: discordAuthData, status: discordAuthStatus } = useSession()
  const { contract } = useContract(ACCOUNTABILITY_CONTRACT_ADDRESS)
  const {
    data: lockedFundsData,
    isLoading: LockedFundsLoading,
    error,
  } = useContractRead(contract, 'lockedFunds', address)

  const [form, setForm] = useState({
    amount: '',
    days: 0,
  })

  async function attemptWithdraw() {
    console.log('asdnifajiefjaiejif')
  }

  // 0: Hasn't connected wallet yet
  if (!address) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Accountability Project</h1>
          <div className={styles.connect}>
            <ConnectWallet />
          </div>
        </main>
      </div>
    )
  }
  // 1: Error - something went wrong
  if (error) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Something went wrong</h1>
          {/* @ts-ignore */}
          <p>{error.reason}</p>
          <ConnectWallet />
        </main>
      </div>
    )
  }

  // 2: Loading - waiting for data
  if (LockedFundsLoading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Accountability Project</h1>
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  // 3: Data has loaded. There is no locked funds
  // - Here we show the user option to commit X funds for Y time
  if (lockedFundsData.amount.eq(0)) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Accountability Project</h1>
          <div className={styles.form}>
            <input
              type="text"
              placeholder="Amount to commit"
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value,
                })
              }
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Days to commit"
              onChange={(e) =>
                setForm({
                  ...form,
                  days: Number(e.target.value),
                })
              }
              className={styles.input}
            />
            <Web3Button
              contractAddress={ACCOUNTABILITY_CONTRACT_ADDRESS}
              action={(contract) =>
                contract.call('lockFunds', form.days * 150, {
                  value: ethers.utils.parseEther(form.amount),
                })
              }
              onSuccess={() => alert('Success')}
              onError={(e) => alert('ERROR')}
            >
              Lock Funds
            </Web3Button>
          </div>
        </main>
      </div>
    )
  }

  // 4: Data has loaded. There is locked funds
  // - Here we cloud have a ternary operator that depends on if the funds are ready to withdraw
  // If they are, then we show the user the option to withdraw, otherwise show the information about the locked funds.

  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Accountability Project</h1>

          <p className={styles.description}>
            Commit to a goal and lock up your funds to ensure you follow
            through.
          </p>

          {LockedFundsLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className={styles.connect}>
                <ConnectWallet />
              </div>

              <div className={styles.grid}>
                <div className={styles.card}>
                  <h2>Locked Amount</h2>
                  <p>
                    {ethers.utils.formatEther(
                      lockedFundsData.amount.toNumber(),
                    )}{' '}
                    ETH
                  </p>
                </div>

                <div className={styles.card}>
                  <h2>You Locked At</h2>
                  <p>
                    {BigNumber.from(lockedFundsData.lockedAt).eq(0)
                      ? 'N/A'
                      : new Date(
                          BigNumber.from(lockedFundsData.lockedAt).toNumber() *
                            1000,
                        ).toLocaleString()}
                  </p>
                </div>

                <div className={styles.card}>
                  <h2>Time</h2>
                  <p>
                    {BigNumber.from(lockedFundsData.lockedAt).eq(0)
                      ? 'N/A'
                      : new Date(
                          BigNumber.from(lockedFundsData.lockedAt)
                            .add(lockedFundsData.time)
                            .toNumber() * 1000,
                        ).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
          {
            // The user needs to sign in with Discord, before this button appears.
            discordAuthStatus !== 'authenticated' ? (
              <button onClick={() => signIn('discord')}>
                Sign in with Discord
              </button>
            ) : BigNumber.from(lockedFundsData.lockedAt)
                .add(lockedFundsData.time)
                .mul(1000)
                .lt(BigNumber.from(Date.now())) ? (
              <Web3Button
                contractAddress={ACCOUNTABILITY_CONTRACT_ADDRESS}
                action={() => attemptWithdraw()}
              >
                Withdraw
              </Web3Button>
            ) : (
              <p>You are not ready to withdraw yet.</p>
            )
          }
        </main>
      </div>
    </>
  )
}

export default Home
