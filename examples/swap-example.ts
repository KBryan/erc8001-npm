/**
 * ERC-8001 AtomicSwap Example
 * 
 * Complete example showing how to use the SDK with viem
 * 
 * Usage:
 *   AGENT_ONE_PK=0x... PLAYER_ONE_PK=0x... npx ts-node examples/swap-example.ts
 */

import { createWalletClient, createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import {
  AtomicSwapClient,
  DEPLOYED_CONTRACTS,
  ERC20_ABI,
  ATOMIC_SWAP_ABI,
  formatTokenAmount,
  getStatusName,
  CoordinationStatus,
} from '../src/ts';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const NETWORK = 'base-sepolia' as const;
const contracts = DEPLOYED_CONTRACTS[NETWORK];

// Load private keys from environment
const AGENT_ONE_PK = process.env.AGENT_ONE_PK as `0x${string}`;
const PLAYER_ONE_PK = process.env.PLAYER_ONE_PK as `0x${string}`;

if (!AGENT_ONE_PK || !PLAYER_ONE_PK) {
  console.error('Set AGENT_ONE_PK and PLAYER_ONE_PK environment variables');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════════════

// Create accounts
const aliceAccount = privateKeyToAccount(AGENT_ONE_PK);
const bobAccount = privateKeyToAccount(PLAYER_ONE_PK);

console.log('Alice:', aliceAccount.address);
console.log('Bob:', bobAccount.address);

// Create public client for reading
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// Create wallet clients for signing
const aliceWallet = createWalletClient({
  account: aliceAccount,
  chain: baseSepolia,
  transport: http(),
});

const bobWallet = createWalletClient({
  account: bobAccount,
  chain: baseSepolia,
  transport: http(),
});

// Create SDK clients
const aliceClient = AtomicSwapClient.fromViem(aliceWallet, NETWORK);
const bobClient = AtomicSwapClient.fromViem(bobWallet, NETWORK);

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

async function getBalances(address: `0x${string}`) {
  const [usdc, weth] = await Promise.all([
    publicClient.readContract({
      address: contracts.mockUSDC,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    }),
    publicClient.readContract({
      address: contracts.mockWETH,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    }),
  ]);
  
  return {
    usdc: formatUnits(usdc as bigint, 6),
    weth: formatUnits(weth as bigint, 18),
  };
}

async function getSwapStatus(intentHash: `0x${string}`) {
  const status = await publicClient.readContract({
    address: contracts.atomicSwap,
    abi: ATOMIC_SWAP_ABI,
    functionName: 'getCoordinationStatus',
    args: [intentHash],
  });
  return status as number;
}

async function printBalances() {
  const aliceBalances = await getBalances(aliceAccount.address);
  const bobBalances = await getBalances(bobAccount.address);
  
  console.log('\n📊 Balances:');
  console.log(`  Alice: ${aliceBalances.usdc} USDC, ${aliceBalances.weth} WETH`);
  console.log(`  Bob:   ${bobBalances.usdc} USDC, ${bobBalances.weth} WETH`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FLOW
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n🚀 ERC-8001 AtomicSwap Demo\n');
  console.log('Contracts:');
  console.log(`  AtomicSwap: ${contracts.atomicSwap}`);
  console.log(`  Mock USDC:  ${contracts.mockUSDC}`);
  console.log(`  Mock WETH:  ${contracts.mockWETH}`);
  
  await printBalances();

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Alice proposes swap (100 USDC for 0.1 WETH)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n📝 Step 1: Alice proposes swap...');
  
  const proposal = await aliceClient.createSwapProposal({
    offerToken: contracts.mockUSDC,
    offerAmount: parseUnits('100', 6),    // 100 USDC
    wantToken: contracts.mockWETH,
    wantAmount: parseUnits('0.1', 18),    // 0.1 WETH
    counterparty: bobAccount.address,
    expirySeconds: 3600,
  });
  
  console.log(`  Intent Hash: ${proposal.intentHash}`);
  console.log(`  Signature: ${proposal.signature.slice(0, 20)}...`);
  
  // In production, you'd submit this to the chain:
  // const tx = await aliceWallet.writeContract({
  //   address: contracts.atomicSwap,
  //   abi: ATOMIC_SWAP_ABI,
  //   functionName: 'proposeCoordination',
  //   args: [proposal.intent, proposal.payload, proposal.signature],
  // });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: Bob accepts the swap
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n✅ Step 2: Bob accepts swap...');
  
  const { attestation, signature: acceptSig } = await bobClient.createAcceptance(
    proposal.intentHash,
    3600
  );
  
  console.log(`  Attestation signed by: ${attestation.agentId}`);
  console.log(`  Signature: ${acceptSig.slice(0, 20)}...`);
  
  // In production:
  // const tx = await bobWallet.writeContract({
  //   address: contracts.atomicSwap,
  //   abi: ATOMIC_SWAP_ABI,
  //   functionName: 'acceptCoordination',
  //   args: [proposal.intentHash, attestation, acceptSig],
  // });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: Execute the swap
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n⚡ Step 3: Execute swap...');
  
  // Anyone can execute once it's Ready
  // const tx = await aliceWallet.writeContract({
  //   address: contracts.atomicSwap,
  //   abi: ATOMIC_SWAP_ABI,
  //   functionName: 'executeCoordination',
  //   args: [proposal.intentHash, proposal.payload, '0x'],
  // });
  
  console.log('  (Simulated - uncomment to execute on chain)');
  
  console.log('\n✨ Done!\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════════

main().catch(console.error);
