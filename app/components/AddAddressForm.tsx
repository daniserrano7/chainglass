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
        /* Mobile-first base styles */
        .add-address-form {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .add-address-form h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .form-group {
          margin-bottom: 14px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .form-group .required {
          color: #ef4444;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
          font-family: inherit;
          transition: border-color 0.2s;
          min-height: 44px;
          -webkit-appearance: none;
          appearance: none;
        }

        .form-group select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
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
          opacity: 0.6;
        }

        .address-input {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
        }

        .error-message {
          margin: 12px 0;
          padding: 12px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 13px;
          word-break: break-word;
        }

        .btn-primary {
          width: 100%;
          padding: 14px 24px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 48px;
          touch-action: manipulation;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .btn-primary:active:not(:disabled) {
          transform: scale(0.98);
        }

        .btn-primary:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        /* Tablet styles (640px+) */
        @media (min-width: 640px) {
          .add-address-form {
            padding: 20px;
            margin-bottom: 20px;
          }

          .add-address-form h2 {
            margin-bottom: 18px;
            font-size: 19px;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            font-size: 14px;
          }

          .form-group input,
          .form-group select {
            padding: 11px 12px;
            font-size: 15px;
          }

          .address-input {
            font-size: 14px;
          }

          .error-message {
            font-size: 14px;
          }

          .btn-primary {
            padding: 13px 24px;
            min-height: 46px;
          }
        }

        /* Desktop styles (1024px+) */
        @media (min-width: 1024px) {
          .add-address-form {
            padding: 24px;
            margin-bottom: 24px;
          }

          .add-address-form h2 {
            margin-bottom: 20px;
            font-size: 20px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group input,
          .form-group select {
            padding: 10px 12px;
            font-size: 14px;
          }

          .btn-primary {
            padding: 12px 24px;
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
