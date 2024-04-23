# Websocket Widgets

The Websocket Widget repository is a frontend playground for Helius Geyser Enhanced Websockets.

## Documentation

Hosted frontend link coming soon.

Explore the Helius Geyser Enhanced Websockets through the [Helius Websockets Documentation](https://docs.helius.dev/webhooks-and-websockets/websockets).

## Prerequisites

To run the frontend locally, ensure these requirements are met:

- Node.js 14.x or higher
- npm or yarn
- A Helius API Key 

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/HeliusLabs/websocket-widgets.git
cd websocket-widgets/app
npm install
```

## Websocket Example

Here’s a simple example of how you can open the `transactionSubscribe` Helius Geyser Enhanced Websocket using Javascript:

```javascript
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

    const wsUrl = `wss://atlas-mainnet.helius-rpc.com?api-key=${apiKey}`;
    ws.current = new WebSocket(wsUrl);
    ws.current.onopen = () => {
        console.log('WebSocket is open');
        ws.current.send(JSON.stringify(request));
    };
```
## Contributing
Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.
