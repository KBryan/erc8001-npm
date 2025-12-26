import { Hex as Hex$1, Address as Address$1 } from 'viem';

/**
 * ERC-8001 Type Definitions
 * Matches the Solidity struct definitions in IERC8001.sol
 */
declare enum CoordinationStatus {
    None = 0,
    Proposed = 1,
    Ready = 2,
    Executed = 3,
    Cancelled = 4
}
/**
 * The core intent structure signed by the proposer.
 */
interface AgentIntent {
    payloadHash: `0x${string}`;
    expiry: bigint;
    nonce: bigint;
    agentId: `0x${string}`;
    coordinationType: `0x${string}`;
    coordinationValue: bigint;
    participants: `0x${string}`[];
}
/**
 * Acceptance attestation signed by each participant.
 */
interface AcceptanceAttestation {
    intentHash: `0x${string}`;
    expiry: bigint;
    agentId: `0x${string}`;
}
/**
 * Application-specific coordination payload.
 */
interface CoordinationPayload {
    version: `0x${string}`;
    coordinationType: `0x${string}`;
    participants: `0x${string}`[];
    coordinationData: `0x${string}`;
}
/**
 * Intent for bounded execution.
 */
interface BoundedIntent {
    payloadHash: `0x${string}`;
    expiry: bigint;
    nonce: bigint;
    agentId: `0x${string}`;
    policyEpoch: bigint;
}
/**
 * Payload for bounded operations.
 */
interface BoundedPayload {
    policyRoot: `0x${string}`;
    target: `0x${string}`;
    asset: `0x${string}`;
    amount: bigint;
    calldataHash: `0x${string}`;
}
/**
 * Agent budget configuration.
 */
interface AgentBudget {
    dailyLimit: bigint;
    spentToday: bigint;
    periodStart: bigint;
}
type Hex = `0x${string}`;
type Address = `0x${string}`;
/**
 * EIP-712 Domain
 */
interface EIP712Domain {
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: Address;
}
/**
 * Signed intent ready for submission
 */
interface SignedIntent<T> {
    intent: T;
    signature: Hex;
}

/**
 * EIP-712 Type Definitions for ERC-8001
 */

/**
 * EIP-712 types for AgentIntent
 */
declare const AGENT_INTENT_TYPES: {
    readonly AgentIntent: readonly [{
        readonly name: "payloadHash";
        readonly type: "bytes32";
    }, {
        readonly name: "expiry";
        readonly type: "uint64";
    }, {
        readonly name: "nonce";
        readonly type: "uint64";
    }, {
        readonly name: "agentId";
        readonly type: "address";
    }, {
        readonly name: "coordinationType";
        readonly type: "bytes32";
    }, {
        readonly name: "coordinationValue";
        readonly type: "uint256";
    }, {
        readonly name: "participants";
        readonly type: "address[]";
    }];
};
/**
 * EIP-712 types for AcceptanceAttestation
 */
declare const ACCEPTANCE_TYPES: {
    readonly AcceptanceAttestation: readonly [{
        readonly name: "intentHash";
        readonly type: "bytes32";
    }, {
        readonly name: "expiry";
        readonly type: "uint64";
    }, {
        readonly name: "agentId";
        readonly type: "address";
    }];
};
/**
 * EIP-712 types for BoundedIntent
 */
declare const BOUNDED_INTENT_TYPES: {
    readonly BoundedIntent: readonly [{
        readonly name: "payloadHash";
        readonly type: "bytes32";
    }, {
        readonly name: "expiry";
        readonly type: "uint64";
    }, {
        readonly name: "nonce";
        readonly type: "uint64";
    }, {
        readonly name: "agentId";
        readonly type: "address";
    }, {
        readonly name: "policyEpoch";
        readonly type: "uint256";
    }];
};
interface DomainParams {
    name: string;
    version: string;
    chainId: bigint | number;
    verifyingContract: `0x${string}`;
}
/**
 * Build EIP-712 domain for ERC-8001 coordinator
 */
declare function buildERC8001Domain(params: DomainParams): {
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: `0x${string}`;
};
/**
 * Default domain for BoundedAgentExecutor
 */
declare function buildBoundedExecutorDomain(chainId: bigint | number, verifyingContract: `0x${string}`): {
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: `0x${string}`;
};

/**
 * Viem-based signing utilities for ERC-8001
 */

/**
 * Hash a CoordinationPayload
 */
declare function hashCoordinationPayload(payload: CoordinationPayload): Hex$1;
/**
 * Hash a BoundedPayload
 */
declare function hashBoundedPayload(payload: BoundedPayload): Hex$1;
/**
 * Hash an AgentIntent (for EIP-712 struct hash)
 */
declare function hashAgentIntent(intent: AgentIntent): Hex$1;
/**
 * Hash an AcceptanceAttestation
 */
declare function hashAcceptanceAttestation(attestation: AcceptanceAttestation): Hex$1;
/**
 * Hash a BoundedIntent
 */
declare function hashBoundedIntent(intent: BoundedIntent): Hex$1;
/**
 * Compute policy leaf for Merkle tree
 */
declare function computePolicyLeaf(target: Address$1, asset: Address$1, amount: bigint): Hex$1;
interface CreateIntentParams {
    agentId: Address$1;
    coordinationType: Hex$1;
    coordinationValue?: bigint;
    participants: Address$1[];
    coordinationData: Hex$1;
    nonce: bigint;
    expirySeconds?: number;
    version?: Hex$1;
}
/**
 * Create an AgentIntent with computed payload hash
 */
declare function createAgentIntent(params: CreateIntentParams): {
    intent: AgentIntent;
    payload: CoordinationPayload;
};
interface CreateBoundedIntentParams {
    agentId: Address$1;
    policyRoot: Hex$1;
    policyEpoch: bigint;
    target: Address$1;
    asset: Address$1;
    amount: bigint;
    calldataHash?: Hex$1;
    nonce: bigint;
    expirySeconds?: number;
}
/**
 * Create a BoundedIntent with computed payload hash
 */
declare function createBoundedIntent(params: CreateBoundedIntentParams): {
    intent: BoundedIntent;
    payload: BoundedPayload;
};
/**
 * Create an AcceptanceAttestation
 */
declare function createAcceptance(intentHash: Hex$1, agentId: Address$1, expirySeconds?: number): AcceptanceAttestation;

/**
 * ERC-8001 Signer
 * High-level API for signing intents and attestations
 */

interface SignTypedDataParams {
    domain: DomainParams;
    types: Record<string, readonly {
        name: string;
        type: string;
    }[]>;
    primaryType: string;
    message: Record<string, unknown>;
}
/**
 * Abstract signer interface - implement for your wallet/signer
 */
interface TypedDataSigner {
    getAddress(): Promise<Address>;
    signTypedData(params: SignTypedDataParams): Promise<Hex>;
}
declare class ERC8001Signer {
    private readonly signer;
    private readonly domain;
    constructor(signer: TypedDataSigner, domain: DomainParams);
    /**
     * Create and sign an AgentIntent
     */
    signIntent(params: Omit<CreateIntentParams, 'agentId'>): Promise<{
        intent: AgentIntent;
        payload: CoordinationPayload;
        signature: Hex;
    }>;
    /**
     * Sign an acceptance attestation
     */
    signAcceptance(intentHash: Hex, expirySeconds?: number): Promise<{
        attestation: AcceptanceAttestation;
        signature: Hex;
    }>;
}
declare class BoundedExecutorSigner {
    private readonly signer;
    private readonly domain;
    constructor(signer: TypedDataSigner, domain: DomainParams);
    /**
     * Create and sign a BoundedIntent
     */
    signIntent(params: Omit<CreateBoundedIntentParams, 'agentId'>): Promise<{
        intent: BoundedIntent;
        payload: BoundedPayload;
        signature: Hex;
    }>;
}
/**
 * Create a TypedDataSigner from a viem WalletClient
 */
declare function fromViemWallet(walletClient: {
    account: {
        address: Address;
    };
    signTypedData: (params: {
        domain: {
            name: string;
            version: string;
            chainId: bigint | number;
            verifyingContract: Address;
        };
        types: Record<string, {
            name: string;
            type: string;
        }[]>;
        primaryType: string;
        message: Record<string, unknown>;
    }) => Promise<Hex>;
}): TypedDataSigner;
/**
 * Create a TypedDataSigner from an ethers Signer
 */
declare function fromEthersSigner(signer: {
    getAddress: () => Promise<string>;
    signTypedData: (domain: {
        name: string;
        version: string;
        chainId: bigint | number;
        verifyingContract: string;
    }, types: Record<string, {
        name: string;
        type: string;
    }[]>, value: Record<string, unknown>) => Promise<string>;
}): TypedDataSigner;

/**
 * AtomicSwap Client
 * High-level API for interacting with the AtomicSwap contract
 */

declare const DEPLOYED_CONTRACTS: {
    readonly 'base-sepolia': {
        readonly atomicSwap: Address;
        readonly mockUSDC: Address;
        readonly mockWETH: Address;
        readonly chainId: 84532;
    };
};
type SupportedNetwork = keyof typeof DEPLOYED_CONTRACTS;
declare const SWAP_TYPE: Hex;
declare const VERSION_HASH: Hex;
declare const ERC20_ABI: readonly ["function balanceOf(address owner) view returns (uint256)", "function allowance(address owner, address spender) view returns (uint256)", "function approve(address spender, uint256 amount) returns (bool)", "function transfer(address to, uint256 amount) returns (bool)", "function symbol() view returns (string)", "function decimals() view returns (uint8)"];
declare const ATOMIC_SWAP_ABI: readonly ["function getCoordinationStatus(bytes32 intentHash) view returns (uint8)", "function getAgentNonce(address agentId) view returns (uint64)", "function getAcceptanceCount(bytes32 intentHash) view returns (uint256)", "function hasAccepted(bytes32 intentHash, address agentId) view returns (bool)", "function DOMAIN_SEPARATOR() view returns (bytes32)", "function SWAP_TYPE() view returns (bytes32)", "function proposeCoordination(tuple(bytes32 payloadHash, uint64 expiry, uint64 nonce, address agentId, bytes32 coordinationType, uint256 coordinationValue, address[] participants) intent, tuple(bytes32 version, bytes32 coordinationType, address[] participants, bytes coordinationData) payload, bytes signature) returns (bytes32)", "function acceptCoordination(bytes32 intentHash, tuple(bytes32 intentHash, uint64 expiry, address agentId) attestation, bytes signature)", "function executeCoordination(bytes32 intentHash, tuple(bytes32 version, bytes32 coordinationType, address[] participants, bytes coordinationData) payload, bytes executionData)", "function cancelCoordination(bytes32 intentHash)", "function encodeSwapTerms(address tokenA, uint256 amountA, address tokenB, uint256 amountB) pure returns (bytes)", "event CoordinationProposed(bytes32 indexed intentHash, address indexed proposer, bytes32 indexed coordinationType, address[] participants, uint64 expiry)", "event CoordinationAccepted(bytes32 indexed intentHash, address indexed acceptor)", "event CoordinationExecuted(bytes32 indexed intentHash, address indexed executor)", "event CoordinationCancelled(bytes32 indexed intentHash)", "event SwapExecuted(bytes32 indexed intentHash, address partyA, address partyB, address tokenA, uint256 amountA, address tokenB, uint256 amountB)"];
interface SwapTerms {
    tokenA: Address;
    amountA: bigint;
    tokenB: Address;
    amountB: bigint;
}
interface ProposeSwapParams {
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
interface SwapProposal {
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
interface SwapStatus {
    status: CoordinationStatus;
    statusName: string;
    acceptanceCount: number;
    canExecute: boolean;
}
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
declare class AtomicSwapClient {
    private readonly signer;
    private readonly contracts;
    private readonly typedDataSigner;
    private proposals;
    constructor(typedDataSigner: TypedDataSigner, network: SupportedNetwork, contractAddress?: Address);
    /**
     * Create from a viem WalletClient
     */
    static fromViem(walletClient: Parameters<typeof fromViemWallet>[0], network: SupportedNetwork, contractAddress?: Address): AtomicSwapClient;
    /**
     * Create from an ethers Signer
     */
    static fromEthers(ethersSigner: Parameters<typeof fromEthersSigner>[0], network: SupportedNetwork, contractAddress?: Address): AtomicSwapClient;
    /**
     * Get the connected address
     */
    getAddress(): Promise<Address>;
    /**
     * Get contract addresses
     */
    getContracts(): typeof DEPLOYED_CONTRACTS[SupportedNetwork];
    /**
     * Propose a new swap
     *
     * @returns Signed proposal ready for submission
     */
    createSwapProposal(params: ProposeSwapParams): Promise<SwapProposal>;
    /**
     * Sign an acceptance for an existing proposal
     */
    createAcceptance(intentHash: Hex, expirySeconds?: number): Promise<{
        attestation: {
            intentHash: Hex;
            expiry: bigint;
            agentId: Address;
        };
        signature: Hex;
    }>;
    /**
     * Get stored proposal (for execution)
     */
    getProposal(intentHash: Hex): SwapProposal | undefined;
    /**
     * Store a proposal from another source
     */
    storeProposal(proposal: SwapProposal): void;
}
/**
 * Encode swap terms to bytes (matches contract's encodeSwapTerms)
 */
declare function encodeSwapTerms(tokenA: Address, amountA: bigint, tokenB: Address, amountB: bigint): Hex;
/**
 * Decode swap terms from bytes
 */
declare function decodeSwapTerms(data: Hex): SwapTerms;
/**
 * Format token amount for display
 */
declare function formatTokenAmount(amount: bigint, decimals: number): string;
/**
 * Parse token amount from string
 */
declare function parseTokenAmount(amount: string, decimals: number): bigint;
/**
 * Get status name from status code
 */
declare function getStatusName(status: CoordinationStatus): string;

export { ACCEPTANCE_TYPES, AGENT_INTENT_TYPES, ATOMIC_SWAP_ABI, type AcceptanceAttestation, type Address, type AgentBudget, type AgentIntent, AtomicSwapClient, BOUNDED_INTENT_TYPES, BoundedExecutorSigner, type BoundedIntent, type BoundedPayload, type CoordinationPayload, CoordinationStatus, type CreateBoundedIntentParams, type CreateIntentParams, DEPLOYED_CONTRACTS, type DomainParams, type EIP712Domain, ERC20_ABI, ERC8001Signer, type Hex, type ProposeSwapParams, SWAP_TYPE, type SignTypedDataParams, type SignedIntent, type SupportedNetwork, type SwapProposal, type SwapStatus, type SwapTerms, type TypedDataSigner, VERSION_HASH, buildBoundedExecutorDomain, buildERC8001Domain, computePolicyLeaf, createAcceptance, createAgentIntent, createBoundedIntent, decodeSwapTerms, encodeSwapTerms, formatTokenAmount, fromEthersSigner, fromViemWallet, getStatusName, hashAcceptanceAttestation, hashAgentIntent, hashBoundedIntent, hashBoundedPayload, hashCoordinationPayload, parseTokenAmount };
