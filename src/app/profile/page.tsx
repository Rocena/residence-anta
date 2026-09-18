import TopBar from "@/components/TopBar";
import * as db from "@/lib/db";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const salaries = (db as any).getSalaries ? (db as any).getSalaries() : [];
  const rents = (db as any).getRents ? (db as any).getRents() : [];
  
  return (
    <>
      <ProfileClient salaries={salaries} rents={rents} />
    </>
  );
}
