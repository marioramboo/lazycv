import { AIProviderConfig } from "@/components/settings/AIProviderConfig"
import { DataManagement } from "@/components/settings/DataManagement"

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your AI preferences and local data.
        </p>
      </div>
      
      <AIProviderConfig />
      <DataManagement />
    </div>
  )
}
