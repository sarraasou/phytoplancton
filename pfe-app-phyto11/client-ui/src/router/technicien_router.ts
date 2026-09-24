export const technicien_router = {
  path: "/technicien",
  name: "technicien",
  meta: {
    requiresAuth: true,
  },
  component: () =>
    import(
      /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/userLayout.vue"
    ),
  children: [
    {
      path: "projects",
      meta: { requiresAuth: true },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "technicien-list-project",
          component: () =>
            import(
              /* webpackChunkName: "list-project" */ "@/views/main/project/ProjectList.vue"
            ),
        },
        {
          path: "create",
          name: "technicien-create-project",
          component: () =>
            import(
              /* webpackChunkName: "create-project" */ "@/views/main/project/ProjectCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "technicien-edit-project",
          component: () =>
            import(
              /* webpackChunkName: "edit-project" */ "@/views/main/project/ProjectEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "technicien-detail-project",
          component: () =>
            import(
              /* webpackChunkName: "detail-project" */ "@/views/main/project/ProjectDetail.vue"
            ),
        },
        {
          path: "import",
          name: "technicien-import-data-project",
          component: () =>
            import(
              /* webpackChunkName: "import-data-project" */ "@/views/main/project/ProjectImportData.vue"
            ),
        },
      ],
    },
    {
      path: "images",
      meta: { requiresAuth: true },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "technicien-list-image",
          component: () =>
            import(
              /* webpackChunkName: "list-image" */ "@/views/main/image/ImageList.vue"
            ),
        },
        {
          path: "create",
          name: "technicien-create-image",
          component: () =>
            import(
              /* webpackChunkName: "create-image" */ "@/views/main/image/ImageCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "technicien-edit-image",
          component: () =>
            import(
              /* webpackChunkName: "edit-image" */ "@/views/main/image/ImageEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "technicien-detail-image",
          component: () =>
            import(
              /* webpackChunkName: "detail-image" */ "@/views/main/image/ImageDetail.vue"
            ),
        },
        {
          path: "import",
          name: "technicien-import-data-image",
          component: () =>
            import(
              /* webpackChunkName: "import-data-image" */ "@/views/main/image/ImageImportData.vue"
            ),
        },
      ],
    },
    {
      path: "annotations",
      meta: { requiresAuth: true },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "technicien-list-annotation",
          component: () =>
            import(
              /* webpackChunkName: "list-annotation" */ "@/views/main/annotation/AnnotationList.vue"
            ),
        },
        {
          path: "create",
          name: "technicien-create-annotation",
          component: () =>
            import(
              /* webpackChunkName: "create-annotation" */ "@/views/main/annotation/AnnotationCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "technicien-edit-annotation",
          component: () =>
            import(
              /* webpackChunkName: "edit-annotation" */ "@/views/main/annotation/AnnotationEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "technicien-detail-annotation",
          component: () =>
            import(
              /* webpackChunkName: "detail-annotation" */ "@/views/main/annotation/AnnotationDetail.vue"
            ),
        },
        {
          path: "import",
          name: "technicien-import-data-annotation",
          component: () =>
            import(
              /* webpackChunkName: "import-data-annotation" */ "@/views/main/annotation/AnnotationImportData.vue"
            ),
        },
      ],
    },
    {
      path: "collaborators",
      meta: { requiresAuth: true },
      component: () =>
        import(
          /* webpackChunkName: "layout" */ "@/components/layouts/mainLayout/Layout.vue"
        ),
      children: [
        {
          path: "",
          name: "technicien-list-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "list-collaborator" */ "@/views/main/collaborator/CollaboratorList.vue"
            ),
        },
        {
          path: "create",
          name: "technicien-create-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "create-collaborator" */ "@/views/main/collaborator/CollaboratorCreate.vue"
            ),
        },
        {
          path: "edit/:id",
          name: "technicien-edit-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "edit-collaborator" */ "@/views/main/collaborator/CollaboratorEdit.vue"
            ),
        },
        {
          path: ":id",
          name: "technicien-detail-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "detail-collaborator" */ "@/views/main/collaborator/CollaboratorDetail.vue"
            ),
        },
        {
          path: "import",
          name: "technicien-import-data-collaborator",
          component: () =>
            import(
              /* webpackChunkName: "import-data-collaborator" */ "@/views/main/collaborator/CollaboratorImportData.vue"
            ),
        },
      ],
    },
  ],
};