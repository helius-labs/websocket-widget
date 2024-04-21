import { useCallback, useEffect, useState, useRef } from "react";
import TransactionNotificationCard from "@/components/TransactionNotification";
import { PublicKey } from "@solana/web3.js";

export default function Home() {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [address, setAddress] = useState('');
  const [isRequired, setIsRequired] = useState(null);
  const [accountsRequired, setAccountsRequired] = useState([]);
  const [accountsIncluded, setAccountsIncluded] = useState([]);
  const [commitmentState, setCommitmentState] = useState('confirmed');
  const [details, setDetails] = useState('full');
  const [encoding, setEncoding] = useState('base58');

  // Function to validate Solana address
  const isValidSolanaAddress = (address) => {
    try {
      const pubkey = new PublicKey(address);
      return pubkey.toBase58().length === 43;
    } catch (error) {
      return false;
    }
  };

  // Handle adding addresses
  const addAddress = () => {
    if (address && isValidSolanaAddress(address)) {
      if (isRequired) {
        setAccountsRequired([...accountsRequired, address]);
      } else {
        setAccountsIncluded([ ...accountsIncluded, address]);
      }
      setAddress('');
      setIsRequired(null);
    } else {
      alert('Invalid Solana address');
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
      ws.current = new WebSocket('wss://atlas-mainnet.helius-rpc.com?api-key=');
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
  }, [accountsIncluded, accountsRequired, commitmentState, details, encoding]);

  useEffect(() => {
    if (ws.current) {
      ws.current.onclose = () => {setIsConnected(false); console.log('WebSocket is closed');};
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
                            href="https://github.com/owenventer/galleria"
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
                            Websockets keep a persistent connection open,<br />enabling real-time data exchange.
                        </p>
                    </div>
                </div>


                {/* FORM */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                    <div className="sm:col-span-4 sm:col-start-4">
                        <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-white">
                            Solana Address
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="street-address"
                                id="street-address"
                                autoComplete="street-address"
                                className="block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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
                            <button className="transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 hover:ring-orange-200/20 hover:bg-white/10 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6">
                                Add Address
                            </button>
                        </div>
                    </div>

                    <div className="sm:col-span-2 sm:col-start-4">
                        <label htmlFor="city" className="block text-sm font-medium leading-6 text-white">
                            Commitment
                        </label>
                        <div className="mt-2">
                            <select
                                id="country"
                                name="country"
                                autoComplete="country-name"
                                className="block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-1"
                            >
                                <option>Confirmed</option>
                                <option>Finalized</option>
                                <option>Processed</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="region" className="block text-sm font-medium leading-6 text-white">
                            Details
                        </label>
                        <div className="mt-2">
                            <select
                                id="country"
                                name="country"
                                autoComplete="country-name"
                                className="block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-1"
                            >
                                <option>Full</option>
                                <option>Signatures</option>
                                <option>Accounts</option>
                                <option>None</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-white">
                            Encoding
                        </label>
                        <div className="mt-2">
                            <select
                                id="country"
                                name="country"
                                autoComplete="country-name"
                                className="block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-1"
                            >
                                <option>base58</option>
                                <option>base64</option>
                                <option>base64 + zstd</option>
                                <option>json</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-6 sm:col-start-4">
                        <div className="mt-2">
                            <button className="transition-color duration-200 ease-in-out block w-full rounded-md border-0 bg-white/5 hover:ring-orange-200/20 hover:bg-white/10 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-300/40 sm:text-sm sm:leading-6">
                                Open Websocket
                            </button>
                        </div>
                    </div>
                </div>


                {/* <div className="flex items-center justify-center gap-x-6">
          <form
            // onSubmit={handleSubmit}
            className="relative isolate flex h-11 w-[500px] items-center pr-1.5 md:w-[450px]"
          >
            <label htmlFor={id} className="sr-only">
              Account Address
            </label>
            <input
              required
              type="walletAddress"
              autoComplete="walletAddress"
              name="walletAddress"
              id={id}
              placeholder="Solana Wallet Address"
              className="peer w-0 flex-auto bg-transparent px-4 py-2.5 text-base text-white placeholder:text-gray-400 focus:outline-none sm:text-[0.8125rem]/6"
            // value={inputValue}
            // onChange={handleInputChange}
            />

            <button
              className="border border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10 flex-none items-center justify-center rounded-md py-0.5 px-1.5 text-[0.8125rem]/6 font-semibold text-white font-light transition-all duration-200 ease-in-out disabled:cursor-not-allowed"
            >
              Add Address
            </button>

            <div className="absolute inset-0 -z-10 rounded-lg ring-offset-0 transition duration-200 ease-in-out peer-focus:ring-1 peer-focus:ring-primary" />
            <div className="bg-white/2.5 absolute inset-0 -z-10 rounded-lg ring-1 ring-white/50" />
          </form>
        </div> */}

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




    {/* <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-black gap-4">
      <div className="w-full lg:w-1/2 flex flex-col gap-8">
        <p className="text-4xl font-black text-orange-500">Transaction Subscribe</p>
        <p className="text-xl text-bold text-orange-500">Stream transactions from the following accounts in real-time.</p>
        <div className="w-full flex flex-col items-end space-y-4">
          <input
            className="w-full p-2 rounded text-black"
            placeholder="Enter address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="flex flex-row items-center space-x-2">
            <label className="text-orange-500">Required:</label>
            <div className="flex items-center space-x-1">
              <input
                type="radio"
                name="required"
                checked={isRequired === true}
                onChange={() => setIsRequired(true)}
                className="text-orange-500"
              />
              <label htmlFor="yes" className="text-orange-500 cursor-pointer">Yes</label>
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="radio"
                name="required"
                checked={isRequired === false}
                onChange={() => setIsRequired(false)}
                className="text-orange-500"
              />
              <label htmlFor="no" className="text-orange-500 cursor-pointer">No</label>
            </div>
            <button
              className="w-24 bg-orange-500 text-white p-2 rounded shadow hover:bg-orange-600 transition-colors"
              onClick={addAddress}
            >
              Add
            </button>
          </div>
        </div>
        <div className="w-full flex flex-row justify-between">
            <div className="w-1/2 border-orange-500 border-b-2 py-2">
              <p className="text-orange-500 border-orange-500 border-b py-2 font-bold">Accounts Required</p>
              <ul className="list-disc pl-5 text-xs py-1">
                {accountsRequired.map((acc, index) => (
                  <li key={index} className="text-orange-500">{acc}</li>
                ))}
              </ul>
            </div>
            <div className="w-1/2 border-orange-500 border-b-2 py-2">
              <p className="text-orange-500 border-orange-500 border-b py-2 font-bold">Accounts Included</p>
              <ul className="list-disc pl-5 text-xs py-1">
                {accountsIncluded.map((acc, index) => (
                  <li key={index} className="text-orange-500">{acc}</li>
                ))}
              </ul>
            </div>
          </div>
      </div>
      <div className="flex flex-row gap-4">
      <div className="flex justify-start items-center space-x-4">
        <label htmlFor="commitment" className="text-orange-500">Commitment:</label>
        <select
          id="commitment"
          value={commitmentState}
          onChange={(e) => setCommitmentState(e.target.value)}
          className="bg-black text-white border border-orange-500 rounded p-2 shadow outline-none hover:border-orange-600 focus:border-orange-600 transition-colors"
        >
          <option value="confirmed" className="text-white">Confirmed</option>
          <option value="finalized" className="text-white">Finalized</option>
          <option value="processed" className="text-white">Processed</option>
        </select>
      </div>
      <div className="flex justify-start items-center space-x-4">
        <label htmlFor="commitment" className="text-orange-500">Details:</label>
        <select
          id="commitment"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="bg-black text-white border border-orange-500 rounded p-2 shadow outline-none hover:border-orange-600 focus:border-orange-600 transition-colors"
        >
          <option value="full" className="text-white">Full</option>
          <option value="signatures" className="text-white">Signatures</option>
          <option value="accounts" className="text-white">Accounts</option>
          <option value="none" className="text-white">None</option>
        </select>
      </div>
      <div className="flex justify-start items-center space-x-4">
        <label htmlFor="commitment" className="text-orange-500">Encoding:</label>
        <select
          id="commitment"
          value={encoding}
          onChange={(e) => setEncoding(e.target.value)}
          className="bg-black text-white border border-orange-500 rounded p-2 shadow outline-none hover:border-orange-600 focus:border-orange-600 transition-colors"
        >
          <option value="base58" className="text-white">base58</option>
          <option value="base64" className="text-white">base64</option>
          <option value="base64+zstd" className="text-white">base64+zstd</option>
          <option value="jsonParsed" className="text-white">jsonParsed</option>
        </select>
      </div>
      </div>
      {!isConnected ? (
        <button
          className="w-48 bg-orange-500 text-white p-2 rounded shadow hover:bg-orange-600 transition-colors"
          onClick={sendRequest}
        >
          Open WebSocket
        </button>
      ) : (
        <button
          className="w-48 bg-red-500 text-white p-2 rounded shadow hover:bg-red-600 transition-colors"
         onClick={cloeWebSocket}>
          Close WebSocket
        </button>
      )}
      <div className="w-full lg:w-1/2 h-full flex flex-col gap-8">
      {[...notifications].reverse().map((notification, index) => {
        return (
          <TransactionNotificationCard key={index} data={notification} />
        );
      })}
      </div>
    </main> */}
        </>

  );
}
