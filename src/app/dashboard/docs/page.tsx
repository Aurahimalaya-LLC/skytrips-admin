
import RouteDocs from "@/components/dashboard/docs/RouteDocs";

export const metadata = {
  title: "Route Documentation | Skytrips Admin",
  description: "Comprehensive guide to application routes and API endpoints.",
};

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <RouteDocs />
    </div>
  );
}
