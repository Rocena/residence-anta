import { getUnits } from "@/lib/db";
import ResidenceClient from "./ResidenceClient";

export default async function ResidencePage() {
  const units = getUnits();
  return <ResidenceClient initialUnits={units} />;
}
