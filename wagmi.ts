import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  polygonAmoy,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    polygonAmoy
  ],
  ssr: true,
});
