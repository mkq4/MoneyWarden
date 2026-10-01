import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getApiStatus() {
  try {
    const res = await fetch(`${process.env.API_URL}/api/health`, {
      cache: "no-store",
    });
    if (!res.ok) return `error ${res.status}`;
    const data: { status: string; db: string } = await res.json();
    return `api: ${data.status}, db: ${data.db}`;
  } catch {
    return "api unreachable";
  }
}

export default async function Home() {
  const status = await getApiStatus();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">MoneyWarden</h1>
      <p className="text-muted-foreground font-mono text-sm">{status}</p>
      <Button>shadcn/ui works</Button>
    </main>
  );
}
