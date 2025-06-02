"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Laptop, Smartphone, Tablet, Monitor, Clock, MapPin, Globe, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Session = {
  id: number
  token_id: string
  device_type: string
  device_name: string
  browser: string
  ip_address: string | null
  location: string | null
  last_active: string
  created_at: string
  is_current: boolean
}

export function SessionsList({ initialSessions }: { initialSessions: Session[] }) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [isLoading, setIsLoading] = useState(false)
  const [isRevokeAllDialogOpen, setIsRevokeAllDialogOpen] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />
      case "tablet":
        return <Tablet className="h-5 w-5" />
      case "desktop":
        return <Monitor className="h-5 w-5" />
      default:
        return <Laptop className="h-5 w-5" />
    }
  }

  const handleRevoke = async (session: Session) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/account/sessions/${session.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke session")
      }

      if (data.isCurrentSession) {
        toast({
          title: "Session revoked",
          description: "You have been logged out from this device.",
        })
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      } else {
        toast({
          title: "Session revoked",
          description: "The device has been logged out successfully.",
        })
        // Remove the session from the list
        setSessions(sessions.filter((s) => s.id !== session.id))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setSessionToRevoke(null)
    }
  }

  const handleRevokeAll = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/account/sessions/revoke-all", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke sessions")
      }

      toast({
        title: "Sessions revoked",
        description: "All other devices have been logged out successfully.",
      })

      // Keep only the current session
      setSessions(sessions.filter((session) => session.is_current))
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke sessions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRevokeAllDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Active Sessions</h2>
          <p className="text-sm text-muted-foreground">
            You are currently signed in on {sessions.length} {sessions.length === 1 ? "device" : "devices"}.
          </p>
        </div>
        {sessions.length > 1 && (
          <Button variant="outline" onClick={() => setIsRevokeAllDialogOpen(true)} disabled={isLoading}>
            <Shield className="mr-2 h-4 w-4" />
            Sign out all other devices
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sessions.map((session) => (
          <Card key={session.id} className={session.is_current ? "border-primary/50" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(session.device_type)}
                  <div>
                    <CardTitle className="text-base">{session.device_name}</CardTitle>
                    <CardDescription>{session.browser}</CardDescription>
                  </div>
                </div>
                {session.is_current && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Current</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Active {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}</span>
                </div>
                {session.ip_address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{session.ip_address}</span>
                  </div>
                )}
                {session.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{session.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setSessionToRevoke(session)}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                {session.is_current ? "Sign out" : "Revoke"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No active sessions found.</p>
        </div>
      )}

      <AlertDialog open={!!sessionToRevoke} onOpenChange={(open) => !open && setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{sessionToRevoke?.is_current ? "Sign out?" : "Revoke session?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {sessionToRevoke?.is_current
                ? "You will be signed out from this device and will need to sign in again."
                : `This will sign out the session on ${sessionToRevoke?.device_name}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                sessionToRevoke && handleRevoke(sessionToRevoke)
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Revoking..." : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRevokeAllDialogOpen} onOpenChange={setIsRevokeAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out all other devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out all sessions except your current one. Other devices will need to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleRevokeAll()
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Signing out..." : "Sign out all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
