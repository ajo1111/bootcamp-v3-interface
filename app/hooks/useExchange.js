import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';

//Custom Hooks
import { useProvider } from '@/app/hooks/useProvider';

// ABIs & config
import EXCHANGE from "@/app/abis/Exchange.json";
import config from "@/app/config.json";

// Redux
import { setExchange } from '@/lib/features/exchange/exchange';

export function useExchange() {

    const { provider, chainId } = useProvider();
    const dispatch = useDispatch();
    const exchange = useSelector((state) => state.exchange);

    useEffect(() => {
        if (!provider || !chainId) return;
        if (!config[Number(chainId)]) return;

        const exchangeAddress = config[Number(chainId)].exchange;
        const contract = new ethers.Contract(exchangeAddress, EXCHANGE, provider);
        
        console.log('Exchange loaded:', exchangeAddress);
        dispatch(setExchange({ address: exchangeAddress, contract }));

    }, [provider, chainId, dispatch]);

    return { exchange };
}
