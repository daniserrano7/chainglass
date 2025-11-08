import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddAddressFormProps {
  onAdd?: (address: string, label: string) => void
}

export function AddAddressForm({ onAdd }: AddAddressFormProps) {
  const [address, setAddress] = useState("")
  const [label, setLabel] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address && onAdd) {
      onAdd(address, label)
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

          <Button type="submit" className="w-full" disabled={!address}>
            <Plus className="w-4 h-4" />
            Add & Scan Address
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
