import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminTasks() {
  const { data: tasks, refetch } = trpc.admin.getPendingTasks.useQuery();
  const approveMutation = trpc.admin.approveTask.useMutation();
  const rejectMutation = trpc.admin.rejectTask.useMutation();

  const handleApprove = async (taskId: number) => {
    await approveMutation.mutateAsync({ taskId });
    toast.success("Task approved!");
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/admin"><Button variant="ghost">← Back</Button></Link>
      <Card className="mt-4">
        <CardHeader><CardTitle>Pending Tasks</CardTitle></CardHeader>
        <CardContent>
          {tasks?.map(task => (
            <div key={task.id} className="border-b py-4">
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => handleApprove(task.id)}>Approve</Button>
                <Button size="sm" variant="destructive">Reject</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}