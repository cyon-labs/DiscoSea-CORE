use solana_program::{
    account_info::{ next_account_info, AccountInfo },
    entrypoint,
    entrypoint::ProgramResult,
    program::{ self, invoke, invoke_signed },
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
    msg,
};

use solana_program::instruction::Instruction;
use solana_program::instruction::AccountMeta;
use borsh::{ BorshDeserialize, BorshSerialize };
use spl_token::state::Account as TokenAccount;
use solana_program::program_pack::Pack;
use std::convert::TryInto;

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let account = next_account_info(account_info_iter)?;

    msg!("Hello, World!");

    match instruction_data[0] {
        0 => {
            msg!("Instruction: 0");
            update_meta_data(_program_id, accounts, instruction_data);
        }
        1 => {
            msg!("Instruction: 1");
            create_pda_instruction(_program_id, accounts, instruction_data);
        }
        2 => {
            msg!("Instruction: 2");
            scan_resource(_program_id, accounts, instruction_data);
        }
        // Add more instructions as needed...
        _ => {
            return Err(ProgramError::InvalidInstructionData);
        }
    }

    Ok(())
}

pub fn update_meta_data(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    msg!("Updating Meta Data");

    let accounts_iter = &mut accounts.iter();
    // Payer account
    let feepayer_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in feepayer_account: {:?}", feepayer_account);

    let metadata_program = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in metadata_program: {:?}", metadata_program);

    let metadata_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in metadata_account: {:?}", metadata_account);

    let reward_mint_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in reward_mint_account: {:?}", reward_mint_account);

    let pda_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in pda_account: {:?}", pda_account);

    let system_program_account = next_account_info(accounts_iter)?;
    // msg!("Accounts passed in system_program_account: {:?}", system_program_account);

    // let metaDataInstruction = {
    //     keys: [
    //       { pubkey: feePayerAccount.publicKey, isSigner: true, isWritable: true },
    //       { pubkey: new solanaWeb3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"), isSigner: false, isWritable: false },
    //       { pubkey: new solanaWeb3.PublicKey(metadataAccount.toBase58()), isSigner: false, isWritable: true },
    //       { pubkey: mintKepair.publicKey, isSigner: false, isWritable: true },
    //       { pubkey: pdaPublicKey, isSigner: false, isWritable: false },
    //       { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }, //systemProgram
    //     ],
    //     programId,
    //     data: dataBuffer,
    //   };

    let seed = &instruction_data[1..14];
    let bump = instruction_data[14];
    let meta_data_data = &instruction_data[15..instruction_data.len()];

    // Checking if passed PDA and expected PDA are equal
    let signers_seeds: &[&[u8]] = &[seed, &[bump]];

    let instruction = Instruction {
        program_id: *metadata_program.key,
        accounts: vec![
            AccountMeta::new(*metadata_account.key, false),
            AccountMeta::new_readonly(*reward_mint_account.key, false),
            AccountMeta::new_readonly(*pda_account.key, true),
            AccountMeta::new(*feepayer_account.key, true),
            AccountMeta::new_readonly(*pda_account.key, false),
            AccountMeta::new_readonly(*system_program_account.key, false)
        ],
        data: meta_data_data.to_vec(),
    };

    invoke_signed(
        &instruction,
        &[
            metadata_account.clone(),
            reward_mint_account.clone(),
            pda_account.clone(),
            feepayer_account.clone(),
            system_program_account.clone(),
        ],
        &[signers_seeds]
    )?;

    Ok(())
}

fn create_pda_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    msg!("Creating PDA");

    const ACCOUNT_DATA_LEN: usize = 25;

    let accounts_iter = &mut accounts.iter();
    // Getting required accounts
    let funding_account = next_account_info(accounts_iter)?;
    let pda_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Assuming feePayer is a PublicKey
    let fee_payer_bytes = funding_account.key.to_bytes();

    let (pda, bump_seed) = Pubkey::find_program_address(&[&fee_payer_bytes], program_id);

    let bump = &[bump_seed];
    let signers_seeds: &[&[u8]; 2] = &[&fee_payer_bytes, bump];

    // Assessing required lamports and creating transaction instruction
    let lamports_required = Rent::get()?.minimum_balance(ACCOUNT_DATA_LEN);
    let create_pda_account_ix = system_instruction::create_account(
        &funding_account.key,
        &pda_account.key,
        lamports_required,
        ACCOUNT_DATA_LEN.try_into().unwrap(),
        &program_id
    );
    // Invoking the instruction but with PDAs as additional signer

    msg!("create PDA Instruction {:?}", create_pda_account_ix);

    invoke_signed(
        &create_pda_account_ix,
        &[funding_account.clone(), pda_account.clone(), system_program.clone()],
        &[signers_seeds]
    )?;

    // Assuming you already have mutable access to account data
    let mut data = &mut *pda_account.data.borrow_mut();

    // Check if the PDA is already initialized
    if data[0] != 1 {
        // Set the PDA as initiated
        data[0] = 1; // Here 1 can indicate that PDA is initialized

        // Set HP (assuming HP is the first skill)
        let hp: u32 = 1154;
        data[1..5].copy_from_slice(&hp.to_le_bytes());

        // Set remaining bytes to 0
        for i in 5..data.len() {
            data[i] = 0;
        }
    }

    Ok(())
}

pub fn scan_resource(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    msg!("Sending ATLAS");
    let accounts_iter = &mut accounts.iter();

    //accounts
    let payer_account = next_account_info(accounts_iter)?;
    let pda_account = next_account_info(accounts_iter)?;

    let resource_mint = next_account_info(accounts_iter)?;
    let user_resource_account = next_account_info(accounts_iter)?;
    let pda_resource_account = next_account_info(accounts_iter)?;

    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;

    let resource_experience = next_account_info(accounts_iter)?;

    let seed = &instruction_data[2..15];
    let bump = instruction_data[15];

    // Checking if passed PDA and expected PDA are equal
    let signers_seeds: &[&[u8]; 2] = &[seed, &[bump]];

    //----------------------------//
    //                            //
    //       Resource Mint        //
    //                            //
    //----------------------------//
    let mint_to_ix = spl_token::instruction::mint_to(
        token_program.key,
        resource_mint.key,
        user_resource_account.key, //to
        pda_resource_account.key, //minter
        &[],
        1
    )?;

    invoke_signed(
        &mint_to_ix,
        &[
            resource_mint.clone(),
            user_resource_account.clone(),
            pda_resource_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds]
    )?;

    Ok(())
}
