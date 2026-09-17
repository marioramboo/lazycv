"use client"

import { useState, useEffect } from "react"
import { useSettingsStore } from "@/stores/settings-store"
import { AIProviderType } from "@/types/ai"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react"

import { toast } from "sonner"

const modelsByProvider: Record<AIProviderType, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"],
  anthropic: ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
  gemini: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"],
  ollama: ["llama3", "mistral", "codellama"],
  nvidia: [
    "deepseek-ai/deepseek-r1",
    "mistralai/mistral-large-2-instruct",
    "meta/llama-3.1-70b-instruct",
    "meta/llama-3.1-8b-instruct",
  ],
}

const isDeprecatedNvidiaModel = (m: string) =>
  m === "meta/llama-3.3-70b-instruct" ||
  m === "nvidia/llama-3.1-nemotron-70b-instruct" ||
  m === "deepseek-ai/deepseek-v4-flash-0731" ||
  !m;

export function AIProviderConfig() {
  const { aiProvider, apiKey, model, ollamaBaseUrl, setProvider, setApiKey, setModel, setOllamaBaseUrl } = useSettingsStore()
  
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  
  const [localKey, setLocalKey] = useState(apiKey)
  const [localOllamaUrl, setLocalOllamaUrl] = useState(ollamaBaseUrl)
  const [localModelOllama, setLocalModelOllama] = useState(aiProvider === 'ollama' ? model : 'llama3') 
  const [localModelNvidia, setLocalModelNvidia] = useState(
    aiProvider === 'nvidia' && !isDeprecatedNvidiaModel(model)
      ? model
      : 'deepseek-ai/deepseek-r1'
  )

  // Keep local state in sync when provider or store changes
  useEffect(() => {
    setLocalKey(apiKey)
  }, [aiProvider, apiKey])

  useEffect(() => {
    setLocalOllamaUrl(ollamaBaseUrl)
  }, [ollamaBaseUrl])

  useEffect(() => {
    if (aiProvider === 'nvidia') {
      setLocalModelNvidia(!isDeprecatedNvidiaModel(model) ? model : 'deepseek-ai/deepseek-r1')
    } else if (aiProvider === 'ollama') {
      setLocalModelOllama(model || 'llama3')
    }
  }, [aiProvider, model])

  const getActiveModel = () => {
    if (aiProvider === 'ollama') return localModelOllama
    if (aiProvider === 'nvidia') return localModelNvidia
    return model
  }

  const handleSave = () => {
    const trimmedKey = localKey.trim()
    const activeModel = getActiveModel()
    setApiKey(trimmedKey)
    setOllamaBaseUrl(localOllamaUrl.trim())
    setModel(activeModel)
    toast.success("Settings saved successfully!")
  }

  const testConnection = async () => {
    setTestStatus("testing")
    const trimmedKey = localKey.trim()
    try {
      if (aiProvider !== 'ollama' && !trimmedKey) throw new Error("API Key required")
      const currentModel = getActiveModel()
      
      const res = await fetch("/api/test-ai-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiProvider,
          apiKey: trimmedKey,
          model: currentModel,
          baseUrl: localOllamaUrl.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || "Connection test failed")
      }

      // Automatically persist verified settings to store
      setApiKey(trimmedKey)
      setOllamaBaseUrl(localOllamaUrl.trim())
      setModel(currentModel)

      setTestStatus("success")
      toast.success("Connection test successful! Settings saved.")
      setTimeout(() => setTestStatus("idle"), 3000)
    } catch (err: unknown) {
      console.error("Test connection failed:", err)
      const msg = err instanceof Error ? err.message : "Connection failed"
      setTestStatus("error")
      toast.error(`Connection failed: ${msg}`)
      setTimeout(() => setTestStatus("idle"), 5000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider Settings</CardTitle>
        <CardDescription>Configure the AI model used to generate and tailor your CVs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select 
            value={aiProvider} 
            onValueChange={(val) => {
              if (val) {
                setProvider(val as AIProviderType)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
              <SelectItem value="gemini">Google Gemini</SelectItem>
              <SelectItem value="ollama">Ollama (Local)</SelectItem>
              <SelectItem value="nvidia">Nvidia NIM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {aiProvider !== "ollama" && (
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <Input 
                type={showKey ? "text" : "password"} 
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="sk-..."
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {aiProvider === "ollama" && (
          <div className="space-y-2">
            <Label>Ollama Base URL</Label>
            <Input 
              value={localOllamaUrl}
              onChange={(e) => setLocalOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Model</Label>
          {aiProvider === "ollama" ? (
             <Input 
               value={localModelOllama}
               onChange={(e) => setLocalModelOllama(e.target.value)}
               placeholder="llama3"
             />
          ) : (
            <div className="space-y-2">
              <Select 
                value={aiProvider === 'nvidia' ? localModelNvidia : model} 
                onValueChange={(val) => {
                  if (!val) return;
                  if (aiProvider === 'nvidia') {
                    setLocalModelNvidia(val);
                    setModel(val);
                  } else {
                    setModel(val);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {modelsByProvider[aiProvider].map((m) => (
                     <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {aiProvider === "nvidia" && (
                <div className="pt-1">
                  <Label className="text-xs text-muted-foreground">Custom Nvidia NIM Model Identifier (Optional)</Label>
                  <Input 
                    value={localModelNvidia}
                    onChange={(e) => {
                      setLocalModelNvidia(e.target.value);
                      setModel(e.target.value);
                    }}
                    placeholder="deepseek-ai/deepseek-r1"
                    className="mt-1 text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Select an active model from the <a href="https://build.nvidia.com" target="_blank" rel="noreferrer" className="underline hover:text-foreground">NVIDIA API Catalog</a> (e.g. <code>deepseek-ai/deepseek-r1</code>) and ensure your key has Public API access.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" onClick={testConnection} disabled={testStatus === "testing"}>
          {testStatus === "testing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {testStatus === "success" && <Check className="mr-2 h-4 w-4 text-green-500" />}
          {testStatus === "error" && <X className="mr-2 h-4 w-4 text-red-500" />}
          Test Connection
        </Button>
        <Button onClick={handleSave}>Save Settings</Button>
      </CardFooter>
    </Card>
  )
}
