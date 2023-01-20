import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractRead,
} from '@thirdweb-dev/react'
import type { NextPage } from 'next'
import { useSession, signIn, signOut } from 'next-auth/react'
import { ACCOUNTABILITY_CONTRACT_ADDRESS } from '../const/consts'
import styles from '../styles/Home.module.css'
import { BigNumber, ethers } from 'ethers'

const Home: NextPage = () => {
  const address = useAddress()
  const { contract } = useContract(ACCOUNTABILITY_CONTRACT_ADDRESS)
  const {
    data: lockedFundsData,
    isLoading: LockedFundsLoading,
    error,
  } = useContractRead(contract, 'lockedFunds', address)
  console.log({ lockedFundsData, LockedFundsLoading, error })

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
                  <p>{lockedFundsData.amount.toNumber()}</p>
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
                    {BigNumber.from(lockedFundsData.lockedAt)
                      .add(lockedFundsData.time)
                      .toNumber()}
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}

export default Home
