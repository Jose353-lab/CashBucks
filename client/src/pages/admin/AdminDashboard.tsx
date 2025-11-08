import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats } = trpc.admin.getStats.useQuery();
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.totalUsers || 0}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Tasks</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.totalTasks || 0}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Pending Withdrawals</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.pendingWithdrawals || 0}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Pending Completions</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.pendingCompletions || 0}</div></CardContent></Card>
      </div>
      <div className="flex gap-4">
        <Link href="/admin/users"><Button>Manage Users</Button></Link>
        <Link href="/admin/tasks"><Button>Manage Tasks</Button></Link>
        <Link href="/admin/withdrawals"><Button>Manage Withdrawals</Button></Link>
        <Link href="/admin/settings"><Button>Settings</Button></Link>
      </div>
    </div>
  );
}