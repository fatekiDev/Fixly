export type UserRole = "member" | "manager" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type MockAccount = {
  user: AuthUser;
  password: string;
};

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    user: {
      id: "demo-member",
      name: "Ana Miembro",
      email: "miembro@fixly.cl",
      role: "member",
    },
    password: "1234",
  },
  {
    user: {
      id: "demo-manager",
      name: "Luis Encargado",
      email: "encargado@fixly.cl",
      role: "manager",
    },
    password: "1234",
  },
  {
    user: {
      id: "demo-admin",
      name: "Admin Fixly",
      email: "admin@fixly.cl",
      role: "admin",
    },
    password: "1234",
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  member: "Miembro",
  manager: "Encargado",
  admin: "Administrador",
};
