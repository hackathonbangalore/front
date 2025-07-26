import { Routes } from "@angular/router";
import { canDeactivateSupportPage } from "./providers/can-deactivate-support.guard";
import { checkTutorialGuard } from "./providers/check-tutorial.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/tutorial",
    pathMatch: "full",
  },
  {
    path: "account",
    loadComponent: () =>
      import("./pages/account/account").then((c) => c.AccountPage),
  },
  {
    path: "support",
    loadComponent: () =>
      import("./pages/support/support").then((c) => c.SupportPage),
    canDeactivate: [canDeactivateSupportPage],
  },
  {
    path: "login",
    loadComponent: () => import("./pages/login/login").then((c) => c.LoginPage),
  },
  {
    path: "signup",
    loadComponent: () =>
      import("./pages/signup/signup").then((c) => c.SignupPage),
  },
  {
    path: "app",
    loadChildren: () =>
      import("./pages/tabs-page/routes").then((c) => c.TABS_ROUTES),
  },
  {
    path: "tutorial",
    loadComponent: () =>
      import("./pages/tutorial/tutorial").then((c) => c.TutorialPage),
    canMatch: [checkTutorialGuard],
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard/dashboard.page").then((m) => m.DashboardPage),
  },
];
