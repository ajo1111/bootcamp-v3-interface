"use client"

import { useState } from "react";

import { useEffect } from "react";
import { useSDK } from "@metamask/sdk-react";
import { ethers } from "ethers";

// Import hooks
import { useProvider } from "@/app/hooks/useProvider";

function TopNav() {

    const { sdk, provider: metamask, chainId } = useSDK();
    const { provider} = useProvider();

    const [account, setAccount] = useState("");
    const [balance, setBalance] = useState("");

    async function connectHandler() {
        try {
            await sdk.connectAndSign( { msg: "Sign in to AI Exchange" });
            await getAccountInfo();
            } catch (error) {
            console.log(error)
        }
    }

    async function getAccountInfo() {
        // Get the currently connected account & balance
        const account = await provider.getSigner();
        const balance = await provider.getBalance(account);

        // Store the value in the state
        setAccount(account.address)
        setBalance(balance)
    }

    useEffect(() => {
        // connect to blockchain here...
        connectHandler()
    })

    return(
       <nav className="topnav">
            <p>My Account: {account}</p>
            <p>My Balance: {balance}</p>
       </nav>
    );
}

export default TopNav;
