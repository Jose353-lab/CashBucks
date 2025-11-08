import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: profile } = trpc.user.getProfile.useQuery();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/dashboard"><Button variant="ghost">← Back</Button></Link>
      <Card className="max-w-2xl mx-auto mt-4">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div><label className="text-sm text-gray-600">Name</label><p className="font-medium">{user?.name}</p></div>
            <div><label className="text-sm text-gray-600">Email</label><p className="font-medium">{user?.email}</p></div>
            <div><label className="text-sm text-gray-600">VIP Level</label><p className="font-medium">{profile?.vipLevel?.name || 'Starter'}</p></div>
            <Button variant="destructive" onClick={() => logout()}>Logout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}