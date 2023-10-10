import { useWeb3Contract } from "react-moralis" 

export default function LotteryEntrance() {

    const {runContractFunction : enterRaffle} = useWeb3Contract({

    })

    return <div>Hi from Lottery Entrance!</div>
}
