<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useProjectStore } from '@/store/useProjectModule';
import { useUserStore }    from '@/store/useUserModule';
import { useAuthStore }    from '@/store/useAuth';

const projectStore = useProjectStore();
const userStore    = useUserStore();
const { currentUser } = useAuthStore();

const { projectList, projectPagination } = storeToRefs(projectStore);
const { userPagination }                 = storeToRefs(userStore);

const dismissed = ref<number[]>([]);

onMounted(async () => {
  await Promise.all([
    projectStore.fetchProjects({ take: 3, skip: 0 }),
    userStore.fetchUsers({ take: 1, skip: 0 }),
  ]);
});

const dynamicAlerts = computed(() => {
  const alerts: any[] = [];
  let id = 10;

  if (userPagination.value.total > 0)
    alerts.push({
      id: id++, type: 'info', icon: '👥', time: 'Maintenant',
      title: 'Utilisateurs inscrits',
      msg: `${userPagination.value.total} utilisateur(s) sur la plateforme.`,
    });

  if (projectPagination.value.total > 0)
    alerts.push({
      id: id++, type: 'success', icon: '📁', time: 'Maintenant',
      title: 'Projets actifs',
      msg: `${projectPagination.value.total} projet(s) enregistré(s).`,
    });

  projectList.value.slice(0, 2).forEach((p: any) => {
    alerts.push({
      id: id++, type: 'warning', icon: '🆕',
      time: new Date(p.createdAt).toLocaleDateString('fr-FR'),
      title: 'Nouveau projet',
      msg: `"${p.title}" a été créé récemment.`,
    });
  });

  return alerts;
});

const visibleAlerts = computed(() =>
  dynamicAlerts.value.filter(a => !dismissed.value.includes(a.id))
);

function dismiss(id: number) {
  dismissed.value.push(id);
}
</script>

<template>
  <div class="dash-card">
    <div class="card-header">
      <div class="card-title">🔔 Notifications</div>
      <span v-if="visibleAlerts.length" class="alert-badge">
        {{ visibleAlerts.length }}
      </span>
    </div>

    <!-- Skeleton loader -->
    <template v-if="projectStore.isLoading || userStore.isLoading">
      <div v-for="n in 3" :key="n" class="skeleton-row">
        <div class="sk sk-icon" />
        <div class="sk-lines">
          <div class="sk sk-title" />
          <div class="sk sk-msg" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="alerts-list">
        <div
          v-for="a in visibleAlerts"
          :key="a.id"
          class="alert-item"
          :class="`alert-${a.type}`"
        >
          <div class="alert-left">
            <span class="alert-icon">{{ a.icon }}</span>
            <div>
              <div class="alert-title">
                {{ a.title }}
                <span class="alert-time">{{ a.time }}</span>
              </div>
              <div class="alert-msg">{{ a.msg }}</div>
            </div>
          </div>
          <button class="dismiss-btn" @click="dismiss(a.id)">✕</button>
        </div>

        <div v-if="!visibleAlerts.length" class="no-alerts">
          ✅ Aucune notification
        </div>
      </div>
    </template>

    <router-link to="/admin/users/pending" class="btn-all">
      Utilisateurs en attente →
    </router-link>
  </div>
</template>

<style scoped lang="scss">
.dash-card   { background: white; border-radius: 14px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.card-title  { font-size: 1rem; font-weight: 700; color: #111827; }
.alert-badge { background: #fee2e2; color: #dc2626; font-size: .75rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
.alerts-list { display: flex; flex-direction: column; gap: 8px; }
.alert-item  { display: flex; align-items: flex-start; justify-content: space-between; padding: 10px 12px; border-radius: 10px; gap: 8px; }
.alert-info    { background: #eff6ff; border-left: 3px solid #2563eb; }
.alert-success { background: #f0fdf4; border-left: 3px solid #16a34a; }
.alert-warning { background: #fffbeb; border-left: 3px solid #d97706; }
.alert-danger  { background: #fef2f2; border-left: 3px solid #dc2626; }
.alert-left  { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
.alert-icon  { font-size: 1.1rem; flex-shrink: 0; }
.alert-title { font-size: .83rem; font-weight: 700; color: #111827; }
.alert-time  { font-size: .73rem; color: #9ca3af; font-weight: 400; margin-left: 6px; }
.alert-msg   { font-size: .78rem; color: #6b7280; margin-top: 2px; line-height: 1.4; }
.dismiss-btn { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: .85rem; &:hover { color: #374151; } }
.no-alerts   { text-align: center; color: #16a34a; font-size: .87rem; padding: 12px 0; }
.btn-all     { display: inline-block; margin-top: 12px; color: #2563eb; font-size: .82rem; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }

/* Skeleton */
.skeleton-row { display: flex; gap: 10px; padding: 8px 0; align-items: center; }
.sk-lines     { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk {
  border-radius: 6px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
.sk-icon  { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; }
.sk-title { height: 12px; width: 60%; }
.sk-msg   { height: 10px; width: 90%; }
@keyframes shimmer {
  0%   { background-position:  200% 0; }
  100% { background-position: -200% 0; }
}
</style>