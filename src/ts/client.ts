/**
 * AtomicSwap Client
 * High-level API for interacting with the AtomicSwap contract
 */

import type { Address, Hex } from './types';
import { CoordinationStatus } from './types';
import { ERC8001Signer, fromViemWallet, fromEthersSigner, type TypedDataSigner } from './signer';
import { buildERC8001Domain } from './eip712';
import { hashAgentIntent } from './utils';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const DEPLOYED_CONTRACTS = {
  'base-sepolia': {
    atomicSwap: '0xD25FaF692736b74A674c8052F904b5C77f9cb2Ed' as Address,
    mockUSDC: '0x17abd6d0355cB2B933C014133B14245412ca00B6' as Address,
    mockWETH: '0xddFaC73904FE867B5526510E695826f4968A2357' as Address,
    chainId: 84532,
  },
} as const;

export type SupportedNetwork = keyof typeof DEPLOYED_CONTRACTS;

export const SWAP_TYPE = '0x5a42c26733c3f3a8cf8860be88bf8c098214ed9cb08b2ae651708151e16e0e68' as Hex;
export const VERSION_HASH = '0x4c23426613a5dc69e08fbd2787e6210aa679d4522e95a89d4dd88c4fd13a2283' as Hex;

// ═══════════════════════════════════════════════════════════════════════════════
// ABIs
// ═══════════════════════════════════════════════════════════════════════════════

export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
] as const;

export const ATOMIC_SWAP_ABI = [
  // Read functions
  'function getCoordinationStatus(bytes32 intentHash) view returns (uint8)',
  'function getAgentNonce(address agentId) view returns (uint64)',
  'function getAcceptanceCount(bytes32 intentHash) view returns (uint256)',
  'function hasAccepted(bytes32 intentHash, address agentId) view returns (bool)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  'function SWAP_TYPE() view returns (bytes32)',
  
  // Write functions
  'function proposeCoordination(tuple(bytes32 payloadHash, uint64 expiry, uint64 nonce, address agentId, bytes32 coordinationType, uint256 coordinationValue, address[] participants) intent, tuple(bytes32 version, bytes32 coordinationType, address[] participants, bytes coordinationData) payload, bytes signature) returns (bytes32)',
  'function acceptCoordination(bytes32 intentHash, tuple(bytes32 intentHash, uint64 expiry, address agentId) attestation, bytes signature)',
  'function executeCoordination(bytes32 intentHash, tuple(bytes32 version, bytes32 coordinationType, address[] participants, bytes coordinationData) payload, bytes executionData)',
  'function cancelCoordination(bytes32 intentHash)',
  
  // Helper functions
  'function encodeSwapTerms(address tokenA, uint256 amountA, address tokenB, uint256 amountB) pure returns (bytes)',
  
  // Events
  'event CoordinationProposed(bytes32 indexed intentHash, address indexed proposer, bytes32 indexed coordinationType, address[] participants, uint64 expiry)',
  'event CoordinationAccepted(bytes32 indexed intentHash, address indexed acceptor)',
  'event CoordinationExecuted(bytes32 indexed intentHash, address indexed executor)',
  'event CoordinationCancelled(bytes32 indexed intentHash)',
  'event SwapExecuted(bytes32 indexed intentHash, address partyA, address partyB, address tokenA, uint256 amountA, address tokenB, uint256 amountB)',
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SwapTerms {
  tokenA: Address;
  amountA: bigint;
  tokenB: Address;
  amountB: bigint;
}

export interface ProposeSwapParams {
  /** Token you're offering */
  offerToken: Address;
  /** Amount you're offering (in wei/smallest unit) */
  offerAmount: bigint;
  /** Token you want */
  wantToken: Address;
  /** Amount you want (in wei/smallest unit) */
  wantAmount: bigint;
  /** Address of counterparty */
  counterparty: Address;
  /** Expiry in seconds from now (default: 3600) */
  expirySeconds?: number;
}

export interface SwapProposal {
  intentHash: Hex;
  intent: {
    payloadHash: Hex;
    expiry: bigint;
    nonce: bigint;
    agentId: Address;
    coordinationType: Hex;
    coordinationValue: bigint;
    participants: Address[];
  };
  payload: {
    version: Hex;
    coordinationType: Hex;
    participants: Address[];
    coordinationData: Hex;
  };
  signature: Hex;
  terms: SwapTerms;
}

export interface SwapStatus {
  status: CoordinationStatus;
  statusName: string;
  acceptanceCount: number;
  canExecute: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATOMIC SWAP CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * High-level client for AtomicSwap operations
 * 
 * @example
 * ```typescript
 * import { AtomicSwapClient } from '@erc8001/sdk';
 * import { createWalletClient, http } from 'viem';
 * import { privateKeyToAccount } from 'viem/accounts';
 * import { baseSepolia } from 'viem/chains';
 * 
 * const account = privateKeyToAccount('0x...');
 * const wallet = createWalletClient({ account, chain: baseSepolia, transport: http() });
 * 
 * const client = AtomicSwapClient.fromViem(wallet, 'base-sepolia');
 * 
 * // Propose a swap
 * const proposal = await client.proposeSwap({
 *   offerToken: USDC_ADDRESS,
 *   offerAmount: 100_000000n, // 100 USDC
 *   wantToken: WETH_ADDRESS,
 *   wantAmount: 100_000000_000000000n, // 0.1 WETH
 *   counterparty: '0x...'
 * });
 * 
 * console.log('Intent Hash:', proposal.intentHash);
 * ```
 */
export class AtomicSwapClient {
  private readonly signer: ERC8001Signer;
  private readonly contracts: typeof DEPLOYED_CONTRACTS[SupportedNetwork];
  private readonly typedDataSigner: TypedDataSigner;
  
  // Store proposals for execution
  private proposals = new Map<Hex, SwapProposal>();

  constructor(
    typedDataSigner: TypedDataSigner,
    network: SupportedNetwork,
    contractAddress?: Address
  ) {
    this.contracts = DEPLOYED_CONTRACTS[network];
    this.typedDataSigner = typedDataSigner;
    
    const domain = buildERC8001Domain({
      name: 'AtomicSwap',
      version: '1',
      chainId: this.contracts.chainId,
      verifyingContract: contractAddress ?? this.contracts.atomicSwap,
    });
    
    this.signer = new ERC8001Signer(typedDataSigner, domain);
  }

  /**
   * Create from a viem WalletClient
   */
  static fromViem(
    walletClient: Parameters<typeof fromViemWallet>[0],
    network: SupportedNetwork,
    contractAddress?: Address
  ): AtomicSwapClient {
    return new AtomicSwapClient(fromViemWallet(walletClient), network, contractAddress);
  }

  /**
   * Create from an ethers Signer
   */
  static fromEthers(
    ethersSigner: Parameters<typeof fromEthersSigner>[0],
    network: SupportedNetwork,
    contractAddress?: Address
  ): AtomicSwapClient {
    return new AtomicSwapClient(fromEthersSigner(ethersSigner), network, contractAddress);
  }

  /**
   * Get the connected address
   */
  async getAddress(): Promise<Address> {
    return this.typedDataSigner.getAddress();
  }

  /**
   * Get contract addresses
   */
  getContracts(): typeof DEPLOYED_CONTRACTS[SupportedNetwork] {
    return this.contracts;
  }

  /**
   * Propose a new swap
   * 
   * @returns Signed proposal ready for submission
   */
  async createSwapProposal(params: ProposeSwapParams): Promise<SwapProposal> {
    const address = await this.getAddress();
    const expirySeconds = params.expirySeconds ?? 3600;
    
    const participants: Address[] = [address, params.counterparty];
    
    // Encode swap terms (matches contract's encodeSwapTerms)
    const coordinationData = encodeSwapTerms(
      params.offerToken,
      params.offerAmount,
      params.wantToken,
      params.wantAmount
    );
    
    const nonce = 1n; // Should fetch from contract in production
    
    // Use the signer to create intent and payload with proper hashing
    const { intent, payload, signature } = await this.signer.signIntent({
      coordinationType: SWAP_TYPE,
      participants,
      coordinationData,
      nonce,
      expirySeconds,
    });
    
    // Compute intent hash using the utility function
    const intentHash = hashAgentIntent(intent);
    
    const proposal: SwapProposal = {
      intentHash,
      intent: {
        payloadHash: intent.payloadHash,
        expiry: intent.expiry,
        nonce: intent.nonce,
        agentId: intent.agentId,
        coordinationType: intent.coordinationType,
        coordinationValue: intent.coordinationValue,
        participants: intent.participants,
      },
      payload: {
        version: payload.version,
        coordinationType: payload.coordinationType,
        participants: payload.participants,
        coordinationData: payload.coordinationData,
      },
      signature,
      terms: {
        tokenA: params.offerToken,
        amountA: params.offerAmount,
        tokenB: params.wantToken,
        amountB: params.wantAmount,
      },
    };
    
    // Store for later execution
    this.proposals.set(intentHash, proposal);
    
    return proposal;
  }

  /**
   * Sign an acceptance for an existing proposal
   */
  async createAcceptance(
    intentHash: Hex,
    expirySeconds?: number
  ): Promise<{ attestation: { intentHash: Hex; expiry: bigint; agentId: Address }; signature: Hex }> {
    return this.signer.signAcceptance(intentHash, expirySeconds);
  }

  /**
   * Get stored proposal (for execution)
   */
  getProposal(intentHash: Hex): SwapProposal | undefined {
    return this.proposals.get(intentHash);
  }

  /**
   * Store a proposal from another source
   */
  storeProposal(proposal: SwapProposal): void {
    this.proposals.set(proposal.intentHash, proposal);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Encode swap terms to bytes (matches contract's encodeSwapTerms)
 */
export function encodeSwapTerms(
  tokenA: Address,
  amountA: bigint,
  tokenB: Address,
  amountB: bigint
): Hex {
  // ABI encode: (address, uint256, address, uint256)
  const encoded = 
    '0x' +
    tokenA.slice(2).toLowerCase().padStart(64, '0') +
    amountA.toString(16).padStart(64, '0') +
    tokenB.slice(2).toLowerCase().padStart(64, '0') +
    amountB.toString(16).padStart(64, '0');
  return encoded as Hex;
}

/**
 * Decode swap terms from bytes
 */
export function decodeSwapTerms(data: Hex): SwapTerms {
  const hex = data.slice(2);
  return {
    tokenA: ('0x' + hex.slice(24, 64)) as Address,
    amountA: BigInt('0x' + hex.slice(64, 128)),
    tokenB: ('0x' + hex.slice(152, 192)) as Address,
    amountB: BigInt('0x' + hex.slice(192, 256)),
  };
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fractionStr ? `${whole}.${fractionStr}` : whole.toString();
}

/**
 * Parse token amount from string
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + fractionPadded);
}

/**
 * Get status name from status code
 */
export function getStatusName(status: CoordinationStatus): string {
  const names: Record<CoordinationStatus, string> = {
    [CoordinationStatus.None]: 'None',
    [CoordinationStatus.Proposed]: 'Proposed',
    [CoordinationStatus.Ready]: 'Ready',
    [CoordinationStatus.Executed]: 'Executed',
    [CoordinationStatus.Cancelled]: 'Cancelled',
  };
  return names[status] ?? 'Unknown';
}
