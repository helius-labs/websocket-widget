// components/TransactionDisplay.js
export default function TransactionDisplay({ data }) {
    if (data.params) {
        console.log(data);
        return (
            <div>
                <div className="w-full h-8 flex flex-row">
                    <div className="w-1/2 bg-orange-500 border-b-2 border-black">
                        <p className="text-sm text-center">{data.method}</p>
                    </div>
                    <div className="w-1/4 bg-orange-400 border-b-2 border-black">
                        <p className="text-xs text-center">CU: {data.params.result.transaction.meta.computeUnitsConsumed}</p>
                    </div>
                    <div className="w-1/4 bg-orange-400 border-b-2 border-black">
                        <p className="text-xs text-center">Fee: {data.params.result.transaction.meta.fee / 1000000000} SOL</p>
                    </div>
                </div>
                <div className="w-full px-2 py-2 h-100 bg-orange-500">

                    <a className='text-white underline' href={`https://xray.helius.xyz/tx/${data.params.result.signature}?network=mainnet`}>View Transaction</a>
                </div>
            </div>
        );

    }
}
