import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function AdminUsers() {
  const { data: users } = trpc.admin.getAllUsers.useQuery({ limit: 100 });
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/admin"><Button variant="ghost">← Back</Button></Link>
      <Card className="mt-4">
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full">
            <thead><tr><th className="text-left">Name</th><th className="text-left">Email</th><th className="text-left">VIP</th><th className="text-left">Role</th></tr></thead>
            <tbody>
              {users?.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="py-2">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.vipLevel}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}