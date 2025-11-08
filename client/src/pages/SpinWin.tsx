import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";

export default function SpinWin() {
  const { data: rewards } = trpc.spin.getRewards.useQuery();
  const spinMutation = trpc.spin.spin.useMutation();

  const handleSpin = async () => {
    try {
      const result = await spinMutation.mutateAsync();
      if (result) toast.success(`You won: ${result.displayText}!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/dashboard"><Button variant="ghost">← Back</Button></Link>
      <Card className="max-w-2xl mx-auto mt-4">
        <CardHeader><CardTitle>Spin & Win</CardTitle></CardHeader>
        <CardContent className="text-center">
          <div className="w-64 h-64 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6">
            <div className="text-white text-4xl font-bold">🎰</div>
          </div>
          <Button size="lg" onClick={handleSpin} disabled={spinMutation.isPending}>Spin Now!</Button>
          <div className="mt-8 text-sm text-gray-600">
            <p>Possible Rewards:</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {rewards?.map(r => <div key={r.id} className="bg-gray-100 p-2 rounded">{r.displayText}</div>)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}