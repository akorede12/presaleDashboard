'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminNavigation } from '@/components/wallet/AdminNavigation';
import { StatsCard } from '@/components/wallet/StatsCard';
import { PhaseCard } from '@/components/wallet/PhaseCard';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { presaleContract } from '@/lib/contract';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function AdminDashboard() {
  const [account, setAccount] = useState<string>('');
  const queryClient = useQueryClient();
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [phaseForm, setPhaseForm] = useState({
    tokenAmount: '',
    pricePerToken: '',
    durationDays: ''
  });

  useEffect(() => {
    const checkAccount = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        console.log('Connected account:', address);
      }
    };
    checkAccount();
  }, []);

  const { data: presaleInfo, isLoading: infoLoading } = useQuery({
    queryKey: ['presale-info'],
    queryFn: () => presaleContract.getPresaleInfo(),
  });

  const { data: phases = [], isLoading: phasesLoading } = useQuery({
    queryKey: ['all-phases'],
    queryFn: () => presaleContract.getAllPhases(),
  });

  const addPhaseMutation = useMutation({
    mutationFn: async ({ tokenAmount, pricePerToken, durationDays }: {
      tokenAmount: number;
      pricePerToken: number;
      durationDays: number;
    }) => {
      try {
        // Validate inputs
        if (tokenAmount <= 0 || pricePerToken <= 0 || durationDays <= 0) {
          throw new Error('All values must be greater than 0');
        }

        console.log('Input values:', { tokenAmount, pricePerToken, durationDays });

        // Check if wallet is connected and get current account
        if (!window.ethereum) {
          throw new Error('No wallet connected');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const currentAddress = await signer.getAddress();

        console.log('Current connected address:', currentAddress);

        // Convert to the exact format the contract expects
        const tokens = ethers.parseUnits(tokenAmount.toString(), 18);
        const price = ethers.parseUnits(pricePerToken.toString(), 6);
        const duration = BigInt(durationDays * 24 * 60 * 60);

        console.log('Converted values:', {
          tokens: tokens.toString(),
          price: price.toString(),
          duration: duration.toString()
        });

        return await presaleContract.addPhase(tokens, price, duration);
      } catch (error) {
        console.error('Error in addPhase mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-phases'] });
      queryClient.invalidateQueries({ queryKey: ['presale-info'] });
      setIsAddingPhase(false);
      setPhaseForm({ tokenAmount: '', pricePerToken: '', durationDays: '' });
      alert('Phase added successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to add phase:', error);

      if (error.message?.includes('user rejected') || error.code === 4001) {
        alert('Transaction was rejected by user');
      } else if (error.message?.includes('missing revert data') || error.code === 'CALL_EXCEPTION') {
        alert('Transaction failed. Make sure you are the admin and have permission to add phases.');
      } else {
        alert(`Failed to add phase: ${error.message || 'Unknown error'}`);
      }
    },
  });

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!phaseForm.tokenAmount || !phaseForm.pricePerToken || !phaseForm.durationDays) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addPhaseMutation.mutateAsync({
        tokenAmount: parseFloat(phaseForm.tokenAmount),
        pricePerToken: parseFloat(phaseForm.pricePerToken),
        durationDays: parseFloat(phaseForm.durationDays),
      });
    } catch (error) {
      // Error is already handled in onError
      console.error('Add phase failed:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      if (!window.ethereum) {
        alert('No wallet connected');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      alert(`Current account: ${address}\n\nMake sure this address is the contract owner/admin.`);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };


  const withdrawPhaseMutation = useMutation({
    mutationFn: (phaseIndex: number) => presaleContract.withdrawPhase(phaseIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-phases'] });
      queryClient.invalidateQueries({ queryKey: ['presale-info'] });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: () => presaleContract.finalize(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presale-info'] });
    },
  });

  const stats = {
    totalAmountRaised: presaleInfo?.amountRaised || 0,
    totalTokensDistributed: phases.reduce((sum, phase) => sum + phase.tokensSold, 0),
    totalTransactions: 0, // You might want to track this separately
    uniqueWallets: 0, // You might want to track this separately
  };

  const isLoading = infoLoading || phasesLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="px-8 pt-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
            {account && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Connected as: {account}
              </p>
            )}
          </div>
        </div>

        <AdminNavigation />

        <div className="px-8 pb-8">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Total Amount Raised"
                  value={formatCurrency(stats.totalAmountRaised)}
                />
                <StatsCard
                  title="Total Tokens Distributed"
                  value={formatNumber(stats.totalTokensDistributed)}
                />
                <StatsCard
                  title="Total Transactions"
                  value={stats.totalTransactions}
                />
                <StatsCard
                  title="Unique Wallets"
                  value={stats.uniqueWallets}
                />
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Phases
                  </h2>
                  {/* <button
                    onClick={() => setIsAddingPhase(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Phase
                  </button> */}
                  <div className="flex gap-2">
                    <button
                      onClick={checkPermissions}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Check Permissions
                    </button>
                    <button
                      onClick={() => setIsAddingPhase(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add Phase
                    </button>
                  </div>
                </div>

                {isAddingPhase && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Phase</h3>
                    <form onSubmit={handleAddPhase} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Token Amount</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={phaseForm.tokenAmount}
                          onChange={(e) => setPhaseForm({ ...phaseForm, tokenAmount: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Price Per Token ($)</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={phaseForm.pricePerToken}
                          onChange={(e) => setPhaseForm({ ...phaseForm, pricePerToken: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Duration (Days)</label>
                        <input
                          type="number"
                          value={phaseForm.durationDays}
                          onChange={(e) => setPhaseForm({ ...phaseForm, durationDays: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div className="md:col-span-3 flex gap-2">
                        <button
                          type="submit"
                          disabled={addPhaseMutation.isPending}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                        >
                          {addPhaseMutation.isPending ? 'Adding...' : 'Add Phase'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingPhase(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {phases.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {phases.map((phase) => (
                      <PhaseCard
                        key={phase.index}
                        phase={{
                          name: phase.name,
                          totalAmount: phase.fundsRaised,
                          totalTokens: phase.tokensSold,
                          transactionCount: 0, // You might want to track this
                          uniqueWallets: 0, // You might want to track this
                          completed: phase.completed,
                          withdrawn: phase.withdrawn,
                          index: phase.index
                        }}
                        onWithdraw={() => withdrawPhaseMutation.mutate(phase.index)}
                        withdrawLoading={withdrawPhaseMutation.variables === phase.index && withdrawPhaseMutation.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No phases created yet
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => finalizeMutation.mutate()}
                  disabled={finalizeMutation.isPending}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {finalizeMutation.isPending ? 'Finalizing...' : 'Finalize Presale'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}