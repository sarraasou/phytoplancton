<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useProjectStore }    from '@/store/useProjectModule';
import { useUserStore }       from '@/store/useUserModule';
import { useAnnotationStore } from '@/store/useAnnotationModule';
import { useImageStore }      from '@/store/useImageModule';
import { useAuthStore }       from '@/store/useAuth';

const projectStore    = useProjectStore();
const userStore       = useUserStore();
const annotationStore = useAnnotationStore();
const imageStore      = useImageStore();

const { currentUser } = useAuthStore();
const role = currentUser?.role ?? 'user';

// ✅ Loading local — plus fiable que les stores isLoading
const loading = ref(true);

// ✅ Totaux stockés localement après fetch
const totals = ref({
  users:       0,
  projects:    0,
  images:      0,
  annotations: 0,
});

onMounted(async () => {
  loading.value = true;
  try {
    // take:1 → ultra rapide, on veut juste totalCount
    const [proj, usr, ann, img] = await Promise.allSettled([
      projectStore.fetchProjects({ take: 1, skip: 0 }),
      userStore.fetchUsers({ take: 1, skip: 0 }),
      annotationStore.fetchAnnotations({ take: 1, skip: 0 }),
      imageStore.fetchImages({ take: 1, skip: 0 }),
    ]);

    // Lire les totaux directement depuis les stores après fetch
    totals.value.projects    = projectStore.projectPagination?.total       ?? 0;
    totals.value.users       = userStore.userPagination?.total             ?? 0;
    totals.value.annotations = annotationStore.annotationPagination?.total ?? 0;
    totals.value.images      = imageStore.imagePagination?.total           ?? 0;

  } catch (e) {
    console.error('Dashboard stats error:', e);
  } finally {
    loading.value = false;
  }
});

const stats = computed(() => [
  {
    title:  'Utilisateurs',
    value:  totals.value.users,
    icon:   '👥',
    color:  '#2563eb',
    bg:     '#dbeafe',
    border: '#bfdbfe',
    route:  `/admin/users`,
  },
  {
    title:  'Projets',
    value:  totals.value.projects,
    icon:   '📁',
    color:  '#16a34a',
    bg:     '#dcfce7',
    border: '#bbf7d0',
    route:  `/${role}/projects`,
  },
  {
    title:  'Images',
    value:  totals.value.images,
    icon:   '🖼️',
    color:  '#9333ea',
    bg:     '#f3e8ff',
    border: '#e9d5ff',
    route:  `/${role}/images`,
  },
  {
    title:  'Annotations',
    value:  totals.value.annotations,
    icon:   '✏️',
    color:  '#d97706',
    bg:     '#fef3c7',
    border: '#fde68a',
    route:  `/${role}/annotations`,
  },
]);
</script>

<template>
  <div class="widget-stats">
    <router-link
      v-for="s in stats"
      :key="s.title"
      :to="s.route"
      class="stat-card"
      :style="{ borderLeft: `4px solid ${s.color}` }"
    >
      <!-- Icône -->
      <div class="stat-top">
        <div
          class="stat-icon"
          :style="{ background: s.bg, border: `1px solid ${s.border}` }"
        >
          {{ s.icon }}
        </div>
      </div>

      <!-- Valeur -->
      <div class="stat-value" :style="{ color: s.color }">
        <!-- Skeleton pendant chargement -->
        <span v-if="loading" class="skeleton" />
        <!-- Vraie valeur -->
        <span v-else>{{ s.value.toLocaleString('fr-FR') }}</span>
      </div>

      <div class="stat-title">{{ s.title }}</div>
      <div class="stat-link" :style="{ color: s.color }">Voir tout →</div>
    </router-link>
  </div>
</template>

<style scoped lang="scss">
.widget-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px)  { grid-template-columns: 1fr; }
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,.07);
  text-decoration: none;
  display: block;
  transition: transform .2s, box-shadow .2s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,.1);
  }
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.stat-icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
  min-height: 36px;
  display: flex;
  align-items: center;
}

.stat-title {
  font-size: .85rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-link {
  font-size: .75rem;
  font-weight: 600;
  opacity: 0.65;
  transition: opacity .2s;
  .stat-card:hover & { opacity: 1; }
}

/* Skeleton loader */
.skeleton {
  display: inline-block;
  width: 64px; height: 30px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0%   { background-position:  200% 0; }
  100% { background-position: -200% 0; }
}
</style>