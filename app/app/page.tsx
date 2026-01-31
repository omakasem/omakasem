import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <Card className="max-w-2xl">
        <CardContent className="p-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-xl font-semibold">FastAPI 실무 배우기</h2>
          </div>

          <div className="mt-8">
            <div className="text-6xl font-bold">45%</div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[45%] bg-success" />
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
