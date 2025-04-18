import { AddTenantForm } from "~/components/ui/forms/AddTenantForm";
import { getUnits } from "~/server/actions";

type Params = Promise<{ id: string }>;

export default async function AddTenant({ params }: { params: Params }) {
  const { id } = await params;
  const units = await getUnits(id);

  return (
    <div>
      <h1 className="my-4 text-2xl font-bold">Add Tenant</h1>
      <div className="max-w-xl">
        <AddTenantForm units={units} />
      </div>
    </div>
  );
}
