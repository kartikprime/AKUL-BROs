import Link from "next/link";
import { Shell } from "@/components/shell";

export default function NotFound() {
  return (
    <Shell>
      <div className="card p-6 text-center">
        <h1 className="page-heading">PAGE NOT FOUND</h1>
        <Link href="/villages" className="btn btn-primary mt-6">
          GO TO VILLAGES
        </Link>
      </div>
    </Shell>
  );
}
