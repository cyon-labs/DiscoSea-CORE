const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const metaPlex = require("@metaplex-foundation/mpl-token-metadata");
const { exec } = require('child_process');
const fs = require('fs');
const BufferLayout = require('buffer-layout');
const { sign } = require('crypto');


//generate pda
let str = 'DISCOSEA_CORE';
let seeds = Buffer.from(str, 'utf-8');  // or 'ascii', 'base64', etc. depending on your needs



//programId
let programId = new solanaWeb3.PublicKey('73kphQch9xcKcRqMvKrTHC92m4co37LdFpPHjW5RZuca');

//star atlast mintkey
let star_atlas_mint = new solanaWeb3.PublicKey('GpVqpNdUG8hJvyiNaDFnTnuiQV6EGFueduTBXAiPabWj');
let tools_mint = new solanaWeb3.PublicKey('3y3D6wHa1dfz8VNVcnejLaLL8Ld41shTaAsjKMBgdzBr');
let ammo_mint = new solanaWeb3.PublicKey('9TrKEhszrsMKYHRBuiXxefcQ4Z1WcAjhdGDBqjw7yrY9');
let fuel_mint = new solanaWeb3.PublicKey('9htVnjLQByoQnucf5Bf2C7eDkhDax7rdU3FTo1KX3ewo');
let food_mint = new solanaWeb3.PublicKey('C769DzsozfZ3SmA8PcScM4hEvkyXiFdhKfKfMiyRVjWG');

let user_star_atlas_account = new solanaWeb3.PublicKey('5RWZnLxovGyWsn3KuWbcBnBNpbJ8FH8eLvxztZaZmWzh')
let user_tools_account = new solanaWeb3.PublicKey('F1EC8s5B4G8tQb32EXHFCNVj4tsdJBdTsqYCHUWE8VU4')
let user_ammo_account = new solanaWeb3.PublicKey('Acm5gA1Av9JqJqDjaihqVrjccCex9fcpUeuT8ycDkvER')
let user_fuel_account = new solanaWeb3.PublicKey('G8phS4WPczLMzGJYhsC9TLtb9dx1SmjFJ25Dsi1NzcEM')
let user_food_account = new solanaWeb3.PublicKey('ghQ6qvEHzqQcFRnSxSELYEsJmjYW5kqXGLau9psNAsZ')

let polaris_atlas_account = new solanaWeb3.PublicKey('AiWxzDe6uaFXFUTGmYKRqAtJVmJYQWns3wM3E2xrFGdk')
let polaris_tools_account = new solanaWeb3.PublicKey('51CQRTPagzt8MX6KBAoAyTfDqM9n4NvepjC4fuZ5fgqu')
let polaris_ammo_account = new solanaWeb3.PublicKey('HhZpu7GvaAcU752HeYCApTvjLd9yY66hyRqvbfFxCXd4')
let polaris_fuel_account = new solanaWeb3.PublicKey('Gdghebj3V9deG9FuNfS43kDmzTsL5keHYXeCeReaH1bX')
let polaris_food_account = new solanaWeb3.PublicKey('9RQnXdVethx19HF9eaT688Sux5t6WcQcycLCJgKJGDru')


//mainnet
// ATLAS Account: jxLwkEdnehBrXGFcM6UaRPPrvDzafBnhBeekHJe2whU
// Tools Account: AaQgVD2uJ4Z6yqeZYcFwfsXCfz3zbnuCwcBp8kmyykGv
// Ammo Account: 4oVXqp5BGbFWBmU3dej2jWbvFmFP1d9TWL995FaBkQUX
// Fuel Account: J3wXM9S6skCnhgNgBHRnVDjtFcACZEsshnxoAPYrJBWx
// Food Account: 4PvVDKh83YAAFHGVGBPMJZHfLUFqSuSyfdiwvo4YMyUn



// Provide the path of the JSON file
const jsonFilePath = '/home/jc/.config/solana/id.json';
let rawData = fs.readFileSync(jsonFilePath);
let jsonData = JSON.parse(rawData);
let feePayerAccount = solanaWeb3.Keypair.fromSecretKey(
  Uint8Array.from(jsonData)
);


// Connect to cluster
let connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));


function encodeBase58(buffer) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let string = '';
  let num = BigInt('0x' + buffer.toString('hex'));
  
  const zero = BigInt(0);
  const fiftyEight = BigInt(58);

  while (num > zero) {
    const divmod = divmodBigInt(num, fiftyEight);
    num = divmod[0];
    const remainder = divmod[1];
    string = alphabet[Number(remainder.toString())] + string;
  }

  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] === 0x00) {
      string = alphabet[0] + string;
    } else {
      break;
    }
  }

  return string;
}

function divmodBigInt(a, b) {
  return [a / b, a % b];
}


async function metaMine()
{ 

  // let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddress([seeds], programId);
  // console.log("pda: "+pdaPublicKey.toBase58())


  // var iX = 4;
  // var iXBuffer = Buffer.alloc(1);
  // iXBuffer.writeUint8(iX);

  // var nonceBuffer = Buffer.alloc(1);
  // nonceBuffer.writeUint8(_nonce);
  // var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer]);

  // var liquidate_ammount = 1  
  // var liquidate_ammountBuffer = Buffer.alloc(8);
  // liquidate_ammountBuffer.writeUint8(liquidate_ammount);

  // var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer,liquidate_ammountBuffer]);


  // Create the instruction to send data
  let ixData = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: false }, //user + feePayer
    ],
    programId,
    data: 0,
  };

  let ix = new solanaWeb3.TransactionInstruction(ixData);

  var { blockhash } = await connection.getRecentBlockhash();

  // Create a transaction
  var tx = new solanaWeb3.Transaction({
    feePayer: new solanaWeb3.PublicKey(feePayerAccount.publicKey),
    recentBlockhash: blockhash,
  });

  tx.add(ix)


  tx.sign(feePayerAccount)


  const transactionId = await connection.sendTransaction(tx, [feePayerAccount], { skipPreflight: true });

  console.log(`https://explorer.solana.com/tx/${transactionId}?cluster=devnet`)

  console.log(tx.compileMessage())


}

//this functions allows you to create a token that's owned by a PDA
async function create_PDA_Mints(name,symbol,uri){

  let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddress([seeds], programId);


  // let from_account = next_account_info(accounts_iter)?;
  // let to_account = next_account_info(accounts_iter)?;
  // let owner_account = next_account_info(accounts_iter)?;
  // let token_mint = next_account_info(accounts_iter)?;

  //console.log("HERE IS YOUR PDA:"+pdaPublicKey)

  var iX = 0;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);
  //console.log(iXBuffer);

  var nonceBuffer = Buffer.alloc(1);
  nonceBuffer.writeUint8(_nonce);
  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer]);

  // generate a new keypair to be used for our mint
  const polaris_exp_mintKeypair = solanaWeb3.Keypair.generate();

  //console.log("Mint address:", polaris_exp_mintKeypair.publicKey.toBase58());

  // define the assorted token config settings
  const tokenConfig = {
    // define how many decimals we want our tokens to have
    decimals: 0,
    //
    name: name,
    //
    symbol: symbol,
    //
    uri: uri,

  };

    // create instruction for the token mint account
    const createMintAccountInstruction = solanaWeb3.SystemProgram.createAccount({
      fromPubkey: feePayerAccount.publicKey,
      newAccountPubkey: polaris_exp_mintKeypair.publicKey,
      // the `space` required for a token mint is accessible in the `@solana/spl-token` sdk
      space: splToken.MINT_SIZE,
      // store enough lamports needed for our `space` to be rent exempt
      lamports: await connection.getMinimumBalanceForRentExemption(splToken.MINT_SIZE),
      // tokens are owned by the "token program"
      programId: splToken.TOKEN_PROGRAM_ID,
    });

    // Initialize that account as a Mint
    const initializeMintInstruction = splToken.createInitializeMint2Instruction(
      polaris_exp_mintKeypair.publicKey,
      tokenConfig.decimals,
      // feePayerAccount.publicKey,
      // feePayerAccount.publicKey,
      pdaPublicKey,
      pdaPublicKey,
    );

    //console.log("MetaData Account")
    let METADATA_PROGRAM_ID = new solanaWeb3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
    //console.log(METADATA_PROGRAM_ID)

      // derive the pda address for the Metadata account
  const metadataAccount = solanaWeb3.PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), polaris_exp_mintKeypair.publicKey.toBuffer()],
    METADATA_PROGRAM_ID,
  )[0];

  //console.log("Metadata address:", metadataAccount.toBase58());

  // Create the Metadata account for the Mint
  const createMetadataInstruction = metaPlex.createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataAccount,
      mint: polaris_exp_mintKeypair.publicKey,
      mintAuthority: pdaPublicKey,
      payer: feePayerAccount.publicKey,
      updateAuthority: pdaPublicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          creators: null,
          name: tokenConfig.name,
          symbol: tokenConfig.symbol,
          uri: tokenConfig.uri,
          sellerFeeBasisPoints: 0,
          collection: null,
          uses: null,
        },
        // `collectionDetails` - for non-nft type tokens, normally set to `null` to not have a value set
        collectionDetails: null,
        // should the metadata be updatable?
        isMutable: true,
      },
    },
  );



  var { blockhash } = await connection.getRecentBlockhash();

  // Create a transaction
  var transaction3 = new solanaWeb3.Transaction({
    feePayer: feePayerAccount.publicKey,
    recentBlockhash: blockhash,
  });

  transaction3
  .add(createMintAccountInstruction)
  .add(initializeMintInstruction)

  //metadata update
  var iX = 0;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);

  var dataBuffer = Buffer.concat([iXBuffer, seeds, nonceBuffer,createMetadataInstruction.data]);

  let metaDataInstruction = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: true }, 
      { pubkey: new solanaWeb3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"), isSigner: false, isWritable: false }, 
      { pubkey: new solanaWeb3.PublicKey(metadataAccount.toBase58()), isSigner: false, isWritable: true }, 
      { pubkey: polaris_exp_mintKeypair.publicKey, isSigner: false, isWritable: true }, 
      { pubkey: pdaPublicKey, isSigner: false, isWritable: false }, 
      { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
    ],
    programId,
    data: dataBuffer,
  };


  transaction3.add(metaDataInstruction)


  transaction3.sign(feePayerAccount,polaris_exp_mintKeypair)  



  const transactionId3 = await connection.sendTransaction(transaction3, [feePayerAccount,polaris_exp_mintKeypair], { skipPreflight: false });
  console.log(`https://explorer.solana.com/tx/${transactionId3}?cluster=devnet`)

  return polaris_exp_mintKeypair.publicKey

}

async function create_experience_core()
{


  // derive the pda address for the user
  let [pdaPublicKey, _nonce] = await solanaWeb3.PublicKey.findProgramAddressSync(
    [feePayerAccount.publicKey.toBuffer()],
    programId,
  );


  var iX = 1;
  var iXBuffer = Buffer.alloc(1);
  iXBuffer.writeUint8(iX);

  var dataBuffer = Buffer.concat([iXBuffer]);

  var { blockhash } = await connection.getRecentBlockhash();

  // Create a transaction
  transaction = new solanaWeb3.Transaction({
    feePayer: feePayerAccount.publicKey,
    recentBlockhash: blockhash,
  });

  console.log(feePayerAccount.publicKey)
  console.log(pdaPublicKey)
  console.log(solanaWeb3.SystemProgram.programId)


  // Create the instruction to send data
  let instructionData = {
    keys: [
      { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: false },
      { pubkey: pdaPublicKey, isSigner: false, isWritable: true },
      { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }],
    programId:programId,
    data: dataBuffer,
  };
  let sendDataIx = new solanaWeb3.TransactionInstruction(instructionData);

  // Send the transaction
  transaction
    .add(sendDataIx)


  transaction.sign(feePayerAccount)


  var transactionId = await connection.sendTransaction(transaction, [feePayerAccount], { skipPreflight: true });


  console.log(`https://explorer.solana.com/tx/${transactionId}?cluster=devnet`)

  let txMSG = transaction.compileMessage();
  console.log(txMSG)


  console.log()

  return [pdaPublicKey, _nonce]

}


async function main()
{

  try {
    create_experience_core()

  } catch (error) {
    
  }


  let copperMint = await create_PDA_Mints("Copper Ore","COPPER","https://raw.githubusercontent.com/cyon-labs/DiscoSea-S3/main/resource/mining/copper_ore.json")
  console.log("Copper Mint: "+copperMint);

//   const [copperATA] = await solanaWeb3.PublicKey.findProgramAddress(
//     [feePayerAccount.publicKey.toBuffer(), splToken.TOKEN_PROGRAM_ID.toBuffer(), copperMint.toBuffer()],
//     splToken.ASSOCIATED_TOKEN_PROGRAM_ID
// );

// console.log("ATA calculated: "+copperATA)

// // calculate ATA
// let ata = await splToken.getAssociatedTokenAddress(
//   copperMint, // mint
//   feePayerAccount.publicKey // owner
// );
// console.log(`ATA by library: ${ata.toBase58()}`);

// let associatedTokenInstruction = splToken.createAssociatedTokenAccountInstruction(
//   feePayerAccount.publicKey, // payer
//   ata, // ata
//   feePayerAccount.publicKey, // owner
//   copperMint // mint
// )

// console.log(associatedTokenInstruction)
// console.log(Array.from(associatedTokenInstruction.data))
// console.log("feePayerAccount: "+feePayerAccount.publicKey.toBase58())
// console.log("ata: "+ata.toBase58())
// console.log("copperMint: "+copperMint.toBase58())


// var { blockhash } = await connection.getRecentBlockhash();
// // Create a transaction
// var tx = new solanaWeb3.Transaction({
//   feePayer: new solanaWeb3.PublicKey(feePayerAccount.publicKey),
//   recentBlockhash: blockhash,
// });

// tx.add(associatedTokenInstruction)
// tx.sign(feePayerAccount)

// let rawTransaction = tx.serialize();
// let signature = await connection.sendRawTransaction(rawTransaction,{skipPreflight:true})
// console.log(signature)

// console.log(rawTransaction.slice(0,1))
// console.log(rawTransaction.slice(1,65))
// console.log(rawTransaction.slice(65,69))

// let start = 69
// let stop = start + 32
// console.log(encodeBase58(rawTransaction.slice(start,stop)))

// start = stop
// stop = start + 32
// console.log(encodeBase58(rawTransaction.slice(start,stop)))

// start = stop
// stop = start + 32
// console.log(encodeBase58(rawTransaction.slice(start,stop)))

// start = stop
// stop = start + 32
// console.log(encodeBase58(rawTransaction.slice(start,stop)))

// start = stop
// stop = start + 32
// console.log(encodeBase58(rawTransaction.slice(start,stop)))

// start = stop
// stop = start + 32
// console.log(encodeBase58(rawTransaction.slice(start,stop)))

// start = stop
// stop = start + 32
// console.log(encodeBase58(rawTransaction.slice(start,stop)))

// start = stop
// stop = start + 1
// console.log(rawTransaction.slice(start,stop))

// start = stop
// stop = start + 2
// console.log(rawTransaction.slice(start,stop))


// start = stop
// stop = start + 6
// console.log(rawTransaction.slice(start,stop))

// start = stop
// stop = start + 100
// console.log(rawTransaction.slice(start,stop))

// console.log(rawTransaction.length)








}


console.log("Testing DiscoSea Core")
main()



