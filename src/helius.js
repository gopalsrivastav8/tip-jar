const KEY = import.meta.env.VITE_HELIUS_KEY

export async function fetchTips(address) {
  const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${KEY}&limit=20`
  const res = await fetch(url)
  const data = await res.json()

  return data
    .filter(tx =>
      tx.type === 'TRANSFER' &&
      tx.nativeTransfers?.some(t => t.toUserAccount === address)
    )
    .map(tx => {
      const transfer = tx.nativeTransfers.find(t => t.toUserAccount === address)
      return {
        from: transfer.fromUserAccount.slice(0, 6) + '...' + transfer.fromUserAccount.slice(-4),
        amount: (transfer.amount / 1_000_000_000).toFixed(2),
        time: new Date(tx.timestamp * 1000).toLocaleTimeString(),
      }
    })
}   