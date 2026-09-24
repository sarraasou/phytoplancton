import { computed } from 'vue'
import { useAuthStore } from '@/store/useAuth'

export default function useDocMenuConfig() {

  // ✅ DANS la fonction
  const authStore = useAuthStore()
  const role = computed(() =>
    authStore.currentUser?.userRole?.toLowerCase() ||
    authStore.currentUser?.role?.toLowerCase()     ||
    'user'
  )

  const DocMenuConfig = computed(() => [
    // ── Home + Dashboard ──────────────────────────────────
    {
      pages: [
        {
          heading:  'Home',
          route:    '/',
          svgIcon:  '/svg/icons/art002.svg',
          fontIcon: 'bi-house',
        },
        {
          heading:  'Dashboard',
          route:    '/dashboard',
          svgIcon:  '/svg/icons/art002.svg',
          fontIcon: 'bi-speedometer2',
        },
      ],
    },

    // ── Users ─────────────────────────────────────────────
        // ✅ Admin seulement
      // ── Users — Admin seulement ───────────────────────────
...(role.value === 'admin' ? [{
  heading: 'Users',
  route:   '/admin/users',
  pages: [
    {
      heading:  'All users',
      route:    '/admin/users',
      svgIcon:  '/svg/icons/abs015.svg',
      fontIcon: 'bi-people',
    },
    {
      heading:  'Create user',
      route:    '/admin/users/create',
      svgIcon:  '/svg/icons/lay009.svg',
      fontIcon: 'bi-person-plus',
    },
    {
      heading:  'Import data',
      route:    '/admin/users/import',
      svgIcon:  '/svg/files/upload.svg',
      fontIcon: 'bi-upload',
    },
    {
      heading:  'En attente',
      route:    '/admin/users/pending',
      svgIcon:  '/svg/icons/abs015.svg',
      fontIcon: 'bi-person-exclamation',
    },
  ],
}] : []),

    // ── Projects ──────────────────────────────────────────
    {
      heading: 'Projects',
      route:   `/${role.value}/projects`,
      pages: [
        {
          heading:  'All projects',
          route:    `/${role.value}/projects`,
          svgIcon:  '/svg/icons/abs015.svg',
          fontIcon: 'bi-folder',
        },
        {
          heading:  'Create project',
          route:    `/${role.value}/projects/create`,
          svgIcon:  '/svg/icons/lay009.svg',
          fontIcon: 'bi-folder-plus',
        },
        {
          heading:  'Import data',
          route:    `/${role.value}/projects/import`,
          svgIcon:  '/svg/files/upload.svg',
          fontIcon: 'bi-upload',
        },
      ],
    },

    // ── Images ────────────────────────────────────────────
    {
      heading: 'Images',
      route:   `/${role.value}/images`,
      pages: [
        {
          heading:  'All images',
          route:    `/${role.value}/images`,
          svgIcon:  '/svg/icons/abs015.svg',
          fontIcon: 'bi-images',
        },
        {
          heading:  'Create image',
          route:    `/${role.value}/images/create`,
          svgIcon:  '/svg/icons/lay009.svg',
          fontIcon: 'bi-image',
        },
        {
          heading:  'Import data',
          route:    `/${role.value}/images/import`,
          svgIcon:  '/svg/files/upload.svg',
          fontIcon: 'bi-upload',
        },
      ],
    },

    // ── AI Models — Expert + Admin seulement ──────────────
    ...(['expert', 'biologiste', 'biologist', 'admin']
      .includes(role.value) ? [{
      heading: 'AI Models',
      route:   `/${role.value}/aimodels`,
      pages: [
        {
          heading:  'All aimodels',
          route:    `/${role.value}/aimodels`,
          svgIcon:  '/svg/icons/abs015.svg',
          fontIcon: 'bi-cpu',
        },
        {
          heading:  'Create aimodel',
          route:    `/${role.value}/aimodels/create`,
          svgIcon:  '/svg/icons/lay009.svg',
          fontIcon: 'bi-cpu',
        },
        {
          heading:  'Import data',
          route:    `/${role.value}/aimodels/import`,
          svgIcon:  '/svg/files/upload.svg',
          fontIcon: 'bi-upload',
        },
      ],
    }] : []),

    // ── Annotations ───────────────────────────────────────
    {
      heading: 'Annotations',
      route:   `/${role.value}/annotations`,
      pages: [
        {
          heading:  'All annotations',
          route:    `/${role.value}/annotations`,
          svgIcon:  '/svg/icons/abs015.svg',
          fontIcon: 'bi-pencil-square',
        },
        {
          heading:  'Create annotation',
          route:    `/${role.value}/annotations/create`,
          svgIcon:  '/svg/icons/lay009.svg',
          fontIcon: 'bi-pencil',
        },
        {
          heading:  'Import data',
          route:    `/${role.value}/annotations/import`,
          svgIcon:  '/svg/files/upload.svg',
          fontIcon: 'bi-upload',
        },
      ],
    },
  ])

  return DocMenuConfig
}