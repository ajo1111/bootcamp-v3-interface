import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { setMarkets } from '@/lib/features/exchange/exchange';
import config from '@/app/config.json';
import { useProvider } from '@/app/hooks/useProvider';

export function useMarkets() {
  const dispatch = useAppDispatch();
  const { chainId } = useProvider();

  useEffect(() => {
    if (!chainId || !config[Number(chainId)]) {
      return;
    }

    const markets = config[Number(chainId)].markets || [];
    dispatch(setMarkets(markets));
  }, [chainId, dispatch]);
}
