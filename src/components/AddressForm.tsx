import { useState } from 'react';
import { isValidAddress } from '../services/rpcService';
import './AddressForm.css';

interface AddressFormProps {
  onAddAddress: (address: string, label: string) => void;
}

function AddressForm({ onAddAddress }: AddressFormProps) {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate address
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    if (!isValidAddress(address.trim())) {
      setError('Invalid Ethereum address format');
      return;
    }

    // Add address
    onAddAddress(address.trim(), label.trim());

    // Clear form
    setAddress('');
    setLabel('');
  };

  return (
    <div className="address-form-container">
      <h2>Add Watch Address</h2>
      <form className="address-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="address">Ethereum Address</label>
          <input
            id="address"
            type="text"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={error ? 'error' : ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="label">Label (optional)</label>
          <input
            id="label"
            type="text"
            placeholder="My Wallet"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button">
          Add Address
        </button>
      </form>
    </div>
  );
}

export default AddressForm;
