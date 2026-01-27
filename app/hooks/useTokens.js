import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

//Custom Hooks
import { useProvider } from '@/app/hooks/useProvider';

// ABIs & config
import TOKEN from "@/app/abis/Token.json";
import config from "@/app/config.json";

export function useTokens() {

    const { provider, chainId } = useProvider();
    const [tokens, setTokens] = useState({});

    useEffect(() => {
        console.log('useTokens - provider:', provider);
        console.log('useTokens - chainId:', chainId);
        
        if (!provider || !chainId) {
            console.log('useTokens - returning early, missing provider or chainId');
            return;
        }
        if (!config[Number(chainId)]) {
            console.log('useTokens - no config for chainId:', Number(chainId));
            return;
        }

        console.log('chainId:', chainId);
        console.log('config:', config[Number(chainId)]);

        let contracts = {};

        config[Number(chainId)].tokens.forEach((token) => {
            const contract = new ethers.Contract(token.address, TOKEN, provider);
            contracts[token.address] = contract;
        });

        console.log('contracts:', contracts);
        setTokens(contracts);

    }, [provider, chainId]);

    return { tokens };
}