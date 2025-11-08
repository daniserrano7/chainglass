import { useState } from "react";
import { isValidAddress } from "~/lib/types/address";
import type { ChainFamily } from "~/lib/types";

interface AddAddressFormProps {
  onAddAddress: (address: string, chainFamily: ChainFamily, label?: string) => void;
  isLoading?: boolean;
}

export function AddAddressForm({ onAddAddress, isLoading = false }: AddAddressFormProps) {
  const [address, setAddress] = useState("");
  const [chainFamily, setChainFamily] = useState<ChainFamily>("evm");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate address
    if (!address.trim()) {
      setError("Address is required");
      return;
    }

    if (!isValidAddress(address.trim(), chainFamily)) {
      setError(`Invalid ${chainFamily.toUpperCase()} address format`);
      return;
    }

    // Call the callback
    onAddAddress(address.trim(), chainFamily, label.trim() || undefined);

    // Reset form
    setAddress("");
    setLabel("");
  };

  return (
    <div className="add-address-form">
      <h2>Add New Address</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="address">
            Address <span className="required">*</span>
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            disabled={isLoading}
            className="address-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="chainFamily">Chain Family</label>
          <select
            id="chainFamily"
            value={chainFamily}
            onChange={(e) => setChainFamily(e.target.value as ChainFamily)}
            disabled={isLoading}
          >
            <option value="evm">EVM</option>
            <option value="bitcoin" disabled>
              Bitcoin (Coming soon)
            </option>
            <option value="solana" disabled>
              Solana (Coming soon)
            </option>
            <option value="polkadot" disabled>
              Polkadot (Coming soon)
            </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="label">Label (optional)</label>
          <input
            type="text"
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Hardware Wallet, MetaMask"
            disabled={isLoading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Scanning..." : "Add & Scan Address"}
        </button>
      </form>

      <style>{`
        .add-address-form {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .add-address-form h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-group .required {
          color: #ef4444;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .address-input {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .error-message {
          margin: 12px 0;
          padding: 12px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 14px;
        }

        .btn-primary {
          width: 100%;
          padding: 12px 24px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .btn-primary:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
