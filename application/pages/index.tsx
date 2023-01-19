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

const Home: NextPage = () => {
  const address = useAddress()
  const { contract } = useContract(ACCOUNTABILITY_CONTRACT_ADDRESS)
  const { data: lockedFundsData, isLoading, error } = useContractRead(
    contract,
    'lockedFunds',
    address,
  )
  console.log({ lockedFundsData, isLoading, error })

  return (
    <div className={styles.container}>
      <button
        onClick={() => signIn('discord')}
        className={`${styles.mainButton} ${styles.spacerTop}`}
      >
        Connect Discord
      </button>
    </div>
  )
}

export default Home
