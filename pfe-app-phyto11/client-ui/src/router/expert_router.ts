export const expert_router = {
  path: "/expert",
  name: "expert",
  meta: { requiresAuth: true },

  component: () =>
    import("@/components/layouts/mainLayout/userLayout.vue"),

  children: [
    // ================= USERS =================
    {
      path: "users",
      component: () => import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        { path: "", name: "expert-list-user", component: () => import("@/views/main/user/UserList.vue") },
        { path: "create", name: "expert-create-user", component: () => import("@/views/main/user/UserCreate.vue") },
        { path: "edit/:id", name: "expert-edit-user", component: () => import("@/views/main/user/UserEdit.vue") },
        { path: ":id", name: "expert-detail-user", component: () => import("@/views/main/user/UserDetail.vue") },
        { path: "import", name: "expert-import-user", component: () => import("@/views/main/user/UserImportData.vue") },
      ],
    },

    // ================= PROJECTS =================
    {
      path: "projects",
      component: () => import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        { path: "", name: "expert-list-project", component: () => import("@/views/main/project/ProjectList.vue") },
        { path: "create", name: "expert-create-project", component: () => import("@/views/main/project/ProjectCreate.vue") },
        { path: "edit/:id", name: "expert-edit-project", component: () => import("@/views/main/project/ProjectEdit.vue") },
        { path: ":id", name: "expert-detail-project", component: () => import("@/views/main/project/ProjectDetail.vue") },

        // 🔥 AI FEATURE IMPORTANT
        {
          path: ":id/permissions",
          name: "expert-project-permissions",
          component: () => import("@/views/main/project/ProjectPermissions.vue"),
        },

        { path: "import", name: "expert-import-project", component: () => import("@/views/main/project/ProjectImportData.vue") },
      ],
    },

    // ================= IMAGES =================
    {
      path: "images",
      component: () => import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        { path: "", name: "expert-list-image", component: () => import("@/views/main/image/ImageList.vue") },
        { path: "create", name: "expert-create-image", component: () => import("@/views/main/image/ImageCreate.vue") },
        { path: "edit/:id", name: "expert-edit-image", component: () => import("@/views/main/image/ImageEdit.vue") },
        { path: ":id", name: "expert-detail-image", component: () => import("@/views/main/image/ImageDetail.vue") },
        { path: "import", name: "expert-import-image", component: () => import("@/views/main/image/ImageImportData.vue") },
      ],
    },

    // ================= AI MODELS =================
    {
      path: "aimodels",
      component: () => import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        { path: "", name: "expert-list-aimodel", component: () => import("@/views/main/aiModel/AiModelList.vue") },
        { path: "create", name: "expert-create-aimodel", component: () => import("@/views/main/aiModel/AiModelCreate.vue") },
        { path: "edit/:id", name: "expert-edit-aimodel", component: () => import("@/views/main/aiModel/AiModelEdit.vue") },
        { path: ":id", name: "expert-detail-aimodel", component: () => import("@/views/main/aiModel/AiModelDetail.vue") },
        { path: "import", name: "expert-import-aimodel", component: () => import("@/views/main/aiModel/AiModelImportData.vue") },
      ],
    },

    // ================= ANNOTATIONS =================
    {
      path: "annotations",
      component: () => import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        { path: "", name: "expert-list-annotation", component: () => import("@/views/main/annotation/AnnotationList.vue") },
        { path: "create", name: "expert-create-annotation", component: () => import("@/views/main/annotation/AnnotationCreate.vue") },
        { path: "edit/:id", name: "expert-edit-annotation", component: () => import("@/views/main/annotation/AnnotationEdit.vue") },
        { path: ":id", name: "expert-detail-annotation", component: () => import("@/views/main/annotation/AnnotationDetail.vue") },
        { path: "import", name: "expert-import-annotation", component: () => import("@/views/main/annotation/AnnotationImportData.vue") },
      ],
    },

    // ================= COLLABORATORS =================
    {
      path: "collaborators",
      component: () => import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        { path: "", name: "expert-list-collaborator", component: () => import("@/views/main/collaborator/CollaboratorList.vue") },
        { path: "create", name: "expert-create-collaborator", component: () => import("@/views/main/collaborator/CollaboratorCreate.vue") },
        { path: "edit/:id", name: "expert-edit-collaborator", component: () => import("@/views/main/collaborator/CollaboratorEdit.vue") },
        { path: ":id", name: "expert-detail-collaborator", component: () => import("@/views/main/collaborator/CollaboratorDetail.vue") },
        { path: "import", name: "expert-import-collaborator", component: () => import("@/views/main/collaborator/CollaboratorImportData.vue") },
      ],
    },

    // ================= APP CONFIG =================
    {
      path: "appconfigs",
      component: () => import("@/components/layouts/mainLayout/Layout.vue"),
      children: [
        { path: "", name: "expert-list-appconfig", component: () => import("@/views/main/appConfig/AppConfigList.vue") },
        { path: "create", name: "expert-create-appconfig", component: () => import("@/views/main/appConfig/AppConfigCreate.vue") },
        { path: "edit/:id", name: "expert-edit-appconfig", component: () => import("@/views/main/appConfig/AppConfigEdit.vue") },
        { path: ":id", name: "expert-detail-appconfig", component: () => import("@/views/main/appConfig/AppConfigDetail.vue") },
        { path: "import", name: "expert-import-appconfig", component: () => import("@/views/main/appConfig/AppConfigImportData.vue") },
      ],
    },
  ],
};