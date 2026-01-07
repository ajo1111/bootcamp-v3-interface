const {useState, useEffect} = require('react');
import {useSDK} from '@metamask/sdk-react';
import {ethers} from 'ethers';

export function useProvider() {
    const [provider, setProvider] = useState(null);

    const { sdk, chainId} = useSDK();

    useEffect(() => {
        if (sdk) {
            const ethereum = sdk.getProvider();
            const provider = new ethers.BrowserProvider(ethereum);
            setProvider(provider);
        }
    }, [sdk]);

    return { provider, chainId };
}