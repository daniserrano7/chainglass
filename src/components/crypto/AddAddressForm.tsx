import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { isValidAddress } from "@/services/rpcService"

interface AddAddressFormProps {
  onAdd?: (address: string, label: string) => void
  isLoading?: boolean
}

export function AddAddressForm({ onAdd, isLoading = false }: AddAddressFormProps) {
  const [address, setAddress] = useState("")
  const [label, setLabel] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate address
    if (!address.trim()) {
      setError("Please enter an address")
      return
    }

    if (!isValidAddress(address.trim())) {
      setError("Invalid Ethereum address format")
      return
    }

    // Call onAdd if provided
    if (onAdd) {
      onAdd(address.trim(), label.trim())
      setAddress("")
      setLabel("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Address</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[--color-text-secondary] mb-2 block">
              Address
            </label>
            <Input
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[--color-text-secondary] mb-2 block">
              Label (optional)
            </label>
            <Input
              placeholder="e.g., Hardware Wallet, MetaMask"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[--color-text-secondary] mb-2 block">
              Chain Family
            </label>
            <div className="bg-[--color-background-secondary] border border-[--color-border] rounded-lg px-3 py-2 text-sm">
              EVM (Ethereum Virtual Machine)
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!address || isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add & Scan Address
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
