// lib/userContract.ts
import { ethers } from 'ethers';

const PRESALE_ABI = [
    // View functions
    "function getPresaleInfo() view returns (tuple(uint256 amountRaised, uint256 totalHardCap, uint256 tokenBalance, uint8 state))",
    "function getCurrentPhaseIndex() view returns (uint256)",
    "function getPhaseInfo(uint256) view returns (tuple(uint256 tokenAmount, uint256 tokensSold, uint256 pricePerToken, uint256 fundsRaised, uint256 startTime, uint256 endTime, bool completed, bool withdrawn))",
    "function getTotalPhases() view returns (uint256)",
    "function getUserPresaleData(address) view returns (tuple(uint256 salamAmount, uint256 usdcAmount))",
    "function buy(uint256 amount, uint256 tokenId) payable",

    // Events for transaction history
    "event TokensPurchased(address indexed buyer, uint256 amountPaid, uint256 tokensReceived, uint256 tokenId)"
];

const CONFIG = {
    RPC_URL: "https://base-sepolia.g.alchemy.com/v2/e2Iv26_f82Ho7nRdoJ5t1sgSL3-6dMke",
    PRESALE_ADDRESS: "0x7541B0d690799908755C623df7D41d75A63cF9e7",
    USDC_ADDRESS: "0xC1787137584340d7345fA9e33989AE95CA00f89c",
};

export interface UserPresaleData {
    salamAmount: number;
    usdcAmount: number;
}

export interface PresaleInfo {
    amountRaised: number;
    totalHardCap: number;
    tokenBalance: number;
    state: number;
}

export interface PhaseInfo {
    tokenAmount: number;
    tokensSold: number;
    pricePerToken: number;
    fundsRaised: number;
    startTime: number;
    endTime: number;
    completed: boolean;
    withdrawn: boolean;
    name?: string;
    index?: number;
}

export interface TransactionEvent {
    buyer: string;
    amountPaid: number;
    tokensReceived: number;
    tokenId: number;
    transactionHash: string;
    timestamp: number;
}

// Define the event args interface
interface TokensPurchasedEventArgs {
    buyer: string;
    amountPaid: bigint;
    tokensReceived: bigint;
    tokenId: bigint;
}

export class UserPresaleContract {
    private provider: ethers.BrowserProvider | null = null;
    private contract: ethers.Contract | null = null;

    constructor() {
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.contract = new ethers.Contract(CONFIG.PRESALE_ADDRESS, PRESALE_ABI, this.provider);
        }
    }

    async getUserPresaleData(address: string): Promise<UserPresaleData> {
        if (!this.contract) throw new Error('Contract not initialized');

        const userData = await this.contract.getUserPresaleData(address);
        return {
            salamAmount: parseFloat(ethers.formatUnits(userData.salamAmount, 18)),
            usdcAmount: parseFloat(ethers.formatUnits(userData.usdcAmount, 6))
        };
    }

    async getPresaleInfo(): Promise<PresaleInfo> {
        if (!this.contract) throw new Error('Contract not initialized');

        const info = await this.contract.getPresaleInfo();
        return {
            amountRaised: parseFloat(ethers.formatUnits(info.amountRaised, 6)),
            totalHardCap: parseFloat(ethers.formatUnits(info.totalHardCap, 6)),
            tokenBalance: parseFloat(ethers.formatUnits(info.tokenBalance, 18)),
            state: info.state
        };
    }

    async getCurrentPhaseInfo(): Promise<PhaseInfo> {
        if (!this.contract) throw new Error('Contract not initialized');

        const currentPhaseIndex = await this.contract.getCurrentPhaseIndex();
        const phase = await this.contract.getPhaseInfo(currentPhaseIndex);

        return {
            tokenAmount: parseFloat(ethers.formatUnits(phase.tokenAmount, 18)),
            tokensSold: parseFloat(ethers.formatUnits(phase.tokensSold, 18)),
            pricePerToken: parseFloat(ethers.formatUnits(phase.pricePerToken, 6)),
            fundsRaised: parseFloat(ethers.formatUnits(phase.fundsRaised, 6)),
            startTime: Number(phase.startTime),
            endTime: Number(phase.endTime),
            completed: phase.completed,
            withdrawn: phase.withdrawn,
            name: `Phase ${Number(currentPhaseIndex) + 1}`,
            index: Number(currentPhaseIndex)
        };
    }

    async getAllPhases(): Promise<(PhaseInfo & { name: string; index: number })[]> {
        if (!this.contract) throw new Error('Contract not initialized');

        const totalPhases = await this.contract.getTotalPhases();
        const phases: (PhaseInfo & { name: string; index: number })[] = [];

        for (let i = 0; i < totalPhases; i++) {
            const phase = await this.contract.getPhaseInfo(i);
            phases.push({
                tokenAmount: parseFloat(ethers.formatUnits(phase.tokenAmount, 18)),
                tokensSold: parseFloat(ethers.formatUnits(phase.tokensSold, 18)),
                pricePerToken: parseFloat(ethers.formatUnits(phase.pricePerToken, 6)),
                fundsRaised: parseFloat(ethers.formatUnits(phase.fundsRaised, 6)),
                startTime: Number(phase.startTime),
                endTime: Number(phase.endTime),
                completed: phase.completed,
                withdrawn: phase.withdrawn,
                name: `Phase ${i + 1}`,
                index: i
            });
        }

        return phases;
    }

    async getTransactionHistory(address: string, fromBlock?: number): Promise<TransactionEvent[]> {
        if (!this.contract || !this.provider) throw new Error('Contract not initialized');

        const currentBlock = await this.provider.getBlockNumber();
        const fromBlockNumber = fromBlock || currentBlock - 10000; // Last ~1 day of blocks

        const filter = this.contract.filters.TokensPurchased(address);
        const events = await this.contract.queryFilter(filter, fromBlockNumber, currentBlock);

        const transactions: TransactionEvent[] = [];

        for (const event of events) {
            // Type guard to check if it's an EventLog with args
            if ('args' in event && event.args) {
                const args = event.args as unknown as TokensPurchasedEventArgs;
                const block = await event.getBlock();

                // Add null check for block
                if (!block) {
                    console.warn('Could not get block for transaction:', event.transactionHash);
                    continue;
                }

                // Convert bigint to number for comparison (USDC tokenId is 1)
                const isUSDC = Number(args.tokenId) === 1;

                transactions.push({
                    buyer: args.buyer,
                    amountPaid: parseFloat(ethers.formatUnits(args.amountPaid, isUSDC ? 6 : 18)), // USDC=6 decimals, ETH=18
                    tokensReceived: parseFloat(ethers.formatUnits(args.tokensReceived, 18)),
                    tokenId: Number(args.tokenId),
                    transactionHash: event.transactionHash,
                    timestamp: block.timestamp
                });
            }
        }

        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }

    async buyWithETH(ethAmount: number): Promise<ethers.ContractTransactionReceipt> {
        if (!window.ethereum) throw new Error('No wallet found');
        if (!this.contract || !this.provider) throw new Error('Contract not initialized');

        const signer = await this.provider.getSigner();
        const contractWithSigner = this.contract.connect(signer) as ethers.Contract;

        const amount = ethers.parseEther(ethAmount.toString());
        const tx = await contractWithSigner.buy(0, 0, { value: amount }); // tokenId 0 = ETH
        return await tx.wait();
    }

    async buyWithUSDC(usdcAmount: number): Promise<ethers.ContractTransactionReceipt> {
        if (!window.ethereum) throw new Error('No wallet found');
        if (!this.contract || !this.provider) throw new Error('Contract not initialized');

        const signer = await this.provider.getSigner();
        const contractWithSigner = this.contract.connect(signer) as ethers.Contract;

        // First approve USDC spending
        const USDC_ABI = [
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)"
        ];
        const usdcContract = new ethers.Contract(CONFIG.USDC_ADDRESS, USDC_ABI, signer);

        const amount = ethers.parseUnits(usdcAmount.toString(), 6);

        // Check allowance
        const allowance = await usdcContract.allowance(await signer.getAddress(), CONFIG.PRESALE_ADDRESS);
        if (allowance < amount) {
            const approveTx = await usdcContract.approve(CONFIG.PRESALE_ADDRESS, amount);
            await approveTx.wait();
        }

        // Buy with USDC
        const tx = await contractWithSigner.buy(amount, 1); // tokenId 1 = USDC
        return await tx.wait();
    }

    async getWalletBalances(address: string): Promise<{ ethBalance: number; usdcBalance: number }> {
        if (!this.provider) throw new Error('Provider not initialized');

        const USDC_ABI = ["function balanceOf(address) view returns (uint256)"];
        const usdcContract = new ethers.Contract(CONFIG.USDC_ADDRESS, USDC_ABI, this.provider);

        const [ethBalance, usdcBalance] = await Promise.all([
            this.provider.getBalance(address),
            usdcContract.balanceOf(address)
        ]);

        return {
            ethBalance: parseFloat(ethers.formatEther(ethBalance)),
            usdcBalance: parseFloat(ethers.formatUnits(usdcBalance, 6))
        };
    }

    // Alternative method to get transaction history using getLogs directly
    async getTransactionHistoryAlternative(address: string, fromBlock?: number): Promise<TransactionEvent[]> {
        if (!this.provider) throw new Error('Provider not initialized');

        const currentBlock = await this.provider.getBlockNumber();
        const fromBlockNumber = fromBlock || currentBlock - 10000;

        // Get logs directly
        const logs = await this.provider.getLogs({
            address: CONFIG.PRESALE_ADDRESS,
            topics: [
                ethers.id("TokensPurchased(address,uint256,uint256,uint256)"),
                ethers.zeroPadValue(address, 32) // indexed buyer topic
            ],
            fromBlock: fromBlockNumber,
            toBlock: currentBlock
        });

        const transactions: TransactionEvent[] = [];

        for (const log of logs) {
            try {
                // Decode the log manually
                const iface = new ethers.Interface(PRESALE_ABI);
                const parsedLog = iface.parseLog({
                    topics: log.topics as string[],
                    data: log.data
                });

                if (parsedLog && parsedLog.name === "TokensPurchased") {
                    const args = parsedLog.args as unknown as TokensPurchasedEventArgs;
                    const block = await this.provider!.getBlock(log.blockNumber);

                    // Add null check for block
                    if (!block) {
                        console.warn('Could not get block for transaction:', log.transactionHash);
                        continue;
                    }

                    // Convert bigint to number for comparison (USDC tokenId is 1)
                    const isUSDC = Number(args.tokenId) === 1;

                    transactions.push({
                        buyer: args.buyer,
                        amountPaid: parseFloat(ethers.formatUnits(args.amountPaid, isUSDC ? 6 : 18)),
                        tokensReceived: parseFloat(ethers.formatUnits(args.tokensReceived, 18)),
                        tokenId: Number(args.tokenId),
                        transactionHash: log.transactionHash,
                        timestamp: block.timestamp
                    });
                }
            } catch (error) {
                console.warn('Failed to parse log:', error);
            }
        }

        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }
}

export const userPresaleContract = new UserPresaleContract();