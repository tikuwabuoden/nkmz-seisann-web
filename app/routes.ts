import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("groups", "routes/group-list.tsx"),
  route("groups/new", "routes/group-create.tsx"),
  route("groups/:groupId", "routes/group-detail.tsx"),
  route("groups/:groupId/participants", "routes/participant-management.tsx"),
  route("groups/:groupId/expenses/new", "routes/expense-create.tsx"),
  route("groups/:groupId/expenses/:expenseId/edit", "routes/expense-edit.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
