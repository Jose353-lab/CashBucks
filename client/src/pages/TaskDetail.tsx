import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useRoute, Link } from "wouter";
import { toast } from "sonner";

export default function TaskDetail() {
  const [, params] = useRoute("/tasks/:id");
  const taskId = parseInt(params?.id || "0");
  const { data: task } = trpc.tasks.getById.useQuery({ id: taskId });
  const completeMutation = trpc.tasks.complete.useMutation();
  const [proofText, setProofText] = useState("");

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync({ taskId, proofText });
      toast.success("Task completed! Reward will be credited after approval.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/tasks"><Button variant="ghost">← Back</Button></Link>
      <Card className="max-w-2xl mx-auto mt-4">
        <CardHeader><CardTitle>{task?.title}</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-4">{task?.description}</p>
          <div className="bg-emerald-50 p-4 rounded mb-4">
            <div className="text-2xl font-bold text-emerald-600">{task?.rewardAmount} CB Points</div>
          </div>
          {task?.requiresProof && (
            <div className="space-y-4">
              <Textarea placeholder="Enter proof or details..." value={proofText} onChange={(e) => setProofText(e.target.value)} />
              <Button onClick={handleComplete} disabled={completeMutation.isPending}>Complete Task</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}