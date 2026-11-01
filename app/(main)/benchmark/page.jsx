import { getBenchmark } from "@/actions/benchmark";
import BenchmarkView from "./_components/benchmark-view";

export default async function BenchmarkPage() {
  const benchmark = await getBenchmark();

  return (
    <div>
      <h1 className="text-6xl font-bold gradient-title mb-2">Peer Benchmark</h1>
      <p className="text-muted-foreground mb-6">
        See how your last 30 days compare with other people in your field.
      </p>
      <BenchmarkView benchmark={benchmark} />
    </div>
  );
}
