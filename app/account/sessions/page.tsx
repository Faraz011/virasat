import { redirect } from "next/navigation"
import { getCurrentUser, getUserSessions } from "@/lib/auth"
import { SessionsList } from "@/components/sessions-list"

export const metadata = {
  title: "Manage Sessions - Virasat",
  description: "View and manage your active sessions across devices",
}

export default async function SessionsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const sessions = await getUserSessions(user.id)

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Device Management</h1>
        <p className="text-muted-foreground">View and manage your active sessions across all devices.</p>
      </div>

      <SessionsList initialSessions={sessions} />
    </div>
  )
}
