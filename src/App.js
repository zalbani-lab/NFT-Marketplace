import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json'
import './styles/App.css';

// Constants
const CONTRACT_ADDRESS = "0x174136d234a73B32D25a2A42860DFe4fF748Ee79";
const OPENSEA_LINK = `https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS}`;
const TOTAL_MINT_COUNT = 50;

const App = () => {

  /*
  * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMinting, setIsMinting] = useState("");
  
  /*
  * Gotta make sure this is async.
  */
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
    }

    /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    /*
    * User can have multiple authorized accounts, we grab the first one if its there!
    */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
    checkIfIsConnectedToTheRightChain(ethereum);
    setupEventListener();
  }

  const checkIfIsConnectedToTheRightChain = async (ethereum) => {
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Goerli test network
    const goerliChainId = "0x5"; 
    if (chainId !== goerliChainId) {
	    alert("You are not connected to the Goerli Test Network!");
    }
  }
  
  /*
  * Implement your connectWallet method here
  */
    const connectWallet = async () => {
      try {
        const { ethereum } = window;
  
        if (!ethereum) {
          alert("Get MetaMask!");
          return;
        }
  
        /*
        * Fancy method to request access to account.
        */
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  
        /*
        * Boom! This should print out public address once we authorize Metamask.
        */
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
        setupEventListener() 
      } catch (error) {
        console.log(error);
      }
    }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
    
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);
        console.log("Mining...please wait.")
        await nftTxn.wait();
          
        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);
        setIsMinting(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getNumberOfMintedNFT = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
    
        let numberOfMintedNFT = await connectedContract.getTotalNFTsMintedSoFar();
        console.table(numberOfMintedNFT);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
   
  const renderMintButton = () => (
   <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
     Mint NFT
   </button>
  );

  const getNumberOfNFTMintedButton = () => (
    <button onClick={getNumberOfMintedNFT} className="cta-button connect-wallet-button">
      Get number of Mint NFT
    </button>
   );

   const mintingGif = () => (
    <React.Fragment>
      <img src="./mining.gif" alt=''/>
      <p>Mining in process</p>
    </React.Fragment>
   );

  useEffect(() => {
    checkIfWalletIsConnected();
  })

  return (
     <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection {TOTAL_MINT_COUNT}</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <a href={OPENSEA_LINK} target='_blank' rel='noreferrer'>See on open sea</a>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintButton()}
          {getNumberOfNFTMintedButton()}
          {isMinting === true ? mintingGif() : null}
          
        </div>
      </div>
    </div>
  );
};

export default App;