import TopBar from "@/components/TopBar";
import * as db from "@/lib/db";
import ChatUI from "./ChatUI";

export default async function MessagesPage() {
  const messages = db.getMessages();
  const tenants = db.getTenants();
  
  return (
    <>
      <ChatUI initialMessages={messages} tenants={tenants} />
    </>
  );
}
