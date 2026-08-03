"use client";

import { createContext, useContext } from "react";

const AdminRoleContext = createContext<string | undefined>(undefined);

export function AdminRoleProvider({
  role,
  children,
}: {
  role: string | undefined;
  children: React.ReactNode;
}) {
  return <AdminRoleContext.Provider value={role}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole() {
  return useContext(AdminRoleContext);
}
