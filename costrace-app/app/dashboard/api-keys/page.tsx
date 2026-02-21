"use client"

import { useState, useEffect } from "react"
import { Copy, Key, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getApiKeys, createApiKey, deleteApiKey, type APIKey } from "@/api/api-keys"

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [keyName, setKeyName] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    getApiKeys()
      .then(({ data }) => setKeys(data))
      .catch((err) => console.error("Failed to fetch API keys:", err))
  }, [])

  async function handleCreate() {
    if (!keyName.trim()) return
    setCreating(true)
    try {
      const { data } = await createApiKey(keyName.trim())
      setKeys((prev) => [data, ...prev])
      setKeyName("")
      setShowCreate(false)
    } catch (err) {
      console.error("Failed to create API key:", err)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteApiKey(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
    } catch (err) {
      console.error("Failed to delete API key:", err)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2 md:hidden" />
          <h1 className="text-sm font-semibold">API Keys</h1>
        </div>
        <Button
          size="sm"
          className="gap-1.5 rounded-xs"
          onClick={() => setShowCreate(!showCreate)}
        >
          <Plus className="size-3.5" />
          Create key
        </Button>
      </header>

      <div className="flex-1 p-3">
        <div className="mx-auto max-w-9xl">
          <p className="text-sm text-muted-foreground">
            API keys authenticate your SDK with costrace. Keep them secret.
          </p>

          {showCreate && (
            <div className="mt-6 rounded-xs border bg-card p-5">
              <h3 className="text-sm font-semibold">Create a new API key</h3>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key name</Label>
                  <Input
                    id="key-name"
                    className="rounded-xs"
                    placeholder="e.g. production, development"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-xs"
                    onClick={handleCreate}
                    disabled={creating || !keyName.trim()}
                  >
                    {creating ? "Generating..." : "Generate"}
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xs"
                    variant="ghost"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {keys.length === 0 && !showCreate ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Key className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">No API keys yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first API key to start tracking costs from your LLM
                API calls.
              </p>
              <Button
                size="sm"
                className="mt-4 gap-1.5 rounded-xs p-2"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="size-3.5" />
                Create your first key
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-2">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between gap-3 rounded-xs border bg-card p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{k.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {k.key} &middot; Created{" "}
                      {new Date(k.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => copyToClipboard(k.key)}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-400 hover:text-red-400"
                      onClick={() => handleDelete(k.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
