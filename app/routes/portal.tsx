import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/admin");
}

export default function Portal() {
  return null;
}
