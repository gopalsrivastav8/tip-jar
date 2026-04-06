import { useMemo, useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'
import { fetchTips } from './helius'

const RECIPIENT = '4MWFrMMxYyik6uhcqURym8o8fcX71L2rQHA4TQRLfLyB'

const s = {
  page: { minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' },
  card: { background: '#161616', border: '1px solid #303030', borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '380px' },
  initials: { width: '56px', height: '56px', borderRadius: '50%', background: '#222', border: '1px solid #383838', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600', color: '#ccc', margin: '0 auto 20px', letterSpacing: '0.05em' },
  name: { textAlign: 'center', fontSize: '22px', fontWeight: '600', color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.02em' },
  handle: { textAlign: 'center', fontSize: '13px', color: '#666', marginBottom: '10px' },
  totalWrap: { textAlign: 'center', marginBottom: '32px' },
  totalNum: { fontSize: '32px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.04em' },
  totalLabel: { fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '4px' },
  label: { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' },
  amounts: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' },
  amt: (sel) => ({
    background: sel ? '#1c1c30' : '#1e1e1e',
    border: sel ? '1px solid #6666dd' : '1px solid #303030',
    borderRadius: '12px', padding: '13px 4px', textAlign: 'center',
    fontSize: '14px', fontWeight: '500',
    color: sel ? '#aaaaff' : '#ccc',
    cursor: 'pointer',
  }),
  input: { width: '100%', background: '#1e1e1e', border: '1px solid #303030', borderRadius: '12px', padding: '13px 16px', fontSize: '14px', color: '#fff', outline: 'none', marginBottom: '24px', boxSizing: 'border-box' },
  primaryBtn: { width: '100%', background: '#ffffff', color: '#080808', border: 'none', borderRadius: '12px', padding: '15px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px', letterSpacing: '-0.01em' },
  ghostBtn: { width: '100%', background: 'transparent', color: '#777', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '12px', fontSize: '13px', cursor: 'pointer', marginBottom: '32px' },
  divider: { height: '1px', background: '#222', marginBottom: '24px' },
  feedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  feedLabel: { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' },
  liveTag: { fontSize: '10px', color: '#4caf7d', border: '1px solid #1e3a2a', borderRadius: '99px', padding: '3px 10px', letterSpacing: '0.05em' },
  tipRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  tipLeft: { display: 'flex', flexDirection: 'column', gap: '3px' },
  tipFrom: { fontSize: '14px', color: '#ccc' },
  tipTime: { fontSize: '11px', color: '#555' },
  tipAmt: { fontSize: '15px', color: '#4caf7d', fontWeight: '600' },
  status: (ok) => ({ textAlign: 'center', fontSize: '13px', color: ok ? '#4caf7d' : '#999', marginBottom: '12px' }),
  walletRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', fontSize: '12px', color: '#666', gap: '6px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', background: '#4caf7d', flexShrink: 0 },
  emptyTips: { textAlign: 'center', fontSize: '14px', color: '#555', padding: '24px 0' },
  loadingTips: { textAlign: 'center', fontSize: '14px', color: '#555', padding: '24px 0' },
}

function TipJar() {
  const { publicKey, sendTransaction, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [selected, setSelected] = useState(0.5)
  const [custom, setCustom] = useState('')
  const [status, setStatus] = useState('')
  const [tips, setTips] = useState([])
  const [loadingTips, setLoadingTips] = useState(true)
  const [total, setTotal] = useState('0.00')

  async function loadTips() {
    try {
      const data = await fetchTips(RECIPIENT)
      setTips(data)
      const sum = data.reduce((acc, t) => acc + parseFloat(t.amount), 0)
      setTotal(sum.toFixed(2))
    } catch (e) {
      console.error('Failed to load tips', e)
    } finally {
      setLoadingTips(false)
    }
  }

  useEffect(() => {
    loadTips()
    const interval = setInterval(loadTips, 15000)
    return () => clearInterval(interval)
  }, [])

  async function sendTip() {
    const amount = custom ? parseFloat(custom) : selected
    if (!amount || amount <= 0) return setStatus('Enter a valid amount')
    try {
      setStatus('Sending...')
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(RECIPIENT),
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        })
      )
      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      setStatus('Tip sent!')
      setCustom('')
      setTimeout(loadTips, 3000)
    } catch (e) {
      setStatus('Failed — ' + e.message)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.initials}>GS</div>
        <div style={s.name}>Gopal Srivastav</div>
        <div style={s.handle}>4MWF...fLyB</div>

        <div style={s.totalWrap}>
          <div style={s.totalNum}>{total} SOL</div>
          <div style={s.totalLabel}>total received</div>
        </div>

        {connected && (
          <div style={s.walletRow}>
            <div style={s.dot} />
            {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
          </div>
        )}

        <div style={s.label}>Amount</div>
        <div style={s.amounts}>
          {[0.1, 0.5, 1].map(a => (
            <div key={a} style={s.amt(selected === a && !custom)}
              onClick={() => { setSelected(a); setCustom('') }}>
              {a} SOL
            </div>
          ))}
        </div>

        <div style={s.label}>Custom amount</div>
        <input style={s.input} type="number" placeholder="0.00 SOL"
          value={custom} onChange={e => setCustom(e.target.value)} />

        {status && <div style={s.status(status === 'Tip sent!')}>{status}</div>}

        {connected ? (
          <>
            <button style={s.primaryBtn} onClick={sendTip}>Send tip</button>
            <button style={s.ghostBtn} onClick={disconnect}>Disconnect wallet</button>
          </>
        ) : (
          <button style={s.primaryBtn} onClick={() => setVisible(true)}>Connect wallet</button>
        )}

        <div style={s.divider} />

        <div style={s.feedHeader}>
          <div style={s.feedLabel}>Recent tips</div>
          <div style={s.liveTag}>live</div>
        </div>

        {loadingTips ? (
          <div style={s.loadingTips}>Loading...</div>
        ) : tips.length === 0 ? (
          <div style={s.emptyTips}>No tips yet — be the first</div>
        ) : (
          tips.slice(0, 5).map((t, i) => (
            <div key={i} style={s.tipRow}>
              <div style={s.tipLeft}>
                <span style={s.tipFrom}>{t.from}</span>
                <span style={s.tipTime}>{t.time}</span>
              </div>
              <span style={s.tipAmt}>+{t.amount} SOL</span>
            </div>
          ))
        )}

      </div>
    </div>
  )
}

function App() {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TipJar />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App