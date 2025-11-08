import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Tasks() {
  const { isAuthenticated } = useAuth();
  const { data: tasks, isLoading } = trpc.tasks.getAvailable.useQuery({ limit: 50 }, { enabled: isAuthenticated });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4"><Link href="/dashboard"><Button variant="ghost">← Back</Button></Link></header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Available Tasks</h1>
        {isLoading ? <Loader2 className="animate-spin" /> : (
          <div className="grid md:grid-cols-3 gap-4">
            {tasks?.map(task => (
              <Card key={task.id}>
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>{task.description?.substring(0, 100)}...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-emerald-600 font-bold">{task.rewardAmount} CB Points</div>
                    <Link href={`/tasks/${task.id}`}><Button size="sm">View Task</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}