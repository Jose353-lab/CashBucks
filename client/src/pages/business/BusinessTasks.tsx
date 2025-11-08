import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function BusinessTasks() {
  const { data: tasks } = trpc.business.getMyTasks.useQuery();
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/business"><Button variant="ghost">← Back</Button></Link>
      <Card className="mt-4">
        <CardHeader><CardTitle>My Tasks</CardTitle></CardHeader>
        <CardContent>
          {tasks?.map(task => (
            <div key={task.id} className="border-b py-4">
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-sm">{task.description}</p>
              <div className="mt-2 text-sm text-gray-600">
                Status: {task.status} | Reward: {task.rewardAmount} | Slots: {task.completedSlots}/{task.totalSlots}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}