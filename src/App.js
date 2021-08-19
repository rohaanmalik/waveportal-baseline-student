import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

export default function App() {

  const [currAccount, setCurrAccount] = React.useState("");
  const contractAddress = "0xAd43b153953d46d9bF4A7A55231c983D968E8EBE";
  const contractABI = abi.abi;
  const [mining, setMining] = React.useState(false);

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum){
      console.log("make sure you have metamask")
      return;
    } else {
      console.log(" We have an ethereum object", ethereum)
    }

      // basically we are trying to get the account info
    ethereum.request({ method: 'eth_accounts'})
          .then(accounts => {
            if (accounts.length !== 0){
              const account = accounts[0];
              console.log("Found an authorized account:", account)
              setCurrAccount(account);
            } else {
              console.log("No authorised account found")
            }
          })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum){
      alert("Get Metamask wallet")
    }
    ethereum.request({method: 'eth_requestAccounts'})
    .then(accounts => {
      console.log("ethereum wallet connected: ", accounts[0])
      setCurrAccount(accounts[0])
    })
    .catch(err => console.log(err))
  }

  React.useEffect(() => {
      checkIfWalletIsConnected();
    }, [])
    
  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress,contractABI, signer);

    let count = await wavePortalContract.getTotalWaves();
    console.log("Total number of waves are: ", count.toNumber())

    // waiting for the wave transaction
    const waveTxn = await wavePortalContract.wave()
    console.log("Mining....", waveTxn.hash)
    setMining(mining => !mining)
    await waveTxn.wait()
    setMining(mining => !mining)
    console.log("Mined the transaction ", waveTxn.hash)

    count = await wavePortalContract.getTotalWaves();
    console.log("Retrieved the total number of waves: ", count.toNumber())

    }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Rohaan Malik. Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {mining ? (<div> the transaction is mining
        </div>): null }
        {currAccount ? null : (
          <button classname="waveButton" onClick={connectWallet}>
          Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
