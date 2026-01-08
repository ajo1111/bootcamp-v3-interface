"use client";

import { useState } from "react";

import { useEffect } from "react";
import Image from "next/image";
import { useSDK } from "@metamask/sdk-react";
import { ethers } from "ethers";

// Import hooks
import { useProvider } from "../hooks/useProvider";

//Import assets
import network from "@/app/assets/other/network.svg";

function TopNav() {

    const { sdk, provider: metamask, chainId} = useSDK();
    const { provider } = useProvider();

    const [account, setAccount] = useState("");
    const [balance, setBalance] = useState("");

    async function connecthandler() {
        try {
            await sdk.connectAndSign({ msg: "Sign In to DAPP Exchange" });
            await getAccountInfo();
        } catch (error) {
            console.log(error);
        }
    }

    
    async function getAccountInfo() {
        if (!provider) return;
        
        // Get the currently connected account & balance
        const account = await provider.getSigner()
        const balance = await provider.getBalance(account)
        
        //Store the values in state
        setAccount(account.address)
        setBalance(balance)
    }

    useEffect(() => {
        // // connect to blockchain here...
        // connecthandler();
    }, [provider]);

    return(
        <nav className="topnav">
            <div className="network">
               <label className="icon" htmlFor="network">
                <Image src={network} alt="Select network" />
               </label>
            <div className="select">
                <select name="network" id="network" value="">
                   <option value="0">Select</option>
                   <option value="0x7a69">Hardhat</option>
                </select>
                </div> 
            </div>
        </nav>
    );
}

export default TopNav;
