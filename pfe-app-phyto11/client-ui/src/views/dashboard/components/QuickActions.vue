<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

const actions = [
  { label: 'Nouveau diagnostic', icon: '📋', color: '#2563eb', bg: '#dbeafe', to: '/diagnostics/new'  },
  { label: 'Ajouter traitement', icon: '💊', color: '#16a34a', bg: '#dcfce7', to: '/treatments/new'   },
  { label: 'Signaler maladie',   icon: '🦠', color: '#dc2626', bg: '#fee2e2', to: '/diseases/report'  },
  { label: 'Voir rapports',      icon: '📊', color: '#d97706', bg: '#fef3c7', to: '/reports'          },
];

function go(path: string) {
  router.push(path).catch(() => {});
}
</script>

<template>
  <div class="dash-card">
    <div class="card-title mb-3">Actions Rapides</div>
    <div class="actions-grid">
      <button
        v-for="a in actions"
        :key="a.label"
        class="action-btn"
        :style="{ background: a.bg, color: a.color }"
        @click="go(a.to)"
      >
        <span class="a-icon">{{ a.icon }}</span>
        <span class="a-label">{{ a.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dash-card   { background: white; border-radius: 14px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
.card-title  { font-size: 1rem; font-weight: 700; color: #111827; }
.mb-3 { margin-bottom: 14px; }

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.action-btn {
  border: none; border-radius: 12px; padding: 16px 10px;
  cursor: pointer; display: flex; flex-direction: column;
  align-items: center; gap: 8px; font-weight: 600;
  transition: filter .2s, transform .15s;
  &:hover { filter: brightness(.93); transform: translateY(-1px); }
  &:active { transform: translateY(0); }
}

.a-icon  { font-size: 1.5rem; }
.a-label { font-size: .78rem; text-align: center; line-height: 1.3; }
</style>