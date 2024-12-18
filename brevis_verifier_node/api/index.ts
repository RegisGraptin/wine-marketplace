require('dotenv').config()

const express = require("express");
const ethers = require('ethers');

const brevis = require('brevis-sdk-typescript');

// import { Brevis, ProofRequest, Prover } from '';


const WINE_ABI = require("./Wine.json");

const SERVER_KEY = process.env.SERVER_KEY;
const SERVER_RPC = process.env.SERVER_RPC;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;


const prover = new brevis.Prover('localhost:33247');
const BrevisNetwork = new brevis.Brevis('appsdkv3.brevis.network:443');

const proofReq = new brevis.ProofRequest();



const app = express();
const port = 3010;

app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});



app.get("/events", async (request, response) => {

  try {
      let provider = new ethers.JsonRpcProvider(SERVER_RPC, );
      let signer = new ethers.Wallet(SERVER_KEY, provider);

      let contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          WINE_ABI.abi,
          signer
      );

      // Retrieve create 
      // const eventSignature = 'BuyBottle(address,uint256)';
      // const eventTopic = ethers.utils.id(eventSignature);
      const eventTopic = "0x822cd8cda2d2b3feb2339ab2e79a3b336b792f0a912867901e963e928afd3be8";
  

      const currentBlock = await provider.getBlockNumber();

      let rawLogs = await provider.getLogs({
          address: CONTRACT_ADDRESS,
          topics: [eventTopic],
          fromBlock: currentBlock - 10000, 
          toBlock: currentBlock
      });

      proofReq.setCustomInput({UserAddr: brevis.asUint248("0x39E9617bE6003897a04B6Eb1512e3b40A53E785A")});

      // console.log(rawLogs);
      for (let index = 0; index < rawLogs.length; index++) {
        const element = rawLogs[index];  
        console.log(element);
      
        // Add the proof
        proofReq.addReceipt(
            new brevis.ReceiptData({
                tx_hash: element.transactionHash,
                fields: [
                    new brevis.Field({
                        log_pos: 0,
                        is_topic: true,
                        field_index: 0,
                    }),
                    new brevis.Field({
                        log_pos: 0,
                        is_topic: true,
                        field_index: 1,
                    }),
                ],
            }),
            index,
        );

      }

      
      const proofRes = await prover.prove(proofReq);

      console.log('proof', proofRes.proof);

      // console.log(proofRes);

      // FIXME:: Filtering ? Do I need to use an address to filter the proof generation ??
      // FIXME:: How the input works ? 
      try {
        const brevisRes = await BrevisNetwork.submit(
          proofReq, 
          proofRes, 
          11155111, 
          11155111, 
          0, 
          "", 
          ""  // contract 0x5314D73A0A122Ea9b7f4747cdC0a47eB998CC7DD
        ); 

        console.log('brevis res', brevisRes);

        await BrevisNetwork.wait(brevisRes.queryKey, 11155111);
    } catch (err) {
        console.error(err);
    }      

  } catch (error) {
      console.log(error);
      request.status(500).send('Error when fetching data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});