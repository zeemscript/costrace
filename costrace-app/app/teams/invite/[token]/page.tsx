"use client";

import { CheckCircle, Users, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { acceptInvitation, declineInvitation } from "@/api/teams";
import { getCurrentUser } from "@/api/user";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { isAuthenticated, updateUser } = useUserStore();
  const [status, setStatus] = useState<
    "idle" | "accepting" | "accepted" | "declined" | "error"
  >("idle");
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  async function handleAccept() {
    setStatus("accepting");
    try {
      await acceptInvitation(token);
      // Refresh user data to get updated teams list
      const { data: freshUser } = await getCurrentUser();
      updateUser(freshUser);
      setStatus("accepted");
      toast.success("Invitation accepted");
      setTimeout(() => router.push("/dashboard/team"), 2000);
    } catch (err: unknown) {
      setStatus("error");
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to accept invitation";
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleDecline() {
    try {
      await declineInvitation(token);
      setStatus("declined");
      toast.success("Invitation declined");
    } catch {
      setError("Failed to decline invitation");
      toast.error("Failed to decline invitation");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
            <Users className="size-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Team Invitation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with GitHub to accept this team invitation.
          </p>
          <Button
            className="mt-6 w-full rounded-xs"
            onClick={() => (window.location.href = `${backendUrl}/auth/github`)}
          >
            Sign in with GitHub
          </Button>
        </div>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-sm text-center">
          <CheckCircle className="mx-auto size-12 text-emerald-400" />
          <h2 className="mt-4 text-lg font-semibold">Invitation Accepted</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting to your team dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-sm text-center">
          <XCircle className="mx-auto size-12 text-zinc-400" />
          <h2 className="mt-4 text-lg font-semibold">Invitation Declined</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You have declined the team invitation.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-xs"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Team Invitation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You have been invited to join a team on Costrace.
        </p>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-6 flex gap-3">
          <Button
            className="flex-1 rounded-xs"
            onClick={handleAccept}
            disabled={status === "accepting"}
          >
            {status === "accepting" ? "Accepting..." : "Accept"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xs"
            onClick={handleDecline}
            disabled={status === "accepting"}
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
