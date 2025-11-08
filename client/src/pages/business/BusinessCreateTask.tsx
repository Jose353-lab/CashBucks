import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function BusinessCreateTask() {
  const [, setLocation] = useLocation();
  const createMutation = trpc.business.createTask.useMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        title,
        description,
        rewardAmount: parseInt(reward),
        totalSlots: 100
      });
      toast.success("Task created and submitted for approval!");
      setLocation("/business");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/business"><Button variant="ghost">← Back</Button></Link>
      <Card className="max-w-2xl mx-auto mt-4">
        <CardHeader><CardTitle>Create New Task</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label>Task Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label>Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><label>Reward (CB Points)</label><Input type="number" value={reward} onChange={(e) => setReward(e.target.value)} /></div>
          <Button onClick={handleCreate} disabled={createMutation.isPending}>Create Task</Button>
        </CardContent>
      </Card>
    </div>
  );
}