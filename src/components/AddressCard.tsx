import { AddressData } from '../types';
import { formatUSD, truncateMiddle, formatRelativeTime } from '../utils/formatting';
import NetworkSection from './NetworkSection';
import './AddressCard.css';

interface AddressCardProps {
  addressData: AddressData;
  onRemove?: (id: string) => void;
}

function AddressCard({ addressData, onRemove }: AddressCardProps) {
  const { address, networkBalances, totalUsdValue } = addressData;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address.address);
  };

  const handleRemove = () => {
    if (onRemove && confirm(`Remove ${address.label}?`)) {
      onRemove(address.id);
    }
  };

  return (
    <div className="address-card">
      <div className="address-card-header">
        <div className="address-info">
          <h2 className="address-label">{address.label}</h2>
          <div className="address-text" onClick={handleCopyAddress} title="Click to copy">
            {truncateMiddle(address.address, 10, 8)}
            <span className="copy-icon">📋</span>
          </div>
          {address.lastScanned && (
            <div className="last-scanned">
              Last scanned: {formatRelativeTime(address.lastScanned)}
            </div>
          )}
        </div>
        <div className="address-summary">
          <div className="total-portfolio">
            <span className="total-label">Total Portfolio</span>
            <span className="total-amount">{formatUSD(totalUsdValue)}</span>
          </div>
          {onRemove && (
            <button className="remove-button" onClick={handleRemove}>
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="address-card-content">
        {networkBalances.map((networkBalance) => (
          <NetworkSection
            key={networkBalance.network.networkId}
            networkBalance={networkBalance}
          />
        ))}
      </div>
    </div>
  );
}

export default AddressCard;
