import { Routes } from "@angular/router";
import { TabsPage } from "./tabs-page";

export const TABS_ROUTES: Routes = [
  {
    path: "tabs",
    component: TabsPage,
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("../dashboard/dashboard.page").then((m) => m.DashboardPage),
      },
      {
        path: "schedule",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("../schedule/schedule").then((m) => m.SchedulePage),
          },
          // {
          //   path: "session/:sessionId",
          //   loadComponent: () =>
          //     import("../session-detail/session-detail").then(
          //       (m) => m.SessionDetailPage
          //     ),
          // },
        ],
      },
      {
        path: "guard-list",
        loadComponent: () =>
          import("../guard-list/guard-list.page").then((m) => m.GuardListPage),
      },
      {
        path: "speakers",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("../speaker-list/speaker-list").then(
                (m) => m.SpeakerListPage
              ),
          },
          {
            path: "session/:sessionId",
            loadComponent: () =>
              import("../session-detail/session-detail").then(
                (m) => m.SessionDetailPage
              ),
          },
          {
            path: "speaker-details/:speakerId",
            loadComponent: () =>
              import("../speaker-detail/speaker-detail").then(
                (m) => m.SpeakerDetailPage
              ),
          },
        ],
      },
      {
        path: "map",
        loadComponent: () => import("../map/map").then((m) => m.MapPage),
      },
      {
        path: "about",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("../about/about").then((m) => m.AboutPage),
          },
        ],
      },

      {
        path: "",
        redirectTo: "/app/tabs/dashboard",
        pathMatch: "full",
      },
    ],
  },
];
