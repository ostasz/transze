import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import TerminalLayout from "@/app/terminal/layout"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = session?.user?.role

  if (role !== "ADMIN" && role !== "BACKOFFICE" && role !== "TRADER") {
    redirect("/")
  }

  return <TerminalLayout>{children}</TerminalLayout>
}
