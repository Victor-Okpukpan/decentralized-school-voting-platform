import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import type { AppProps } from "next/app";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, type Locale } from "@rainbow-me/rainbowkit";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { config } from "../wagmi";
import { useRouter } from "next/router";
import { MyProvider } from "@/context/MyContext";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const { locale } = useRouter() as { locale: Locale };
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale={locale}>
          <MyProvider>
            <Component {...pageProps} />
            <ToastContainer
              theme="dark"
              position="top-right"
              autoClose={5000}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </MyProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
