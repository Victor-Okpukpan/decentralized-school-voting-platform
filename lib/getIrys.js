import { WebIrys } from "@irys/sdk";
import { providers } from "ethers";

export const getWebIrys = async () => {
	await window.ethereum.enable();
	const provider = new providers.Web3Provider(window.ethereum);
 
	const network = "devnet";
	const token = "matic";
	const rpcUrl = "https://polygon-amoy.g.alchemy.com/v2/P_OTR_8s2-0IqfkhG2m4RxPOVFNJyG2p";
 
	const wallet = { rpcUrl: rpcUrl, name: "ethersv5", provider: provider };
	const webIrys = new WebIrys({ network, token, wallet });
	await webIrys.ready();
 
	return webIrys;
};