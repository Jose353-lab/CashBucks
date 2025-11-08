import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminWithdrawals() {
  const { data: withdrawals, refetch } = trpc.admin.getPendingWithdrawals.useQuery();
  const approveMutation = trpc.admin.approveWithdrawal.useMutation();

  const handleApprove = async (withdrawalId: number) => {
    await approveMutation.mutateAsync({ withdrawalId });
    toast.success("Withdrawal approved!");
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/admin"><Button variant="ghost">← Back</Button></Link>
      <Card className="mt-4">
        <CardHeader><CardTitle>Pending Withdrawals</CardTitle></CardHeader>
        <CardContent>
          {withdrawals?.map(w => (
            <div key={w.id} className="border-b py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Amount: {w.amount} CB Points</p>
                <p className="text-sm text-gray-600">Phone: {w.phoneNumber}</p>
              </div>
              <Button size="sm" onClick={() => handleApprove(w.id)}>Approve</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}