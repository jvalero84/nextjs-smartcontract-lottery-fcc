import { useWeb3Contract } from "react-moralis"
import { contractAddresses, abi } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis() // The reason why Moralis knows about our current network is because in our header when using the connect button from moralis
    // it is passing all the provider information (in this case Metamask) to the moralis Provider (_app.js)
    // which makes it available for all the components inside those MoralisProvider tags

    const chainId = parseInt(chainIdHex) // Moralis returns the chainId in Hex, we have to convert it to Dec
    console.log(`chainId: ${chainId}`)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function UpdateUI() {
        setEntranceFee((await getEntranceFee()).toString())
        setNumPlayers((await getNumberOfPlayers()).toString())
        setRecentWinner((await getRecentWinner()).toString())
    }

    // To be able to enter the raffle we need first to find out what is the entranceFee to pass as MsgValue to the enterRaffle function call..
    // We are going to use a hook useEfect (which runs when something changes) so that when this component renders we retrieve the entranceFee..

    useEffect(() => {
        // We can't use await inside useEffect, that's why we wrapped the async functions (getEntranceFee, enterRaffle...)
        //in an async function (updateUI) and then call it from useEffect
        if (isWeb3Enabled) {
            // Try to read the raffle entrance fee..
            UpdateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        UpdateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            Hi from Lottery Entrance!
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess, // onSuccess only checks that the transaction has been successfully sent to Metamask (not if it has a block confirmation)
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div> Players:{numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle Address detected!</div>
            )}
        </div>
    )
}
