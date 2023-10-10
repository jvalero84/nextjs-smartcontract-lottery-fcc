import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <div>
            Decentralized Raffle
            <ConnectButton moralisAuth={false} />{" "}
            {/* this attribute is not needed but for the sake of explicity we indicate that we don't want to connect to any server */}
        </div>
    )
}
