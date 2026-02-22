"use client";

import { updateUser } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUserStore } from "@/stores/user-store";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, token, setAuth } = useUserStore();
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSaveEmail() {
    if (!email.trim()) return;
    setSaving(true);
    try {
      const { data } = await updateUser({ email: email.trim() });
      if (token) {
        setAuth(data, token);
      }
      toast.success("Email updated");
    } catch {
      toast.error("Failed to update email");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-6 backdrop-blur-sm">
        <SidebarTrigger className="-ml-2 md:hidden" />
        <h1 className="text-sm font-semibold">Settings</h1>
      </header>

      <div className="flex-1 p-3">
        <div className="mx-auto max-w-9xl space-y-3">
          <section className="rounded-xs border bg-card p-6">
            <h2 className="text-base font-semibold">Email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your email is used for team invitations and alert notifications.
              {!user?.email && (
                <span className="ml-1 text-amber-400">
                  Please add your email to receive notifications and team
                  invites.
                </span>
              )}
            </p>
            <div className="mt-4 flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  className="rounded-xs"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEmail()}
                />
              </div>
            </div>
            <div className="mt-3">
              <Button
                size="sm"
                className="rounded-xs"
                onClick={handleSaveEmail}
                disabled={saving || !email.trim() || email === user?.email}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </section>

          <section className="rounded-xs border bg-card p-6">
            <h2 className="text-base font-semibold">Notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure how you receive alerts.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xs border p-4">
                <div>
                  <p className="text-sm font-medium">Cost alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when spending exceeds a threshold.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xs">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-xs border p-4">
                <div>
                  <p className="text-sm font-medium">Weekly digest</p>
                  <p className="text-xs text-muted-foreground">
                    Receive a weekly summary of your API usage.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xs">
                  Configure
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-xs border border-red-500/20 bg-card p-6">
            <h2 className="text-base font-semibold text-red-400">
              Danger zone
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Irreversible actions for your account.
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all data.
                </p>
              </div>
              <Button variant="destructive" size="sm" className="rounded-xs">
                Delete account
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
