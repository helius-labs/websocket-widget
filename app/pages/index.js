import { useCallback, useEffect, useState, useRef } from "react";
import { PublicKey } from "@solana/web3.js";
import { ArrowRightCircleIcon, CursorArrowRaysIcon, CubeTransparentIcon, ChatBubbleOvalLeftEllipsisIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Switch } from "@headlessui/react";

const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

export default function Home() {
    const ws = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [address, setAddress] = useState('');
    const [isRequired, setIsRequired] = useState(false);
    const [addresses, setAddresses] = useState([])
    const [commitmentState, setCommitmentState] = useState("confirmed");
    const [details, setDetails] = useState("full");
    const [encoding, setEncoding] = useState("base58");
    const [apiKey, setApiKey] = useState("");

    // Function to validate Solana address
    const validateAddress = (address) => {
        // Check if the address already exists in the array
        if (addresses.some(item => item.address === address)) {
            alert("Do not provide duplicate addresses");
            return false;
        } else {
            try {
                const pubkey = new PublicKey(address);
                // Check if the encoded address has the typical length of 43 characters
                if (pubkey.toBase58().length === 43) {
                    return true;
                } else {
                    alert('Invalid Solana address');
                    return false;
                }
            } catch (error) {
                alert('Invalid Solana address');
                return false;
            }
        }
    };

    // Handle adding addresses
    const addAddress = () => {
        if (address && validateAddress(address)) {
            setAddresses([
                ...addresses,
                { address: address, isRequired: isRequired }
            ])
        }

        setAddress('');
        setIsRequired(false);
    };

    // Function to find and remove an address by its 'address' value
    const removeAddress = (targetAddress) => {
        // Find the index of the address object
        const index = addresses.findIndex(item => item.address === targetAddress);

        // Check if the address was found (index !== -1)
        if (index !== -1) {
            // Remove the address from the array using splice
            setAddresses(currentAddresses => {
                const newAddresses = [...currentAddresses];
                newAddresses.splice(index, 1);
                return newAddresses;
            });
        } else {
            // Optionally, handle the case where the address is not found
            console.log("Address not found in the array.");
        }
    };

    const cloeWebSocket = useCallback(() => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
            setIsConnected(false);
            console.log('WebSocket is closed.');
        }
    });

    const sendRequest = useCallback(() => {
        const { accountsRequired, accountsIncluded } = addresses.reduce((acc, item) => {
            if (item.required) {
                acc.accountsRequired.push(item.address);
            } else {
                acc.accountsIncluded.push(item.address);
            }
            return acc;
        }, { accountsRequired: [], accountsIncluded: [] });

        const request = {
            jsonrpc: "2.0",
            id: 420,
            method: "transactionSubscribe",
            params: [
                {
                    accountInclude: accountsIncluded,
                    accountRequire: accountsRequired
                },
                {
                    commitment: commitmentState,
                    encoding: encoding,
                    transactionDetails: details,
                    showRewards: true,
                    maxSupportedTransactionVersion: 1
                }
            ]
        };

        if (!ws.current) {
            // Open WebSocket
            const wsUrl = `wss://atlas-mainnet.helius-rpc.com?api-key=${apiKey}`;
            ws.current = new WebSocket(wsUrl);
            ws.current.onopen = () => {
                console.log('WebSocket is open');
                ws.current.send(JSON.stringify(request));
                setIsConnected(true);
            };
        } else {
            ws.current.send(JSON.stringify(request));
            setIsConnected(true);
        }
        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setNotifications((prevNotifications) => [...prevNotifications, message]);
        };
    }, [apiKey, addresses, commitmentState, details, encoding]);

    useEffect(() => {
        if (ws.current) {
            ws.current.onclose = () => { setIsConnected(false); };
        }
    }, []);

    return (
        <>
            <div className="relative isolate px-6 pt-6 lg:px-8">
                <div
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    aria-hidden="true"
                >
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#e3572e] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>

                <div className="mx-auto max-w-2xl pt-32 sm:pt-48 pb-10">
                    <div className="hidden sm:flex sm:justify-center">
                        <a
                            href="https://docs.helius.dev/webhooks-and-websockets/websockets"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex justify-center"
                        >
                            <div className="relative flex items-center rounded-full text-opacity-70 group-hover:text-opacity-100 border border-white border-opacity-20 bg-opacity-25 px-4 py-1 text-xs leading-6 text-white transition-all duration-200 ease-in-out hover:bg-black/10 group-hover:border-opacity-60 group-hover:bg-opacity-75 sm:px-3 sm:text-sm">
                                Want to learn more?{" "}

                                <span className="mx-2 h-4 border-l border-white/20" />

                                <div className="flex items-center font-semibold text-accent">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    View the docs
                                    <ArrowRightCircleIcon className="w-5 ml-1" />
                                </div>
                            </div>
                        </a>
                    </div>
                    <div className="text-center mt-8">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            Go Faster With<br /><span className="bg-gradient-to-r from-[#e3572e] via-orange-300 to-[#e3572e] inline-block text-transparent bg-clip-text">Websockets</span>
                        </h1>
                        <p className="text-lg leading-8 text-gray-200 mt-8">
                            Websockets keep a persistent connection open,<br />enabling real-time data exchange. Test the transactionSubscribe method on Mainnet below.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                    <div className="sm:col-span-6 sm:col-start-4">
                        <label className="block text-sm font-medium leading-6 text-white">
                            Helius API Key
                        </label>
                        <div className="mt-2">
                            <input
                                value={apiKey}
                                onChange={event => setApiKey(event.target.value)}
                                className="overflow-x-scroll px-2 block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-4 sm:col-start-4">
                        <label className="block text-sm font-medium leading-6 text-white">
                            Solana Address
                        </label>
                        <div className="mt-2">
                            <input
                                value={address}
                                onChange={event => setAddress(event.target.value)}
                                className="overflow-x-scroll px-2 block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2 flex items-center">
                        <Switch.Group as="div" className="flex items-center mt-auto pb-2">
                            <Switch
                                checked={isRequired}
                                onChange={setIsRequired}
                                className={classNames(
                                    isRequired ? 'bg-orange-300/40' : 'bg-white/10',
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className={classNames(
                                        isRequired ? 'translate-x-5' : 'translate-x-0',
                                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                    )}
                                />
                            </Switch>
                            <Switch.Label as="span" className="ml-3 text-sm">
                                <span className="font-medium text-white">Is Required</span>{' '}
                            </Switch.Label>
                        </Switch.Group>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="mt-2">
                            <button
                                onClick={addAddress}
                                disabled={address.length === 0}
                                className="disabled:cursor-not-allowed flex items-center justify-center transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 enabled:hover:ring-orange-200/20 enabled:hover:bg-white/10 py-2 text-white/10 enabled:text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6"
                            >
                                <span>Add Address</span>
                                <CursorArrowRaysIcon className="w-5 ml-1 disabled:text-white/10 disabled:fill-white/10 enabled:text-white enabled:fill-white" />
                            </button>
                        </div>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="my-2">
                            <div className="transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6 h-52 overflow-y-scroll">
                                {addresses.length === 0
                                    ? (
                                        <div className="flex flex-col items-center justify-center text-center gap-y-2 text-white/30 border border-dashed border-white/10 rounded-md w-64 h-5/6 mx-auto translate-y-4 bg-gray-500/5">
                                            <CubeTransparentIcon className="w-8" />
                                            Enter an address<br /> to get started
                                        </div>
                                    )
                                    : (
                                        addresses.map(item => (
                                            <div className="text-center shadow-sm border-0 ring-1 ring-inset ring-white/10 mx-4 my-2 h-10 rounded-md px-2 flex items-center justify-between text-white/50">
                                                <span>
                                                    {item.address.slice(0, 6)}...{item.address.slice(-6)}
                                                </span>
                                                <span>
                                                    {item.isRequired ? "Required" : "Not Required"}
                                                </span>
                                                <button
                                                    onClick={() => removeAddress(item.address)}
                                                >
                                                    <XCircleIcon className="w-5 hover:text-red-300/50 transition-colors duration-200 ease-in-out" />
                                                </button>
                                            </div>
                                        ))
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-2 sm:col-start-4">
                        <label className="block text-sm font-medium leading-6 text-white">
                            Commitment
                        </label>
                        <div className="mt-2">
                            <select
                                onChange={(e) => setCommitmentState(e.target.value)}
                                className="transition-all duration-200 ease-in-out cursor-pointer block w-full rounded-md border-0 bg-white/5 hover:ring-orange-200/20 hover:bg-white/10 py-2 px-1 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm"
                            >
                                <option value="confirmed" className="text-white">Confirmed</option>
                                <option value="finalized" className="text-white">Finalized</option>
                                <option value="processed" className="text-white">Processed</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium leading-6 text-white">
                            Details
                        </label>
                        <div className="mt-2">
                            <select
                                onChange={(e) => setDetails(e.target.value)}
                                className="transition-all duration-200 ease-in-out cursor-pointer block w-full rounded-md border-0 bg-white/5 hover:ring-orange-200/20 hover:bg-white/10 py-2 px-1 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm"
                            >
                                <option value="full" className="text-white">Full</option>
                                <option value="signatures" className="text-white">Signatures</option>
                                <option value="accounts" className="text-white">Accounts</option>
                                <option value="none" className="text-white">None</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium leading-6 text-white">
                            Encoding
                        </label>
                        <div className="mt-2">
                            <select
                                onChange={(e) => setEncoding(e.target.value)}
                                className="transition-all duration-200 ease-in-out cursor-pointer block w-full rounded-md border-0 bg-white/5 hover:ring-orange-200/20 hover:bg-white/10 py-2 px-1 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm"
                            >
                                <option value="base58" className="text-white">base58</option>
                                <option value="base64" className="text-white">base64</option>
                                <option value="base64+zstd" className="text-white">base64+zstd</option>
                                <option value="jsonParsed" className="text-white">jsonParsed</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="mt-2">
                            <button
                                disabled={addresses.length === 0 ? true : false}
                                onClick={isConnected ? cloeWebSocket : sendRequest}
                                className="disabled:cursor-not-allowed flex items-center justify-center transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 enabled:hover:ring-orange-200/20 enabled:hover:bg-white/10 py-2 text-white/10 enabled:text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6"
                            >
                                <span>{isConnected ? "Close Websocket" : "Open Websocket"}</span>
                                <CursorArrowRaysIcon className="w-5 ml-1 disabled:text-white/10 disabled:fill-white/10 enabled:text-white enabled:fill-white" />
                            </button>
                        </div>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="my-2">
                            <div className="transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6 h-96 overflow-y-scroll">
                                <div className="grid grid-cols-4 shadow-sm border-0 ring-1 ring-inset ring-white/10 mx-4 my-2 h-10 rounded-md px-2 flex items-center text-center bg-white/5 text-white">
                                    <span>Transaction</span>
                                    <span>Method</span>
                                    <span>Compute Units</span>
                                    <span>Fee (SOL)</span>
                                </div>
                                <div className="h-full">
                                    {notifications.length === 0
                                        ? (
                                            <div className="flex flex-col items-center justify-center text-center gap-y-2 text-white/30 border border-dashed border-white/10 rounded-md w-64 h-3/6 mx-auto translate-y-16 bg-gray-500/5">
                                                <ChatBubbleOvalLeftEllipsisIcon className="w-8 rounded-full" />
                                                Websocket feed will<br /> display here
                                            </div>
                                        )
                                        : (
                                            notifications.reverse().map((notification, index) => (
                                                notification.params &&
                                                <a
                                                    href={`https://xray.helius.xyz/tx/${notification.params.result.signature}?network=mainnet`}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                >
                                                    <div key={index} className="transitiona-colors duration-100 ease-in-out grid grid-cols-4 shadow-sm border-0 ring-1 ring-inset ring-white/10 hover:ring-orange-300/30 hover:bg-white/5 mx-4 my-2 h-10 rounded-md px-2 flex items-center text-center text-white">
                                                        <span>{notification.params.result.signature.slice(0, 3)}..{notification.params.result.signature.slice(-3)}</span>
                                                        <span>{notification.method}</span>
                                                        <span>{notification.params.result.transaction.meta.computeUnitsConsumed}</span>
                                                        <span>{notification.params.result.transaction.meta.fee / 1000000000}</span>
                                                    </div>
                                                </a>
                                            ))
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                    aria-hidden="true"
                >
                    <div
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
            </div>
        </>
    );
};
