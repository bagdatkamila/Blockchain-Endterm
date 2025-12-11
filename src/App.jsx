import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x25c4A7B85A7B673f91F65899B54E687002C5Baee";

const ABI = [
  {
    "inputs":[{"internalType":"uint8","name":"move","type":"uint8"}],
    "name":"play",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[],
    "name":"getHistory",
    "outputs":[
      {
        "components":[
          {"internalType":"address","name":"player","type":"address"},
          {"internalType":"enum RPS.Move","name":"playerMove","type":"uint8"},
          {"internalType":"enum RPS.Move","name":"contractMove","type":"uint8"},
          {"internalType":"bool","name":"win","type":"bool"}
        ],
        "internalType":"struct RPS.Game[]",
        "name":"",
        "type":"tuple[]"
      }
    ],
    "stateMutability":"view",
    "type":"function"
  }
];

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const MOVES = ["Rock", "Paper", "Scissors"];

  // ---------------- CONNECT WALLET ----------------
  async function connect() {
    if (!window.ethereum) {
      alert("Install MetaMask!");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    setContract(c);
  }

  // ---------------- PLAY ----------------
  async function play(move) {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.play(move);
      await tx.wait();
      await loadHistory();
    } catch (err) {
      console.error(err);
      alert("Transaction error (see console)");
    }
    setLoading(false);
  }

  // ---------------- LOAD HISTORY ----------------
  async function loadHistory() {
    if (!contract) return;
    try {
      const h = await contract.getHistory();
      setHistory(h);
    } catch (err) {
      console.log("history error", err);
    }
  }

  useEffect(() => {
    if (contract) loadHistory();
  }, [contract]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Rock-Paper-Scissors DApp</h1>

      {!account ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <h2>Choose your move:</h2>

      <div style={{ display: "flex", gap: 10 }}>
        {MOVES.map((m, i) => (
          <button key={i} onClick={() => play(i)} disabled={loading}>
            {m}
          </button>
        ))}
      </div>

      <h2>Game History</h2>

      <div>
        {history.length === 0 && <p>No games yet</p>}

        {history.map((g, i) => (
          <div key={i} style={{
            marginBottom: 10,
            padding: 10,
            border: "1px solid gray",
            borderRadius: 6
          }}>
            <p><b>Player:</b> {g.player}</p>
            <p><b>Your move:</b> {MOVES[g.playerMove]}</p>
            <p><b>Contract move:</b> {MOVES[g.contractMove]}</p>
            <p><b>Result:</b> {g.win ? " You Win!" : " You Lose"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
