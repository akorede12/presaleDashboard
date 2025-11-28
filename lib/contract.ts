// lib/contract.ts
import { ethers } from 'ethers';

const PRESALE_ABI = [
    // View functions
    "function getPresaleInfo() view returns (tuple(uint256 amountRaised, uint256 totalHardCap, uint256 tokenBalance, uint8 state))",
    "function getCurrentPhaseIndex() view returns (uint256)",
    "function getPhaseInfo(uint256) view returns (tuple(uint256 tokenAmount, uint256 tokensSold, uint256 pricePerToken, uint256 fundsRaised, uint256 startTime, uint256 endTime, bool completed, bool withdrawn))",
    "function getTotalPhases() view returns (uint256)",
    "function getWithdrawalRecipients() view returns (tuple(address recipient, uint256 percentage)[])",

    // Write functions
    "function addPhase(uint256 tokenAmount, uint256 pricePerToken, uint256 duration) external",
    "function withdrawPhase(uint256 phaseIndex) external",
    "function finalisePresale() external",
    "function deposit() external"
];

const CONFIG = {
    RPC_URL: "https://base-sepolia.g.alchemy.com/v2/e2Iv26_f82Ho7nRdoJ5t1sgSL3-6dMke",
    PRESALE_ADDRESS: "0x7541B0d690799908755C623df7D41d75A63cF9e7",
};

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

export class PresaleContract {
    private provider: ethers.BrowserProvider | null = null;
    private contract: ethers.Contract | null = null;

    constructor() {
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.contract = new ethers.Contract(CONFIG.PRESALE_ADDRESS, PRESALE_ABI, this.provider);
        }
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

    async getCurrentPhaseIndex(): Promise<number> {
        if (!this.contract) throw new Error('Contract not initialized');
        return Number(await this.contract.getCurrentPhaseIndex());
    }

    async getPhaseInfo(phaseIndex: number): Promise<PhaseInfo> {
        if (!this.contract) throw new Error('Contract not initialized');

        const phase = await this.contract.getPhaseInfo(phaseIndex);
        return {
            tokenAmount: parseFloat(ethers.formatUnits(phase.tokenAmount, 18)),
            tokensSold: parseFloat(ethers.formatUnits(phase.tokensSold, 18)),
            pricePerToken: parseFloat(ethers.formatUnits(phase.pricePerToken, 6)),
            fundsRaised: parseFloat(ethers.formatUnits(phase.fundsRaised, 6)),
            startTime: Number(phase.startTime),
            endTime: Number(phase.endTime),
            completed: phase.completed,
            withdrawn: phase.withdrawn
        };
    }

    async getTotalPhases(): Promise<number> {
        if (!this.contract) throw new Error('Contract not initialized');
        return Number(await this.contract.getTotalPhases());
    }

    async getAllPhases(): Promise<(PhaseInfo & { name: string; index: number })[]> {
        const totalPhases = await this.getTotalPhases();
        const phases: (PhaseInfo & { name: string; index: number })[] = [];

        for (let i = 0; i < totalPhases; i++) {
            const phase = await this.getPhaseInfo(i);
            phases.push({
                ...phase,
                name: `Phase ${i + 1}`,
                index: i
            });
        }

        return phases;
    }

    // async addPhase(tokenAmount: number, pricePerToken: number, durationDays: number): Promise<ethers.ContractTransactionReceipt> {
    //     if (!window.ethereum) throw new Error('No wallet found');
    //     if (!this.contract || !this.provider) throw new Error('Contract not initialized');

    //     const signer = await this.provider.getSigner();
    //     const contractWithSigner = this.contract.connect(signer) as ethers.Contract;

    //     const tokens = ethers.parseUnits(tokenAmount.toString(), 18);
    //     const price = ethers.parseUnits(pricePerToken.toString(), 6);
    //     const duration = durationDays * 24 * 60 * 60;

    //     const tx = await contractWithSigner.addPhase(tokens, price, duration);
    //     return await tx.wait();
    // }
    async addPhase(tokenAmount: bigint, pricePerToken: bigint, duration: bigint): Promise<ethers.ContractTransactionReceipt> {
        if (!window.ethereum) throw new Error('No wallet found');
        if (!this.contract || !this.provider) throw new Error('Contract not initialized');

        const signer = await this.provider.getSigner();
        const contractWithSigner = this.contract.connect(signer) as ethers.Contract;

        const tx = await contractWithSigner.addPhase(tokenAmount, pricePerToken, duration);
        return await tx.wait();
    }

    async withdrawPhase(phaseIndex: number): Promise<ethers.ContractTransactionReceipt> {
        if (!window.ethereum) throw new Error('No wallet found');
        if (!this.contract || !this.provider) throw new Error('Contract not initialized');

        const signer = await this.provider.getSigner();
        const contractWithSigner = this.contract.connect(signer) as ethers.Contract;

        const tx = await contractWithSigner.withdrawPhase(phaseIndex);
        return await tx.wait();
    }

    async finalize(): Promise<ethers.ContractTransactionReceipt> {
        if (!window.ethereum) throw new Error('No wallet found');
        if (!this.contract || !this.provider) throw new Error('Contract not initialized');

        const signer = await this.provider.getSigner();
        const contractWithSigner = this.contract.connect(signer) as ethers.Contract;

        const tx = await contractWithSigner.finalisePresale();
        return await tx.wait();
    }

    async deposit(): Promise<ethers.ContractTransactionReceipt> {
        if (!window.ethereum) throw new Error('No wallet found');
        if (!this.contract || !this.provider) throw new Error('Contract not initialized');

        const signer = await this.provider.getSigner();
        const contractWithSigner = this.contract.connect(signer) as ethers.Contract;

        const tx = await contractWithSigner.deposit();
        return await tx.wait();
    }
}

export const presaleContract = new PresaleContract();