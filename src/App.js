import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"
import { Box, Stack, Textarea } from "@chakra-ui/react"
import { Button, ButtonGroup } from "@chakra-ui/react"
import { ThemeProvider } from 'styled-components';

export default function App() {

  const [currAccount, setCurrAccount] = React.useState("");
  const contractAddress = "0xB799EF1B993aEc257C895D07D570fef16F9bcfd1";
  const contractABI = abi.abi;
  const [mining, setMining] = React.useState(false);
  const [allWaves, setAllWaves] = React.useState([]);
  const [totalWaves, setTotalWaves] = React.useState(0);
  let [textValue, setTextValue] = React.useState("")

  let handleInputChange = (e) => {
    let inputValue = e.target.value
    setTextValue(inputValue)
  }

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
              getTotalWaves();

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

  const getTotalWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress,contractABI, signer);
    let totalWaves = await wavePortalContract.getTotalWaves();
    setTotalWaves(totalWaves.toNumber());
  }

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
    const waveTxn = await wavePortalContract.wave(textValue.toString())
    console.log("Mining....", waveTxn.hash)
    setTextValue("");
    setMining(mining => !mining)
    await waveTxn.wait()
    setMining(mining => !mining)
    console.log("Mined the transaction ", waveTxn.hash)
    count = await wavePortalContract.getTotalWaves();
    console.log("Retrieved the total number of waves: ", count.toNumber())
    getAllWaves();
    getTotalWaves();

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


      <Stack direction="column" spacing={5}>

      <Button className="waveButton" colorScheme="teal" variant="outline" onClick={wave} isLoading={mining} loadingText="Mining the Txn">
          Wave at Me 
        </Button>

        {currAccount ? null : (
          <Button classname="connectWallet" colorScheme="teal"  variant="outline" onClick={connectWallet}>
          Connect Wallet
          </Button>
        )}

      <Textarea
        value={textValue}
        onChange={handleInputChange}
        placeholder="Here is a sample placeholder"
        size="sm"
      />

      {allWaves.map((wave, index) => {
          return (
            <Box borderWidth="1px" borderRadius="lg" p="4">
            <div>Address: {wave.address}</div>
            <div>Time: {wave.timestamp.toString()}</div>
            <div>Message:{wave.message}</div>
            </Box>
          )
        })
        }
      </Stack>
    

      </div>   
    </div>
  );
}
