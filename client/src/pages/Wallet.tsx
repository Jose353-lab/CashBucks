import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Wallet() {
  const { data: wallet } = trpc.wallet.getBalance.useQuery();
  const { data: transactions } = trpc.wallet.getTransactions.useQuery({ limit: 20 });
  const withdrawMutation = trpc.wallet.requestWithdrawal.useMutation();
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");

  const handleWithdraw = async () => {
    try {
      await withdrawMutation.mutateAsync({ amount: parseInt(amount), phoneNumber: phone });
      toast.success("Withdrawal requested!");
      setAmount("");
      setPhone("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/dashboard"><Button variant="ghost">← Back</Button></Link>
      <div className="max-w-4xl mx-auto mt-4 space-y-4">
        <Card>
          <CardHeader><CardTitle>Wallet Balance</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-600">{wallet?.balance || 0} CB Points</div>
            <p className="text-gray-600">≈ Ksh {wallet?.balance || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Request Withdrawal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" placeholder="Amount (CB Points)" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input placeholder="M-Pesa Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Button onClick={handleWithdraw} disabled={withdrawMutation.isPending}>Request Withdrawal</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
          <CardContent>
            {transactions?.map(tx => (
              <div key={tx.id} className="flex justify-between py-2 border-b">
                <div><div className="font-medium">{tx.description}</div><div className="text-sm text-gray-600">{new Date(tx.createdAt).toLocaleDateString()}</div></div>
                <div className={tx.amount > 0 ? "text-emerald-600" : "text-red-600"}>{tx.amount > 0 ? "+" : ""}{tx.amount}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}