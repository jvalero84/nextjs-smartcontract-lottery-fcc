import { useMoralis } from "react-moralis" // It will give some useful web3 related hooks
import { useEffect } from "react" // To do something after the component is rendered. This is a core react hook.

export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis() // useMoralis is a React hook

    // Some button that connects us and changes connected to be true..

    useEffect(() => {
        // Actually, the first time the component renders, the hook will run twice because react's strict mode is enabled. (react.strict)
        // StrictMode renders components twice (on dev but not production) in order to detect any problems with your code and warn you about them
        // useEffect takes 2 params, a (setup)function, and an array of dependencies,
        // which is a list of all the elements that react will observ for changes to see if it has to execute the setup function (first arg)
        // React will compare each dependency with its previous value using Object.is comparison.
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
        //enableWeb3()
    }, [isWeb3Enabled])
    // no dependency array: runs after every single render (and re-render) of your component. Warning: Watch out for circular rendering if multiple useEffect are present
    // empty dependency array: runs only after the initial render.

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Àccount changed to ${account}`)
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("null account found")
            }
        })
    }, [])

    return (
        // On react components we can stick js code on the html by wrapping it up on {}
        <div>
            {account ? ( // Better than asking for isWeb3Enabled, check to see if there is already an account connected..
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div> // Sometimes for being more user friendly the account addressed get shortened showing the prefix and suffix.
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            // We do this check because in some versions of nextjs it does not recognize the window object.
                            window.localStorage.setItem("connected", "injected") // We set this value in our browser local storage so that we "remember" that we have connected recently
                            // And then we can check this value on the useEffect to avoid calling enableWeb3 on every single rendering, even if we are already connected to a web3 provider.
                        }
                    }}
                    disabled={isWeb3EnableLoading} // This tells us if the provider popup (metamask in this case) is currently shown
                >
                    Connect
                </button>
            )}
        </div>
    )
}
