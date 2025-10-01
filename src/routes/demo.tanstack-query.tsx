import { createRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import type { AnyRoute } from "@tanstack/react-router";

function TanStackQueryDemo() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      Promise.resolve([{ name: "John Doe" }, { name: "Jane Doe" }]),
    initialData: [],
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">People list from Swapi</h1>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: "/demo/tanstack-query",
    component: TanStackQueryDemo,
    getParentRoute: () => parentRoute,
  });
