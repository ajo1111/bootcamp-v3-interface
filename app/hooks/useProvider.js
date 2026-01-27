const {useState, useEffect} = require('react');
import {useSDK} from '@metamask/sdk-react';
import {ethers} from 'ethers';

export function useProvider() {
    const [provider, setProvider] = useState(null);

    const { sdk, chainId: metamaskChainId, connected } = useSDK();

    // Use MetaMask chainId if connected, otherwise default to Hardhat (31337 = 0x7a69)
    const chainId = metamaskChainId || '0x7a69';

    useEffect(() => {
        if (sdk && connected) {
            // Use MetaMask provider if connected
            console.log('useProvider - using MetaMask provider');
            const ethereum = sdk.getProvider();
            const provider = new ethers.BrowserProvider(ethereum);
            setProvider(provider);
        } else {
            // Fallback to localhost JsonRpcProvider for reading data
            console.log('useProvider - using localhost provider');
            const provider = new ethers.JsonRpcProvider('http://localhost:8545');
            setProvider(provider);
        }
    }, [sdk, connected]);

    return { provider, chainId };
}