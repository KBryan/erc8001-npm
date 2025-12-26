"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ts/index.ts
var index_exports = {};
__export(index_exports, {
  ACCEPTANCE_TYPES: () => ACCEPTANCE_TYPES,
  AGENT_INTENT_TYPES: () => AGENT_INTENT_TYPES,
  ATOMIC_SWAP_ABI: () => ATOMIC_SWAP_ABI,
  AtomicSwapClient: () => AtomicSwapClient,
  BOUNDED_INTENT_TYPES: () => BOUNDED_INTENT_TYPES,
  BoundedExecutorSigner: () => BoundedExecutorSigner,
  CoordinationStatus: () => CoordinationStatus,
  DEPLOYED_CONTRACTS: () => DEPLOYED_CONTRACTS,
  ERC20_ABI: () => ERC20_ABI,
  ERC8001Signer: () => ERC8001Signer,
  SWAP_TYPE: () => SWAP_TYPE,
  VERSION_HASH: () => VERSION_HASH,
  buildBoundedExecutorDomain: () => buildBoundedExecutorDomain,
  buildERC8001Domain: () => buildERC8001Domain,
  computePolicyLeaf: () => computePolicyLeaf,
  createAcceptance: () => createAcceptance,
  createAgentIntent: () => createAgentIntent,
  createBoundedIntent: () => createBoundedIntent,
  decodeSwapTerms: () => decodeSwapTerms,
  encodeSwapTerms: () => encodeSwapTerms,
  formatTokenAmount: () => formatTokenAmount,
  fromEthersSigner: () => fromEthersSigner,
  fromViemWallet: () => fromViemWallet,
  getStatusName: () => getStatusName,
  hashAcceptanceAttestation: () => hashAcceptanceAttestation,
  hashAgentIntent: () => hashAgentIntent,
  hashBoundedIntent: () => hashBoundedIntent,
  hashBoundedPayload: () => hashBoundedPayload,
  hashCoordinationPayload: () => hashCoordinationPayload,
  parseTokenAmount: () => parseTokenAmount
});
module.exports = __toCommonJS(index_exports);

// src/ts/types.ts
var CoordinationStatus = /* @__PURE__ */ ((CoordinationStatus2) => {
  CoordinationStatus2[CoordinationStatus2["None"] = 0] = "None";
  CoordinationStatus2[CoordinationStatus2["Proposed"] = 1] = "Proposed";
  CoordinationStatus2[CoordinationStatus2["Ready"] = 2] = "Ready";
  CoordinationStatus2[CoordinationStatus2["Executed"] = 3] = "Executed";
  CoordinationStatus2[CoordinationStatus2["Cancelled"] = 4] = "Cancelled";
  return CoordinationStatus2;
})(CoordinationStatus || {});

// src/ts/eip712.ts
var AGENT_INTENT_TYPES = {
  AgentIntent: [
    { name: "payloadHash", type: "bytes32" },
    { name: "expiry", type: "uint64" },
    { name: "nonce", type: "uint64" },
    { name: "agentId", type: "address" },
    { name: "coordinationType", type: "bytes32" },
    { name: "coordinationValue", type: "uint256" },
    { name: "participants", type: "address[]" }
  ]
};
var ACCEPTANCE_TYPES = {
  AcceptanceAttestation: [
    { name: "intentHash", type: "bytes32" },
    { name: "expiry", type: "uint64" },
    { name: "agentId", type: "address" }
  ]
};
var BOUNDED_INTENT_TYPES = {
  BoundedIntent: [
    { name: "payloadHash", type: "bytes32" },
    { name: "expiry", type: "uint64" },
    { name: "nonce", type: "uint64" },
    { name: "agentId", type: "address" },
    { name: "policyEpoch", type: "uint256" }
  ]
};
function buildERC8001Domain(params) {
  return {
    name: params.name,
    version: params.version,
    chainId: BigInt(params.chainId),
    verifyingContract: params.verifyingContract
  };
}
function buildBoundedExecutorDomain(chainId, verifyingContract) {
  return buildERC8001Domain({
    name: "BoundedAgentExecutor",
    version: "1",
    chainId,
    verifyingContract
  });
}

// src/ts/utils.ts
var import_viem = require("viem");
function hashCoordinationPayload(payload) {
  return (0, import_viem.keccak256)(
    (0, import_viem.encodeAbiParameters)(
      [
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "bytes32" }
      ],
      [
        payload.version,
        payload.coordinationType,
        (0, import_viem.keccak256)((0, import_viem.encodePacked)(["address[]"], [payload.participants])),
        (0, import_viem.keccak256)(payload.coordinationData)
      ]
    )
  );
}
function hashBoundedPayload(payload) {
  return (0, import_viem.keccak256)(
    (0, import_viem.encodeAbiParameters)(
      [
        { type: "bytes32" },
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
        { type: "bytes32" }
      ],
      [
        payload.policyRoot,
        payload.target,
        payload.asset,
        payload.amount,
        payload.calldataHash
      ]
    )
  );
}
function hashAgentIntent(intent) {
  const typeHash = (0, import_viem.keccak256)(
    (0, import_viem.encodePacked)(
      ["string"],
      [
        "AgentIntent(bytes32 payloadHash,uint64 expiry,uint64 nonce,address agentId,bytes32 coordinationType,uint256 coordinationValue,address[] participants)"
      ]
    )
  );
  return (0, import_viem.keccak256)(
    (0, import_viem.encodeAbiParameters)(
      [
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "uint64" },
        { type: "uint64" },
        { type: "address" },
        { type: "bytes32" },
        { type: "uint256" },
        { type: "bytes32" }
      ],
      [
        typeHash,
        intent.payloadHash,
        intent.expiry,
        intent.nonce,
        intent.agentId,
        intent.coordinationType,
        intent.coordinationValue,
        (0, import_viem.keccak256)((0, import_viem.encodePacked)(["address[]"], [intent.participants]))
      ]
    )
  );
}
function hashAcceptanceAttestation(attestation) {
  const typeHash = (0, import_viem.keccak256)(
    (0, import_viem.encodePacked)(
      ["string"],
      ["AcceptanceAttestation(bytes32 intentHash,uint64 expiry,address agentId)"]
    )
  );
  return (0, import_viem.keccak256)(
    (0, import_viem.encodeAbiParameters)(
      [
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "uint64" },
        { type: "address" }
      ],
      [typeHash, attestation.intentHash, attestation.expiry, attestation.agentId]
    )
  );
}
function hashBoundedIntent(intent) {
  const typeHash = (0, import_viem.keccak256)(
    (0, import_viem.encodePacked)(
      ["string"],
      [
        "BoundedIntent(bytes32 payloadHash,uint64 expiry,uint64 nonce,address agentId,uint256 policyEpoch)"
      ]
    )
  );
  return (0, import_viem.keccak256)(
    (0, import_viem.encodeAbiParameters)(
      [
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "uint64" },
        { type: "uint64" },
        { type: "address" },
        { type: "uint256" }
      ],
      [
        typeHash,
        intent.payloadHash,
        intent.expiry,
        intent.nonce,
        intent.agentId,
        intent.policyEpoch
      ]
    )
  );
}
var POLICY_LEAF_DOMAIN = (0, import_viem.keccak256)(
  (0, import_viem.encodePacked)(["string"], ["POLICY_LEAF_V1"])
);
function computePolicyLeaf(target, asset, amount) {
  return (0, import_viem.keccak256)(
    (0, import_viem.encodeAbiParameters)(
      [
        { type: "bytes32" },
        { type: "address" },
        { type: "address" },
        { type: "uint256" }
      ],
      [POLICY_LEAF_DOMAIN, target, asset, amount]
    )
  );
}
function createAgentIntent(params) {
  const version = params.version ?? (0, import_viem.keccak256)((0, import_viem.encodePacked)(["string"], ["V1"]));
  const expiry = BigInt(
    Math.floor(Date.now() / 1e3) + (params.expirySeconds ?? 3600)
  );
  const payload = {
    version,
    coordinationType: params.coordinationType,
    participants: params.participants,
    coordinationData: params.coordinationData
  };
  const payloadHash = hashCoordinationPayload(payload);
  const intent = {
    payloadHash,
    expiry,
    nonce: params.nonce,
    agentId: params.agentId,
    coordinationType: params.coordinationType,
    coordinationValue: params.coordinationValue ?? 0n,
    participants: params.participants
  };
  return { intent, payload };
}
function createBoundedIntent(params) {
  const expiry = BigInt(
    Math.floor(Date.now() / 1e3) + (params.expirySeconds ?? 3600)
  );
  const payload = {
    policyRoot: params.policyRoot,
    target: params.target,
    asset: params.asset,
    amount: params.amount,
    calldataHash: params.calldataHash ?? "0x0000000000000000000000000000000000000000000000000000000000000000"
  };
  const payloadHash = hashBoundedPayload(payload);
  const intent = {
    payloadHash,
    expiry,
    nonce: params.nonce,
    agentId: params.agentId,
    policyEpoch: params.policyEpoch
  };
  return { intent, payload };
}
function createAcceptance(intentHash, agentId, expirySeconds) {
  const expiry = BigInt(
    Math.floor(Date.now() / 1e3) + (expirySeconds ?? 3600)
  );
  return {
    intentHash,
    expiry,
    agentId
  };
}

// src/ts/signer.ts
var ERC8001Signer = class {
  constructor(signer, domain) {
    this.signer = signer;
    this.domain = domain;
  }
  /**
   * Create and sign an AgentIntent
   */
  async signIntent(params) {
    const agentId = await this.signer.getAddress();
    const { intent, payload } = createAgentIntent({ ...params, agentId });
    const signature = await this.signer.signTypedData({
      domain: this.domain,
      types: AGENT_INTENT_TYPES,
      primaryType: "AgentIntent",
      message: {
        payloadHash: intent.payloadHash,
        expiry: intent.expiry,
        nonce: intent.nonce,
        agentId: intent.agentId,
        coordinationType: intent.coordinationType,
        coordinationValue: intent.coordinationValue,
        participants: intent.participants
      }
    });
    return { intent, payload, signature };
  }
  /**
   * Sign an acceptance attestation
   */
  async signAcceptance(intentHash, expirySeconds) {
    const agentId = await this.signer.getAddress();
    const attestation = createAcceptance(intentHash, agentId, expirySeconds);
    const signature = await this.signer.signTypedData({
      domain: this.domain,
      types: ACCEPTANCE_TYPES,
      primaryType: "AcceptanceAttestation",
      message: {
        intentHash: attestation.intentHash,
        expiry: attestation.expiry,
        agentId: attestation.agentId
      }
    });
    return { attestation, signature };
  }
};
var BoundedExecutorSigner = class {
  constructor(signer, domain) {
    this.signer = signer;
    this.domain = domain;
  }
  /**
   * Create and sign a BoundedIntent
   */
  async signIntent(params) {
    const agentId = await this.signer.getAddress();
    const { intent, payload } = createBoundedIntent({ ...params, agentId });
    const signature = await this.signer.signTypedData({
      domain: this.domain,
      types: BOUNDED_INTENT_TYPES,
      primaryType: "BoundedIntent",
      message: {
        payloadHash: intent.payloadHash,
        expiry: intent.expiry,
        nonce: intent.nonce,
        agentId: intent.agentId,
        policyEpoch: intent.policyEpoch
      }
    });
    return { intent, payload, signature };
  }
};
function fromViemWallet(walletClient) {
  return {
    getAddress: async () => walletClient.account.address,
    signTypedData: async (params) => walletClient.signTypedData({
      domain: {
        name: params.domain.name,
        version: params.domain.version,
        chainId: params.domain.chainId,
        verifyingContract: params.domain.verifyingContract
      },
      types: params.types,
      primaryType: params.primaryType,
      message: params.message
    })
  };
}
function fromEthersSigner(signer) {
  return {
    getAddress: async () => await signer.getAddress(),
    signTypedData: async (params) => await signer.signTypedData(
      {
        name: params.domain.name,
        version: params.domain.version,
        chainId: params.domain.chainId,
        verifyingContract: params.domain.verifyingContract
      },
      params.types,
      params.message
    )
  };
}

// src/ts/client.ts
var DEPLOYED_CONTRACTS = {
  "base-sepolia": {
    atomicSwap: "0xD25FaF692736b74A674c8052F904b5C77f9cb2Ed",
    mockUSDC: "0x17abd6d0355cB2B933C014133B14245412ca00B6",
    mockWETH: "0xddFaC73904FE867B5526510E695826f4968A2357",
    chainId: 84532
  }
};
var SWAP_TYPE = "0x5a42c26733c3f3a8cf8860be88bf8c098214ed9cb08b2ae651708151e16e0e68";
var VERSION_HASH = "0x4c23426613a5dc69e08fbd2787e6210aa679d4522e95a89d4dd88c4fd13a2283";
var ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];
var ATOMIC_SWAP_ABI = [
  // Read functions
  "function getCoordinationStatus(bytes32 intentHash) view returns (uint8)",
  "function getAgentNonce(address agentId) view returns (uint64)",
  "function getAcceptanceCount(bytes32 intentHash) view returns (uint256)",
  "function hasAccepted(bytes32 intentHash, address agentId) view returns (bool)",
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function SWAP_TYPE() view returns (bytes32)",
  // Write functions
  "function proposeCoordination(tuple(bytes32 payloadHash, uint64 expiry, uint64 nonce, address agentId, bytes32 coordinationType, uint256 coordinationValue, address[] participants) intent, tuple(bytes32 version, bytes32 coordinationType, address[] participants, bytes coordinationData) payload, bytes signature) returns (bytes32)",
  "function acceptCoordination(bytes32 intentHash, tuple(bytes32 intentHash, uint64 expiry, address agentId) attestation, bytes signature)",
  "function executeCoordination(bytes32 intentHash, tuple(bytes32 version, bytes32 coordinationType, address[] participants, bytes coordinationData) payload, bytes executionData)",
  "function cancelCoordination(bytes32 intentHash)",
  // Helper functions
  "function encodeSwapTerms(address tokenA, uint256 amountA, address tokenB, uint256 amountB) pure returns (bytes)",
  // Events
  "event CoordinationProposed(bytes32 indexed intentHash, address indexed proposer, bytes32 indexed coordinationType, address[] participants, uint64 expiry)",
  "event CoordinationAccepted(bytes32 indexed intentHash, address indexed acceptor)",
  "event CoordinationExecuted(bytes32 indexed intentHash, address indexed executor)",
  "event CoordinationCancelled(bytes32 indexed intentHash)",
  "event SwapExecuted(bytes32 indexed intentHash, address partyA, address partyB, address tokenA, uint256 amountA, address tokenB, uint256 amountB)"
];
var AtomicSwapClient = class _AtomicSwapClient {
  signer;
  contracts;
  typedDataSigner;
  // Store proposals for execution
  proposals = /* @__PURE__ */ new Map();
  constructor(typedDataSigner, network, contractAddress) {
    this.contracts = DEPLOYED_CONTRACTS[network];
    this.typedDataSigner = typedDataSigner;
    const domain = buildERC8001Domain({
      name: "AtomicSwap",
      version: "1",
      chainId: this.contracts.chainId,
      verifyingContract: contractAddress ?? this.contracts.atomicSwap
    });
    this.signer = new ERC8001Signer(typedDataSigner, domain);
  }
  /**
   * Create from a viem WalletClient
   */
  static fromViem(walletClient, network, contractAddress) {
    return new _AtomicSwapClient(fromViemWallet(walletClient), network, contractAddress);
  }
  /**
   * Create from an ethers Signer
   */
  static fromEthers(ethersSigner, network, contractAddress) {
    return new _AtomicSwapClient(fromEthersSigner(ethersSigner), network, contractAddress);
  }
  /**
   * Get the connected address
   */
  async getAddress() {
    return this.typedDataSigner.getAddress();
  }
  /**
   * Get contract addresses
   */
  getContracts() {
    return this.contracts;
  }
  /**
   * Propose a new swap
   * 
   * @returns Signed proposal ready for submission
   */
  async createSwapProposal(params) {
    const address = await this.getAddress();
    const expirySeconds = params.expirySeconds ?? 3600;
    const participants = [address, params.counterparty];
    const coordinationData = encodeSwapTerms(
      params.offerToken,
      params.offerAmount,
      params.wantToken,
      params.wantAmount
    );
    const nonce = 1n;
    const { intent, payload, signature } = await this.signer.signIntent({
      coordinationType: SWAP_TYPE,
      participants,
      coordinationData,
      nonce,
      expirySeconds
    });
    const intentHash = hashAgentIntent(intent);
    const proposal = {
      intentHash,
      intent: {
        payloadHash: intent.payloadHash,
        expiry: intent.expiry,
        nonce: intent.nonce,
        agentId: intent.agentId,
        coordinationType: intent.coordinationType,
        coordinationValue: intent.coordinationValue,
        participants: intent.participants
      },
      payload: {
        version: payload.version,
        coordinationType: payload.coordinationType,
        participants: payload.participants,
        coordinationData: payload.coordinationData
      },
      signature,
      terms: {
        tokenA: params.offerToken,
        amountA: params.offerAmount,
        tokenB: params.wantToken,
        amountB: params.wantAmount
      }
    };
    this.proposals.set(intentHash, proposal);
    return proposal;
  }
  /**
   * Sign an acceptance for an existing proposal
   */
  async createAcceptance(intentHash, expirySeconds) {
    return this.signer.signAcceptance(intentHash, expirySeconds);
  }
  /**
   * Get stored proposal (for execution)
   */
  getProposal(intentHash) {
    return this.proposals.get(intentHash);
  }
  /**
   * Store a proposal from another source
   */
  storeProposal(proposal) {
    this.proposals.set(proposal.intentHash, proposal);
  }
};
function encodeSwapTerms(tokenA, amountA, tokenB, amountB) {
  const encoded = "0x" + tokenA.slice(2).toLowerCase().padStart(64, "0") + amountA.toString(16).padStart(64, "0") + tokenB.slice(2).toLowerCase().padStart(64, "0") + amountB.toString(16).padStart(64, "0");
  return encoded;
}
function decodeSwapTerms(data) {
  const hex = data.slice(2);
  return {
    tokenA: "0x" + hex.slice(24, 64),
    amountA: BigInt("0x" + hex.slice(64, 128)),
    tokenB: "0x" + hex.slice(152, 192),
    amountB: BigInt("0x" + hex.slice(192, 256))
  };
}
function formatTokenAmount(amount, decimals) {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fractionStr ? `${whole}.${fractionStr}` : whole.toString();
}
function parseTokenAmount(amount, decimals) {
  const [whole, fraction = ""] = amount.split(".");
  const fractionPadded = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + fractionPadded);
}
function getStatusName(status) {
  const names = {
    [0 /* None */]: "None",
    [1 /* Proposed */]: "Proposed",
    [2 /* Ready */]: "Ready",
    [3 /* Executed */]: "Executed",
    [4 /* Cancelled */]: "Cancelled"
  };
  return names[status] ?? "Unknown";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ACCEPTANCE_TYPES,
  AGENT_INTENT_TYPES,
  ATOMIC_SWAP_ABI,
  AtomicSwapClient,
  BOUNDED_INTENT_TYPES,
  BoundedExecutorSigner,
  CoordinationStatus,
  DEPLOYED_CONTRACTS,
  ERC20_ABI,
  ERC8001Signer,
  SWAP_TYPE,
  VERSION_HASH,
  buildBoundedExecutorDomain,
  buildERC8001Domain,
  computePolicyLeaf,
  createAcceptance,
  createAgentIntent,
  createBoundedIntent,
  decodeSwapTerms,
  encodeSwapTerms,
  formatTokenAmount,
  fromEthersSigner,
  fromViemWallet,
  getStatusName,
  hashAcceptanceAttestation,
  hashAgentIntent,
  hashBoundedIntent,
  hashBoundedPayload,
  hashCoordinationPayload,
  parseTokenAmount
});
