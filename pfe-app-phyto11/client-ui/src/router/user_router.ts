export const user_router = {
  path: "/user",
  name: "user",
  meta: {
    requiresAuth: true,
  },
  component: () =>
    import(
      /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/userLayout.vue"
    ),
  children: [
    {
      path: "users",
      meta: {
        requiresAuth: true,
      },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "user-list-user",
          component: () =>
            import(
              /* webpackChunkName: "list-user" */ "@/views/main/user/UserList.vue"
            ),
        },
        {
          path: "create",
          name: "user-create-user",
          component: () =>
            import(
              /* webpackChunkName: "create-user" */ "@/views/main/user/UserCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "user-edit-user",
          component: () =>
            import(
              /* webpackChunkName: "edit-user" */ "@/views/main/user/UserEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "user-detail-user",
          component: () =>
            import(
              /* webpackChunkName: "detail-user" */ "@/views/main/user/UserDetail.vue"
            ),
        },
        {
          path: "import",
          name: "user-import-data-user",
          component: () =>
            import(
              /* webpackChunkName: "import-data-user" */ "@/views/main/user/UserImportData.vue"
            ),
        },
      ],
    },
    {
      path: "appconfigs",
      meta: {
        requiresAuth: true,
      },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "user-list-appconfig",
          component: () =>
            import(
              /* webpackChunkName: "list-appConfig" */ "@/views/main/appConfig/AppConfigList.vue"
            ),
        },
        {
          path: "create",
          name: "user-create-appconfig",
          component: () =>
            import(
              /* webpackChunkName: "create-appConfig" */ "@/views/main/appConfig/AppConfigCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "user-edit-appconfig",
          component: () =>
            import(
              /* webpackChunkName: "edit-appConfig" */ "@/views/main/appConfig/AppConfigEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "user-detail-appconfig",
          component: () =>
            import(
              /* webpackChunkName: "detail-appConfig" */ "@/views/main/appConfig/AppConfigDetail.vue"
            ),
        },
        {
          path: "import",
          name: "user-import-data-appconfig",
          component: () =>
            import(
              /* webpackChunkName: "import-data-appConfig" */ "@/views/main/appConfig/AppConfigImportData.vue"
            ),
        },
      ],
    },
    {
      path: "projects",
      meta: {
        requiresAuth: true,
      },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "user-list-project",
          component: () =>
            import(
              /* webpackChunkName: "list-project" */ "@/views/main/project/ProjectList.vue"
            ),
        },
        {
          path: "create",
          name: "user-create-project",
          component: () =>
            import(
              /* webpackChunkName: "create-project" */ "@/views/main/project/ProjectCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "user-edit-project",
          component: () =>
            import(
              /* webpackChunkName: "edit-project" */ "@/views/main/project/ProjectEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "user-detail-project",
          component: () =>
            import(
              /* webpackChunkName: "detail-project" */ "@/views/main/project/ProjectDetail.vue"
            ),
        },
        {
          path: "import",
          name: "user-import-data-project",
          component: () =>
            import(
              /* webpackChunkName: "import-data-project" */ "@/views/main/project/ProjectImportData.vue"
            ),
        },
      ],
    },
    {
      path: "images",
      meta: {
        requiresAuth: true,
      },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "user-list-image",
          component: () =>
            import(
              /* webpackChunkName: "list-image" */ "@/views/main/image/ImageList.vue"
            ),
        },
        {
          path: "create",
          name: "user-create-image",
          component: () =>
            import(
              /* webpackChunkName: "create-image" */ "@/views/main/image/ImageCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "user-edit-image",
          component: () =>
            import(
              /* webpackChunkName: "edit-image" */ "@/views/main/image/ImageEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "user-detail-image",
          component: () =>
            import(
              /* webpackChunkName: "detail-image" */ "@/views/main/image/ImageDetail.vue"
            ),
        },
        {
          path: "import",
          name: "user-import-data-image",
          component: () =>
            import(
              /* webpackChunkName: "import-data-image" */ "@/views/main/image/ImageImportData.vue"
            ),
        },
      ],
    },
    {
      path: "aimodels",
      meta: {
        requiresAuth: true,
      },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "user-list-aimodel",
          component: () =>
            import(
              /* webpackChunkName: "list-aiModel" */ "@/views/main/aiModel/AiModelList.vue"
            ),
        },
        {
          path: "create",
          name: "user-create-aimodel",
          component: () =>
            import(
              /* webpackChunkName: "create-aiModel" */ "@/views/main/aiModel/AiModelCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "user-edit-aimodel",
          component: () =>
            import(
              /* webpackChunkName: "edit-aiModel" */ "@/views/main/aiModel/AiModelEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "user-detail-aimodel",
          component: () =>
            import(
              /* webpackChunkName: "detail-aiModel" */ "@/views/main/aiModel/AiModelDetail.vue"
            ),
        },
        {
          path: "import",
          name: "user-import-data-aimodel",
          component: () =>
            import(
              /* webpackChunkName: "import-data-aiModel" */ "@/views/main/aiModel/AiModelImportData.vue"
            ),
        },
      ],
    },
    {
      path: "annotations",
      meta: {
        requiresAuth: true,
      },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "user-list-annotation",
          component: () =>
            import(
              /* webpackChunkName: "list-annotation" */ "@/views/main/annotation/AnnotationList.vue"
            ),
        },
        {
          path: "create",
          name: "user-create-annotation",
          component: () =>
            import(
              /* webpackChunkName: "create-annotation" */ "@/views/main/annotation/AnnotationCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "user-edit-annotation",
          component: () =>
            import(
              /* webpackChunkName: "edit-annotation" */ "@/views/main/annotation/AnnotationEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "user-detail-annotation",
          component: () =>
            import(
              /* webpackChunkName: "detail-annotation" */ "@/views/main/annotation/AnnotationDetail.vue"
            ),
        },
        {
          path: "import",
          name: "user-import-data-annotation",
          component: () =>
            import(
              /* webpackChunkName: "import-data-annotation" */ "@/views/main/annotation/AnnotationImportData.vue"
            ),
        },
      ],
    },
    {
      path: "collaborators",
      meta: {
        requiresAuth: true,
      },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "user-list-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "list-collaborator" */ "@/views/main/collaborator/CollaboratorList.vue"
            ),
        },
        {
          path: "create",
          name: "user-create-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "create-collaborator" */ "@/views/main/collaborator/CollaboratorCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "user-edit-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "edit-collaborator" */ "@/views/main/collaborator/CollaboratorEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "user-detail-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "detail-collaborator" */ "@/views/main/collaborator/CollaboratorDetail.vue"
            ),
        },
        {
          path: "import",
          name: "user-import-data-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "import-data-collaborator" */ "@/views/main/collaborator/CollaboratorImportData.vue"
            ),
        },
      ],
    },
  ],
};
