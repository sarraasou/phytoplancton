export const admin_router = {
  path: "/admin",
  name: "admin",
  meta: { requiresAuth: true },
  component: () =>
    import("@/components/layouts/mainLayout/adminLayout.vue"),
  children: [
    {
      path: "users",
      meta: { requiresAuth: true },
      component: () =>
        import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        {
          path: "",
          name: "admin-list-user",
          component: () => import("@/views/main/user/UserList.vue"),
        },
        {
          path: "create",
          name: "admin-create-user",
          component: () => import("@/views/main/user/UserCreate.vue"),
        },
        {
          path: "pending",
          name: "admin-pending-users",
          meta: { requiresAuth: true },
          component: () => import("@/views/admin/users/PendingUsers.vue"),
        },
        {
          path: "import",
          name: "admin-import-data-user",
          component: () => import("@/views/main/user/UserImportData.vue"),
        },
        {
          path: "edit/:id",
          name: "admin-edit-user",
          component: () => import("@/views/main/user/UserEdit.vue"),
        },
        {
          path: ":id",
          name: "admin-detail-user",
          component: () => import("@/views/main/user/UserDetail.vue"),
        },
      ],
    },
    {
      path: "appconfigs",
      meta: { requiresAuth: true },
      component: () =>
        import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        {
          path: "",
          name: "admin-list-appconfig",
          component: () => import("@/views/main/appConfig/AppConfigList.vue"),
        },
        {
          path: "create",
          name: "admin-create-appconfig",
          component: () => import("@/views/main/appConfig/AppConfigCreate.vue"),
        },
        {
          path: "edit/:id",
          name: "admin-edit-appconfig",
          component: () => import("@/views/main/appConfig/AppConfigEdit.vue"),
        },
        {
          path: "import",
          name: "admin-import-data-appconfig",
          component: () => import("@/views/main/appConfig/AppConfigImportData.vue"),
        },
        {
          path: ":id",
          name: "admin-detail-appconfig",
          component: () => import("@/views/main/appConfig/AppConfigDetail.vue"),
        },
      ],
    },
    {
      path: "projects",
      meta: { requiresAuth: true },
      component: () =>
        import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        {
          path: "",
          name: "admin-list-project",
          component: () => import("@/views/main/project/ProjectList.vue"),
        },
        {
          path: "create",
          name: "admin-create-project",
          component: () => import("@/views/main/project/ProjectCreate.vue"),
        },
        {
          path: "edit/:id",
          name: "admin-edit-project",
          component: () => import("@/views/main/project/ProjectEdit.vue"),
        },
        {
          path: "import",
          name: "admin-import-data-project",
          component: () => import("@/views/main/project/ProjectImportData.vue"),
        },
        // ✅ ROUTE POUR LES PERMISSIONS (doit être AVANT :id)
        {
          path: ":id/permissions",
          name: "admin-project-permissions",
          meta: { requiresAuth: true },
          component: () => import("@/views/main/project/ProjectPermissions.vue"),
        },
        {
          path: ":id",
          name: "admin-detail-project",
          component: () => import("@/views/main/project/ProjectDetail.vue"),
        },
      ],
    },
    {
      path: "images",
      meta: { requiresAuth: true },
      component: () =>
        import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        {
          path: "",
          name: "admin-list-image",
          component: () => import("@/views/main/image/ImageList.vue"),
        },
        {
          path: "create",
          name: "admin-create-image",
          component: () => import("@/views/main/image/ImageCreate.vue"),
        },
        {
          path: "edit/:id",
          name: "admin-edit-image",
          component: () => import("@/views/main/image/ImageEdit.vue"),
        },
        {
          path: "import",
          name: "admin-import-data-image",
          component: () => import("@/views/main/image/ImageImportData.vue"),
        },
        {
          path: ":id",
          name: "admin-detail-image",
          component: () => import("@/views/main/image/ImageDetail.vue"),
        },
      ],
    },
    {
      path: "aimodels",
      meta: { requiresAuth: true },
      component: () =>
        import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        {
          path: "",
          name: "admin-list-aimodel",
          component: () => import("@/views/main/aiModel/AiModelList.vue"),
        },
        {
          path: "create",
          name: "admin-create-aimodel",
          component: () => import("@/views/main/aiModel/AiModelCreate.vue"),
        },
        {
          path: "edit/:id",
          name: "admin-edit-aimodel",
          component: () => import("@/views/main/aiModel/AiModelEdit.vue"),
        },
        {
          path: "import",
          name: "admin-import-data-aimodel",
          component: () => import("@/views/main/aiModel/AiModelImportData.vue"),
        },
        {
          path: ":id",
          name: "admin-detail-aimodel",
          component: () => import("@/views/main/aiModel/AiModelDetail.vue"),
        },
      ],
    },
    {
      path: "annotations",
      meta: { requiresAuth: true },
      component: () =>
        import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        {
          path: "",
          name: "admin-list-annotation",
          component: () => import("@/views/main/annotation/AnnotationList.vue"),
        },
        {
          path: "create",
          name: "admin-create-annotation",
          component: () => import("@/views/main/annotation/AnnotationCreate.vue"),
        },
        {
          path: "edit/:id",
          name: "admin-edit-annotation",
          component: () => import("@/views/main/annotation/AnnotationEdit.vue"),
        },
        {
          path: "import",
          name: "admin-import-data-annotation",
          component: () => import("@/views/main/annotation/AnnotationImportData.vue"),
        },
        {
          path: ":id",
          name: "admin-detail-annotation",
          component: () => import("@/views/main/annotation/AnnotationDetail.vue"),
        },
      ],
    },
    {
      path: "collaborators",
      meta: { requiresAuth: true },
      component: () =>
        import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        {
          path: "",
          name: "admin-list-collaborator",
          component: () => import("@/views/main/collaborator/CollaboratorList.vue"),
        },
        {
          path: "create",
          name: "admin-create-collaborator",
          component: () => import("@/views/main/collaborator/CollaboratorCreate.vue"),
        },
        {
          path: "edit/:id",
          name: "admin-edit-collaborator",
          component: () => import("@/views/main/collaborator/CollaboratorEdit.vue"),
        },
        {
          path: "import",
          name: "admin-import-data-collaborator",
          component: () => import("@/views/main/collaborator/CollaboratorImportData.vue"),
        },
        {
          path: ":id",
          name: "admin-detail-collaborator",
          component: () => import("@/views/main/collaborator/CollaboratorDetail.vue"),
        },
      ],
    },
  ],
}