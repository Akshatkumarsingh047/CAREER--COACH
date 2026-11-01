import { BarLoader } from "react-spinners";
import { Suspense } from "react";
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title rounded-lg">Industry Insights</h1>
          <Link  href={"/onboarding"}> <span className="px-2 py-4 text-sm text-slate-400 bg-slate-800"> Edit</span></Link>
      </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}
      >
        {children}
      </Suspense>
    </div>
  );
}
