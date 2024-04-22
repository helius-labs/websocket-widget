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
  }

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
  }  

  const cloeWebSocket = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setIsConnected(false);
      console.log('WebSocket is closed.');
    }
  })
  
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
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-black gap-4">
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
    </main>
  );
}
