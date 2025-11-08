import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Star } from "lucide-react";
import { Link } from "wouter";

export default function VIP() {
  const { data: levels } = trpc.vip.getLevels.useQuery();
  const { data: myLevel } = trpc.vip.getMyLevel.useQuery();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/dashboard"><Button variant="ghost">← Back</Button></Link>
      <div className="max-w-6xl mx-auto mt-4">
        <h1 className="text-3xl font-bold mb-6">VIP Rewards Program</h1>
        {myLevel && (
          <Card className="mb-6 bg-emerald-600 text-white">
            <CardHeader><CardTitle>Your Current Level: {myLevel.name}</CardTitle></CardHeader>
            <CardContent><p>Reward Multiplier: {myLevel.taskRewardMultiplier / 100}x</p></CardContent>
          </Card>
        )}
        <div className="grid md:grid-cols-3 gap-4">
          {levels?.map(level => (
            <Card key={level.id}>
              <CardHeader>
                <Star className="w-8 h-8 text-emerald-600 mb-2" />
                <CardTitle>{level.name} (Level {level.level})</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Requirements:</p>
                <ul className="text-sm space-y-1">
                  <li>• {level.minTasks} tasks completed</li>
                  <li>• {level.minEarnings} CB Points earned</li>
                </ul>
                <p className="mt-4 font-bold text-emerald-600">{level.taskRewardMultiplier / 100}x Rewards</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}