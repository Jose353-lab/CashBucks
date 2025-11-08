import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function BusinessDashboard() {
  const { data: profile } = trpc.business.getProfile.useQuery();
  const { data: tasks } = trpc.business.getMyTasks.useQuery();
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-6">Business Dashboard</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>{profile?.businessName || "Business Profile"}</CardTitle></CardHeader>
        <CardContent><p>Wallet Balance: {profile?.walletBalance || 0} CB Points</p></CardContent>
      </Card>
      <div className="flex gap-4 mb-6">
        <Link href="/business/tasks/create"><Button>Create New Task</Button></Link>
        <Link href="/business/tasks"><Button variant="outline">View My Tasks</Button></Link>
      </div>
      <Card>
        <CardHeader><CardTitle>My Tasks ({tasks?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {tasks?.map(task => (
            <div key={task.id} className="border-b py-2">
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-gray-600">Status: {task.status} | Completed: {task.completedSlots}/{task.totalSlots}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}