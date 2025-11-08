import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function AdminSettings() {
  const { data: settings } = trpc.admin.getSettings.useQuery();
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/admin"><Button variant="ghost">← Back</Button></Link>
      <Card className="mt-4">
        <CardHeader><CardTitle>Platform Settings</CardTitle></CardHeader>
        <CardContent>
          {settings?.map(s => (
            <div key={s.id} className="border-b py-2">
              <div className="font-medium">{s.key}</div>
              <div className="text-sm text-gray-600">{s.value}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}