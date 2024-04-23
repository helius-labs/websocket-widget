import { useCallback, useEffect, useState, useRef, Fragment } from "react";
import { PublicKey } from "@solana/web3.js";
import { ClockIcon, ArrowRightCircleIcon, CubeTransparentIcon, ChatBubbleOvalLeftEllipsisIcon, XCircleIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { CursorArrowRaysIcon, SunIcon, MoonIcon } from "@heroicons/react/20/solid";
import { Switch, Dialog, Transition, Popover } from "@headlessui/react";
import Link from "next/link";

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
    const [countdown, setCountdown] = useState(30);
    const [showNotif, setShowNotif] = useState(false);
    const [theme, setTheme] = useState('dark');

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
        }
    };

    const cloeWebSocket = useCallback(() => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
            setIsConnected(false);
            setCountdown(30);
        }
    }, []);

    const sendRequest = useCallback(() => {
        // derive which accounts are required and not
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
                ws.current.send(JSON.stringify(request));
                setIsConnected(true);
            };
        } else {
            ws.current.send(JSON.stringify(request));
            setIsConnected(true);
        }

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("MESSAGE", message);
            setNotifications((prevNotifications) => [...prevNotifications, message]);
        };
    }, [apiKey, addresses, commitmentState, details, encoding]);
    
    useEffect(() => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        setTheme(currentTheme);
        document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    }, []);
    
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    useEffect(() => {
        let countdownInterval;

        if (ws.current) {
            ws.current.onclose = () => {
                setIsConnected(false);
                setCountdown(30); // Reset countdown on WebSocket close
            };
        }

        if (isConnected && ws.current) {
            countdownInterval = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown === 1) {
                        clearInterval(countdownInterval);
                        cloeWebSocket(); // Close WebSocket when countdown reaches zero
                        setShowNotif(true); // Notify the user of the timeout
                        return 30; // Reset countdown
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
        }

        return () => {
            clearInterval(countdownInterval); // Clean up interval on component unmount
        };
    }, [isConnected]);

    return (
        <>
            <div className="relative isolate">
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

                <Transition.Root show={showNotif} as={Fragment}>
                    <Dialog as="div" className="relative z-10" onClose={setShowNotif}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm transition-opacity" />
                        </Transition.Child>

                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                >
                                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white/70 backdrop-blur-sm px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                                        <div>
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                                <ClockIcon className="h-6 w-6 text-black" aria-hidden="true" />
                                            </div>
                                            <div className="mt-3 text-center sm:mt-5">
                                                <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-black">
                                                    Websocket Timeout
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="text-sm text-black">
                                                        Your websocket connection has timed out. This is done to preserve your credits.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-5 sm:mt-6">
                                            <button
                                                type="button"
                                                className="disabled:cursor-not-allowed flex items-center justify-center transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-black/80 enabled:hover:ring-orange-200/20 enabled:hover:bg-black/50 py-2 text-gray-800 dark:text-gray-200/10 enabled:text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  sm:text-sm sm:leading-6"
                                                onClick={() => setShowNotif(false)}
                                            >
                                                Return
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>

                <nav className="flex items-center justify-between p-10">
                    <Link
                        href="https://www.helius.dev/"
                        className=""
                    >
                        <svg width="46" height="46" viewBox="0 0 494 490" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M243.508 0.638046C242.84 0.944397 241.092 3.29308 239.55 5.79493C235.028 13.5558 183.787 101.733 183.787 101.835C183.787 101.938 186.151 101.07 189.029 99.9463C226.085 85.7011 268.537 86.0585 306.518 101.019C308.008 101.631 309.139 101.938 309.036 101.733C308.882 101.478 295.931 79.1656 280.204 52.0537C264.477 24.9418 250.909 2.16979 250.035 1.35286C248.39 -0.127823 245.718 -0.434174 243.508 0.638046Z" fill="white" />
                            <path d="M312.869 23.047C310.724 28.5147 310.213 31.5065 310.213 38.8312C310.213 47.9097 311.847 53.9448 316.137 61.4242C318.742 65.8087 326.81 73.7008 331.406 76.3315C347.033 85.1521 366.439 83.4499 380.075 72.1018C385.335 67.7173 392.024 58.5872 390.85 57.4008C390.595 57.1429 373.231 48.6318 352.242 38.4185L314.094 19.9005L312.869 23.047Z" fill="white" />
                            <path d="M138.925 39.3137C110.249 53.0083 100.621 57.8116 100.673 58.4248C100.828 59.9066 104.141 64.8632 107.299 68.2358C112.733 74.1122 120.239 78.5578 128.572 80.7551C134.525 82.3391 143.997 82.3391 150.053 80.7551C175.002 74.2144 188.719 48.4604 179.972 24.495C179.299 22.6043 178.471 21.1224 178.005 21.0713C177.591 21.0202 159.992 29.2472 138.925 39.3137Z" fill="white" />
                            <path d="M49.6192 93.9157C46.5304 96.9948 45.5009 93.813 68.8209 153.035C80.5066 182.799 90.2876 207.638 90.4935 208.202C90.8024 208.972 91.5746 207.176 93.6338 201.018C106.195 163.042 130.596 132.61 165.138 111.929C167.455 110.543 168.948 109.414 168.484 109.414C168.021 109.414 142.333 105.616 111.343 100.946C80.3522 96.2763 54.1493 92.4788 53.0683 92.4788C51.5754 92.4788 50.7002 92.838 49.6192 93.9157Z" fill="white" />
                            <path d="M382.111 100.927C351.065 105.716 325.538 109.63 325.434 109.682C325.331 109.682 327.755 111.227 330.849 113.081C342.556 120.085 356.377 131.518 365.969 142.127C382.111 159.997 392.992 178.846 400.367 201.506L402.997 209.54L424.399 155.156C438.994 118.025 445.852 99.9482 445.956 98.3517C446.11 96.2917 445.956 95.7252 444.666 94.2832C443.48 92.9957 442.707 92.5837 440.902 92.4807C439.612 92.3777 413.363 96.1372 382.111 100.927Z" fill="white" />
                            <path d="M13.5416 199.637C5.20686 236.272 4.18418 241.344 4.84892 241.805C5.30913 242.113 9.09302 242.318 13.3371 242.318C22.3878 242.318 26.5296 241.344 33.4838 237.655C44.3241 231.916 51.2272 223.411 54.8065 211.473C55.9826 207.579 56.1871 205.991 56.1871 200.047C56.2383 191.593 55.4713 187.955 51.943 180.833C47.8523 172.431 41.6652 165.924 33.9951 161.876C30.3135 159.929 25.2513 158.033 23.8707 158.033C23.2059 158.033 21.2628 165.77 13.5416 199.637Z" fill="white" />
                            <path d="M467.868 158.995C453.986 163.915 443.974 174.778 439.949 189.28C438.659 193.944 438.659 205.063 439.949 210.034C443.768 224.946 455.534 236.886 470.552 241.139C473.854 242.113 475.867 242.318 481.802 242.318C485.776 242.318 489.646 242.164 490.369 241.959L491.659 241.6L482.112 199.785C471.326 152.897 472.874 157.253 467.868 158.995Z" fill="white" />
                            <path d="M406.361 228.103C409.909 251.656 407.389 278.288 399.471 301.635C394.226 316.978 385.691 333.501 376.95 345.098C375.408 347.15 374.379 348.844 374.637 348.844C375.511 348.844 490.068 313.489 491.302 312.822C493.615 311.641 494.747 307.588 493.461 305.227C493.05 304.509 416.644 233.389 406.772 224.563L405.692 223.588L406.361 228.103Z" fill="white" />
                            <path d="M44.6452 264.657C17.5801 289.831 1.22818 305.43 0.664327 306.562C-0.10457 308.107 -0.15583 308.776 0.254249 310.423C0.561807 311.504 1.22818 312.843 1.79204 313.306C2.71472 314.13 118.511 350.321 119.382 350.012C119.587 349.961 118.254 347.85 116.409 345.327C100.467 323.654 90.369 297.347 86.832 268.312C85.8581 260.332 86.0119 239.276 87.0883 231.297C87.6009 227.796 87.9085 224.862 87.8572 224.759C87.7547 224.656 68.3273 242.623 44.6452 264.657Z" fill="white" />
                            <path d="M124.393 358.626C124.598 360.159 126.699 387.598 129.056 419.635C131.465 451.672 133.566 478.293 133.719 478.753C134.232 480.439 136.948 482.227 139.049 482.227C141.355 482.227 135.974 485.753 201.21 441.402C224.527 425.562 243.539 412.533 243.488 412.43C243.385 412.379 240.003 412.073 235.904 411.766C213.663 410.029 195.624 405.226 176.202 395.875C159.035 387.598 144.481 376.97 130.44 362.408L124.085 355.867L124.393 358.626Z" fill="white" />
                            <path d="M360.982 363.648C346.655 378.127 331.506 388.845 313.738 396.986C294.943 405.643 279.075 409.559 254.066 411.672L249.341 412.084L300.437 447.071C339.876 474.02 351.996 482.059 353.485 482.265C355.642 482.522 358.363 481.028 359.185 479.225C359.596 478.297 369.045 356.022 368.737 355.867C368.737 355.867 365.245 359.371 360.982 363.648Z" fill="white" />
                            <path d="M52.8754 361.218C47.1932 362.499 41.5109 365.009 37.3 368.135L35.1184 369.723L61.2973 402.872C75.7059 421.164 87.7299 436.278 87.9328 436.585C88.5924 437.252 94.0717 431.667 96.9636 427.312C108.48 410.045 105.994 386.477 91.1291 372.234C82.7579 364.241 73.1184 360.449 61.551 360.552C58.304 360.603 54.3975 360.911 52.8754 361.218Z" fill="white" />
                            <path d="M429.597 361.045C420.023 362.885 410.812 368.201 404.861 375.305C391.095 391.661 391.043 414.508 404.705 430.864C406.361 432.858 408.431 434.953 409.259 435.567L410.863 436.64L428.924 414.304C462.199 373.107 464.735 369.938 464.735 369.632C464.735 368.967 458.059 364.981 454.54 363.549C452.625 362.732 449.21 361.709 447.036 361.3C442.741 360.432 433.478 360.278 429.597 361.045Z" fill="white" />
                            <path d="M237.515 447.894C227.027 450.181 217.259 456.788 211.347 465.581C206.977 472.087 204.715 478.237 204.047 485.556L203.687 489.318H246.974H290.313L289.953 485.861C287.948 467.208 275.096 452.417 257.153 448.148C252.167 446.979 242.399 446.826 237.515 447.894Z" fill="white" />
                        </svg>
                    </Link>
                    <div className="flex flex-row space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="flex justify-center items-center ring-1 ring-white/50 hover:ring-orange-300/50 rounded-full h-8 px-4 transition-color duration-200 ease-in-out hover:bg-white/10"
                            aria-label="Toggle Dark Mode"
                            >
                            {theme === 'light' ? (
                                <>
                                <SunIcon className="h-5 w-5 text-gray-800 mr-2" />
                                <span className="text-sm font-medium text-gray-800">LIGHT</span>
                                </>
                            ) : (
                                <>
                                <MoonIcon className="h-5 w-5 text-gray-200 mr-2" />
                                <span className="text-sm font-medium text-gray-200">DARK</span>
                                </>
                            )}
                        </button>
                        <Link
                        href="https://github.com/helius-labs/websocket-widget"
                        className="flex justify-center items-center ring-1 ring-white/50 hover:ring-orange-300/50 rounded-full h-8 px-4 transition-color duration-200 ease-in-out hover:bg-white/10"
                    >
                        View Source
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="100"
                            height="100"
                            viewBox="0 0 30 30"
                            style={{ fill: "#ffffff" }}
                            className="ml-2 w-6 hidden lg:block"
                        >
                            <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
                        </svg>
                    </Link>
                    </div>
                </nav>

                <div className="mx-auto max-w-2xl pt-32 pb-10">
                    <div className="hidden sm:flex sm:justify-center">
                        <a
                            href="https://docs.helius.dev/webhooks-and-websockets/websockets"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex justify-center"
                        >
                            <div className="relative flex items-center rounded-full text-opacity-70 group-hover:text-opacity-100 border border-white border-opacity-20 bg-opacity-25 px-4 py-1 text-xs leading-6 text-gray-800 dark:text-gray-200 transition-all duration-200 ease-in-out hover:bg-black/10 group-hover:border-opacity-60 group-hover:bg-opacity-75 sm:px-3 sm:text-sm">
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
                        <h1 className="text-4xl font-bold tracking-tight text-gray-800 dark:text-gray-200 sm:text-6xl">
                            Go Faster With<br /><span className="bg-gradient-to-r from-[#e3572e] via-orange-300 to-[#e3572e] inline-block text-transparent bg-clip-text">Websockets</span>
                        </h1>
                        <p className="text-lg leading-8 text-gray-800 dark:text-gray-200 mt-8">
                            Websockets keep a persistent connection open,<br />enabling real-time data exchange. Test the transactionSubscribe method on Mainnet below.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                    <div className="sm:col-span-6 sm:col-start-4">
                        <label className="w-fit block text-sm font-medium leading-6 text-gray-800 dark:text-gray-200 cursor-pointer duration-200 ease-in-out transition-smooth">
                            <a
                                className="flex items-center w-fit"
                                href="https://dev.helius.xyz/dashboard/app"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Helius API Key
                                <ArrowTopRightOnSquareIcon className="w-4 ml-1 enabled:text-gray-800 dark:text-gray-200 enabled:fill-white" />
                            </a>
                        </label>
                        <div className="mt-2">
                            <input
                                value={apiKey}
                                onChange={event => setApiKey(event.target.value)}
                                className="overflow-x-scroll px-2 block w-full rounded-md border-0 bg-white/5 py-2 text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-4 sm:col-start-4">
                        <label className="block text-sm font-medium leading-6 text-gray-800 dark:text-gray-200">
                            Solana Address
                        </label>
                        <div className="mt-2">
                            <input
                                value={address}
                                onChange={event => setAddress(event.target.value)}
                                className="overflow-x-scroll px-2 block w-full rounded-md border-0 bg-white/5 py-2 text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2 flex items-center">
                        <Switch.Group as="div" className="flex items-center mt-auto pb-2">
                            <Switch
                                checked={isRequired}
                                onChange={setIsRequired}
                                className={classNames(
                                    isRequired ? 'bg-orange-300/40' : 'bg-black/10 dark:bg-white/10',
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
                                <span className="font-medium text-gray-800 dark:text-gray-200">Is Required</span>{' '}
                            </Switch.Label>
                        </Switch.Group>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="mt-2">
                            <button
                                onClick={addAddress}
                                disabled={address.length === 0 || apiKey.length === 0}
                                className="disabled:cursor-not-allowed flex items-center justify-center transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 enabled:hover:ring-orange-200/20 enabled:hover:bg-white/10 py-2 text-gray-800 dark:text-gray-200/10 enabled:text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6"
                            >
                                <span>Add Address</span>
                                <CursorArrowRaysIcon className="w-5 ml-1 enabled:text-gray-800 dark:text-gray-200 enabled:fill-white" />
                            </button>
                        </div>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="my-2">
                            <div className="transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 py-2 text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6 h-52 overflow-y-scroll">
                                {addresses.length === 0
                                    ? (
                                        <div className="flex flex-col items-center justify-center text-center gap-y-2 text-gray-800 dark:text-gray-200/30 border border-dashed border-white/10 rounded-md w-64 h-5/6 mx-auto translate-y-4 bg-gray-500/5">
                                            <CubeTransparentIcon className="w-8" />
                                            Enter an address<br /> to get started
                                        </div>
                                    )
                                    : (
                                        addresses.map(item => (
                                            <div className="text-center shadow-sm border-0 ring-1 ring-inset ring-black/10 dark:ring-white/10  mx-4 my-2 h-10 rounded-md px-2 flex items-center justify-between text-gray-800 dark:text-gray-200/50">
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
                        <label className="block text-sm font-medium leading-6 text-gray-800 dark:text-gray-200">
                            Commitment
                        </label>
                        <div className="mt-2">
                            <select
                                onChange={(e) => setCommitmentState(e.target.value)}
                                className="transition-all duration-200 ease-in-out cursor-pointer block w-full rounded-md border-0 bg-white/5 hover:ring-orange-200/20 hover:bg-white/10 py-2 px-1 text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm"
                            >
                                <option value="confirmed" className="text-gray-800">Confirmed</option>
                                <option value="finalized" className="text-gray-800">Finalized</option>
                                <option value="processed" className="text-gray-800">Processed</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium leading-6 text-gray-800 dark:text-gray-200">
                            Details
                        </label>
                        <div className="mt-2">
                            <select
                                onChange={(e) => setDetails(e.target.value)}
                                className="transition-all duration-200 ease-in-out cursor-pointer block w-full rounded-md border-0 bg-white/5 hover:ring-orange-200/20 hover:bg-white/10 py-2 px-1 text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm"
                            >
                                <option value="full" className="text-gray-800">Full</option>
                                <option value="signatures" className="text-gray-800">Signatures</option>
                                <option value="accounts" className="text-gray-800">Accounts</option>
                                <option value="none" className="text-gray-800">None</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium leading-6 text-gray-800 dark:text-gray-200">
                            Encoding
                        </label>
                        <div className="mt-2">
                            <select
                                onChange={(e) => setEncoding(e.target.value)}
                                className="transition-all duration-200 ease-in-out cursor-pointer block w-full rounded-md border-0 bg-white/5 hover:ring-orange-200/20 hover:bg-white/10 py-2 px-1 text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm"
                            >
                                <option value="base58" className="text-gray-800">base58</option>
                                <option value="base64" className="text-gray-800">base64</option>
                                <option value="base64+zstd" className="text-gray-800">base64+zstd</option>
                                <option value="jsonParsed" className="text-gray-800">jsonParsed</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="mt-2">
                            <button
                                disabled={addresses.length === 0 ? true : false}
                                onClick={isConnected ? cloeWebSocket : sendRequest}
                                className="disabled:cursor-not-allowed flex items-center justify-center transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 enabled:hover:ring-orange-200/20 enabled:hover:bg-white/10 py-2 text-gray-800 dark:text-gray-200/10 enabled:text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6"
                            >
                                <span>{isConnected ? "Close Websocket" : "Open Websocket"}</span>
                                <CursorArrowRaysIcon className="w-5 ml-1 enabled:text-gray-800 dark:text-gray-200 enabled:fill-white" />
                            </button>
                        </div>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="my-2">
                            <div className="transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 py-2 text-gray-800 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6 h-96 overflow-y-scroll overflow-x-hidden">
                                <div className="grid grid-cols-3 shadow-sm border-0 ring-1 ring-inset ring-black/10 dark:ring-white/10  mx-4 my-2 h-10 rounded-md px-2 flex items-center text-center bg-white/5 text-gray-800 dark:text-gray-200">
                                    <span>Transaction</span>
                                    <span>Compute Units</span>
                                    <span>Fee (SOL)</span>
                                </div>
                                <div className="h-full">
                                    {notifications.length === 0
                                        ? (
                                            <div className="flex flex-col items-center justify-center text-center gap-y-2 text-gray-800 dark:text-gray-200/30 border border-dashed border-white/10 rounded-md w-64 h-3/6 mx-auto translate-y-16 bg-gray-500/5">
                                                <ChatBubbleOvalLeftEllipsisIcon className="w-8" />
                                                Websocket feed will<br /> display here
                                            </div>
                                        )
                                        : (
                                            notifications.reverse().map((notification, index) => (
                                                notification.params &&
                                                <Popover key={index} className="relative">
                                                    <Popover.Button className="w-full">
                                                        <div className="transitiona-colors duration-100 ease-in-out grid grid-cols-3 shadow-sm border-0 ring-1 ring-inset ring-black/10 dark:ring-white/10  hover:ring-orange-300/30 hover:bg-white/5 mx-4 my-2 h-10 rounded-md px-2 flex items-center text-center text-gray-800 dark:text-gray-200">
                                                            <span>{notification.params.result.signature.slice(0, 3)}..{notification.params.result.signature.slice(-3)}</span>
                                                            <span>{notification.params.result.transaction.meta.computeUnitsConsumed}</span>
                                                            <span>{notification.params.result.transaction.meta.fee / 1000000000}</span>
                                                        </div>
                                                    </Popover.Button>

                                                    <Transition
                                                        as={Fragment}
                                                        enter="transition ease-out duration-200"
                                                        enterFrom="opacity-0 translate-y-1"
                                                        enterTo="opacity-100 translate-y-0"
                                                        leave="transition ease-in duration-150"
                                                        leaveFrom="opacity-100 translate-y-0"
                                                        leaveTo="opacity-0 translate-y-1"
                                                    >
                                                        <Popover.Panel className="absolute left-1/2 z-10 mt-1 flex w-screen max-w-max -translate-x-1/2 px-4">
                                                            <div className="w-screen max-w-md lg:max-w-xl flex-auto overflow-hidden rounded-lg bg-gray-400/90 backdrop-blur-sm text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                                                                <div className="grid grid-cols-1 gap-x-6 gap-y-1 p-4 lg:grid-cols-2">

                                                                    <div className="group relative flex gap-x-6 rounded-lg p-4">
                                                                        <div>
                                                                            <p className="font-semibold text-gray-900">
                                                                                Method
                                                                                <span className="absolute inset-0" />
                                                                            </p>
                                                                            <p className="mt-1 text-gray-700">{notification.method}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="group relative flex gap-x-6 rounded-lg p-4">
                                                                        <div>
                                                                            <p className="font-semibold text-gray-900">
                                                                                Transaction Version
                                                                                <span className="absolute inset-0" />
                                                                            </p>
                                                                            <p className="mt-1 text-gray-700">{notification.params.result.transaction.version}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="group relative flex gap-x-6 rounded-lg p-4">
                                                                        <div>
                                                                            <p className="font-semibold text-gray-900">
                                                                                Subscription
                                                                                <span className="absolute inset-0" />
                                                                            </p>
                                                                            <p className="mt-1 text-gray-700">{notification.params.subscription}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="group relative flex gap-x-6 rounded-lg p-4">
                                                                        <div>
                                                                            <p className="font-semibold text-gray-900">
                                                                                Encoding
                                                                                <span className="absolute inset-0" />
                                                                            </p>
                                                                            <p className="mt-1 text-gray-700">{notification.params.result.transaction.transaction[1]}</p>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                                <div className="px-8 py-6 bg-gray-500/50 hover:bg-gray-500/80 transition-color duration-200 ease-in-out">
                                                                    <a
                                                                        href={`https://xray.helius.xyz/tx/${notification.params.result.signature}?network=mainnet`}
                                                                        target="_blank"
                                                                        rel="noopener noreferer"
                                                                    >
                                                                        <div className="flex items-center gap-x-3">
                                                                            <h3 className="text-sm font-semibold leading-6 text-gray-900">Transaction</h3>
                                                                            <p className="rounded-full bg-orange-300/50 ring-1 ring-orange-400/50 px-2.5 py-1 text-xs font-semibold text-black">View</p>
                                                                        </div>
                                                                        <p className="mt-2 text-sm leading-6 text-gray-700">
                                                                            {notification.params.result.signature.slice(0, 38)}...
                                                                        </p>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </Popover.Panel>
                                                    </Transition>
                                                </Popover>
                                            ))
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="my-2">
                            <p className="text-gray-800 dark:text-gray-200/50 text-xs font-light text-center">
                                Helius websockets consume 1 credit per event push. This app is for testing and demo purposes.
                                In order to preserve your credits, the websocket stream will automatically close after <span className="underline underline-offset-2">{countdown} seconds</span>.
                            </p>
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
