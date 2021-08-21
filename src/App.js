import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"
import { CircleToBlockLoading } from 'react-loadingg';

export default function App() {

  const [currAccount, setCurrAccount] = React.useState("");
  const contractAddress = "0xB799EF1B993aEc257C895D07D570fef16F9bcfd1";
  const contractABI = abi.abi;
  const [mining, setMining] = React.useState(false);
  const [allWaves, setAllWaves] = React.useState([]);

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
              getAllWaves();
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

  const getAllWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress,contractABI, signer);
    let waves = await wavePortalContract.getAllWaves();

    let wavesCleaned = []
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave._address,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    console.log(wavesCleaned);
    setAllWaves(wavesCleaned)

  }
    
  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress,contractABI, signer);

    let count = await wavePortalContract.getTotalWaves();
    console.log("Total number of waves are: ", count.toNumber())

    // waiting for the wave transaction
    const waveTxn = await wavePortalContract.wave("this is a wave")
    console.log("Mining....", waveTxn.hash)
    setMining(mining => !mining)
    await waveTxn.wait()
    setMining(mining => !mining)
    console.log("Mined the transaction ", waveTxn.hash)
    count = await wavePortalContract.getTotalWaves();
    console.log("Retrieved the total number of waves: ", count.toNumber())
    getAllWaves();
    
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

        {mining ? (<CircleToBlockLoading />): null }

        {currAccount ? null : (
          <button classname="waveButton" onClick={connectWallet}>
          Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div style={{backgroundColor:"OldLace", marginTop: "16px", padding: "8px"}}>
            <div>Address: {wave.address}</div>
            <div>Time: {wave.timestamp.toString()}</div>
            <div>Message:{wave.message}</div>
            </div>
          )
        })
        }

      </div>
    </div>
  );
}
