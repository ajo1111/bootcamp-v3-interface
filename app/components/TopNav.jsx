"use client";

import { useState } from "react";

import { useEffect } from "react";
import Image from "next/image";
import { useSDK } from "@metamask/sdk-react";
import Jazzicon from "react-jazzicon";
import { ethers } from "ethers";

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setAccount, setBalance } from "@/lib/features/user";
import {
    selectAccount,
    selectETHBalance,
} from "@/lib/selectors";

// Import hooks
import { useProvider } from "../hooks/useProvider";

//Import assets
import network from "@/app/assets/other/network.svg";

// Import config
import config from "@/app/config.json";

function TopNav() {

    const dispatch = useAppDispatch();

    const { sdk, provider: metamask, chainId} = useSDK();
    const { provider } = useProvider();
    const account = useAppSelector(selectAccount);
    const balance = useAppSelector(selectETHBalance);


    async function connecthandler() {
        try {
            await sdk.connectAndSign({ msg: "Sign In to DAPP Exchange" });
            await getAccountInfo();
        } catch (error) {
            console.log(error);
        }
    }

    async function networkHandler() {
        await metamask.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: e.target.value }],
        });
    }    

    async function getAccountInfo() {
        // Get the currently connected account & balance
        const account = await provider.getSigner()
        const balance = await provider.getBalance(account)
        
        //Store the values in state
        dispatch(setAccount(account.address));
        dispatch(setBalance(ethers.formatUnits(balance, 18)));      
    }

useEffect(() => {

    if(sdk && metamask) {
        // // create event listener
        metamask.on("accountsChanged", async (accounts) => {
        if (accounts.length === 0) {
            // no accounts are connected
            dispatch(setAccount(""));
            dispatch(setBalance(""));
        } else {
          await getAccountInfo();
        }
    });

    metamask.on("chainChanged", () => window.location.reload());

    //This allows us to remove any duplicate event
    // Listeners that may be added from navigating
    // back and forth to this page
    return () => {
        metamask.removeAllListeners();
    }
    }
}, [sdk, metamask, provider]);

    return(
        <nav className="topnav">
            <div className="network">
               <label className="icon" htmlFor="network">
                <Image src={network} alt="Select network" />
               </label>
            <div className="select">
                <select 
                name="network" 
                id="network" 
                value={config[Number(chainId)] ? chainId : "0x7a69"}
                onChange={networkHandler}
                >
                   <option value="0">Select</option>
                   <option value="0x7a69">Hardhat</option>
                </select>
                </div> 
            </div>

            <div className="account">
                {account && (
                <div className="balance">
                    <p>My Balance <span>{Number(balance).toFixed(2)} ETH</span></p>
                </div>
                )}

                {account ? (
                <a 
                  href={`https://etherscan.io/address/${account}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="link"
                >
                  {account.slice(0,6) + account.slice(38, 42)}
                  <Jazzicon diameter={44} seed={account} />
                </a>
                ) : (
                  <button onClick={connecthandler} className="button">
                    Connect
                    </button>
                )}

            </div>
        </nav>
    );
}

export default TopNav;
