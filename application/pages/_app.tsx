import type { AppProps } from 'next/app'
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'
import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Goerli

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId}>
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
        {/* <ThirdwebGuideFooter /> */}
      </SessionProvider>
    </ThirdwebProvider>
  )
}

export default MyApp
