import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogoutButton } from "@/components/logout-button"

export const metadata = {
  title: "My Account - Virasat",
  description: "Manage your account, orders, and addresses",
}

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.first_name}! Manage your account, orders, and addresses.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="text-sm font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="text-sm font-medium">{user.email}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="text-sm font-medium">{user.phone || "Not provided"}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/settings">Edit Profile</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Track and manage your recent purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">You have no recent orders.</div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/orders">View All Orders</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Manage your shipping and billing addresses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">You have no saved addresses.</div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/addresses">Manage Addresses</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account settings and security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/settings">Account Settings</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/password">Change Password</Link>
                </Button>
                <LogoutButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View and track all your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                <Button asChild>
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Your Addresses</CardTitle>
              <CardDescription>Manage your shipping and billing addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't added any addresses yet.</p>
                <Button>Add New Address</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p className="text-sm text-muted-foreground">Update your personal details and contact information.</p>
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Security</h3>
                <p className="text-sm text-muted-foreground">Update your password and security preferences.</p>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Communication Preferences</h3>
                <p className="text-sm text-muted-foreground">Manage your email preferences and notifications.</p>
                <Button variant="outline" size="sm">
                  Update Preferences
                </Button>
              </div>

              <div className="pt-4">
                <LogoutButton variant="destructive" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
