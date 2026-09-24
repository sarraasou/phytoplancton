<script setup lang="ts">
import { ref, computed } from 'vue';

const search = ref('');

const diagnoses = [
  { plant: '🍅 Tomate',      disease: 'Mildiou',       farmer: 'Ahmed B.',    date: '03/04/2026', severity: 'Élevée',   sevCls: 'sev-high',     status: 'En traitement', staCls: 'sta-warning' },
  { plant: '🍇 Vigne',       disease: 'Oïdium',        farmer: 'Fatma K.',    date: '02/04/2026', severity: 'Moyenne',  sevCls: 'sev-medium',   status: 'Traité',        staCls: 'sta-success' },
  { plant: '🫒 Olive',       disease: 'Œil de paon',   farmer: 'Mohamed S.',  date: '01/04/2026', severity: 'Faible',   sevCls: 'sev-low',      status: 'Surveillance',  staCls: 'sta-info'    },
  { plant: '🌶️ Piment',     disease: 'Anthracnose',   farmer: 'Leila M.',    date: '31/03/2026', severity: 'Élevée',   sevCls: 'sev-high',     status: 'En traitement', staCls: 'sta-warning' },
  { plant: '🌾 Blé',         disease: 'Rouille jaune', farmer: 'Ali T.',      date: '30/03/2026', severity: 'Critique', sevCls: 'sev-critical', status: 'Urgent',        staCls: 'sta-danger'  },
  { plant: '🥔 P. de terre', disease: 'Alternariose',  farmer: 'Sonia R.',    date: '29/03/2026', severity: 'Moyenne',  sevCls: 'sev-medium',   status: 'Traité',        staCls: 'sta-success' },
];

const filtered = computed(() =>
  diagnoses.filter(d =>
    !search.value ||
    Object.values(d).some(v => String(v).toLowerCase().includes(search.value.toLowerCase()))
  )
);
</script>

<template>
  <div class="dash-card">
    <div class="card-header">
      <div>
        <div class="card-title">Diagnostics Récents</div>
        <div class="card-sub">Derniers cas signalés</div>
      </div>
      <input v-model="search" class="search-input" placeholder="🔍 Rechercher..." />
    </div>

    <div class="table-wrap">
      <table class="diag-table">
        <thead>
          <tr>
            <th>Plante</th>
            <th>Maladie</th>
            <th>Agriculteur</th>
            <th>Date</th>
            <th>Sévérité</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in filtered" :key="d.disease + d.date">
            <td class="plant-cell">{{ d.plant }}</td>
            <td>{{ d.disease }}</td>
            <td class="farmer">{{ d.farmer }}</td>
            <td class="date">{{ d.date }}</td>
            <td><span class="badge" :class="d.sevCls">{{ d.severity }}</span></td>
            <td><span class="badge" :class="d.staCls">{{ d.status }}</span></td>
            <td><button class="btn-view">👁</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dash-card { background: white; border-radius: 14px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
.card-title  { font-size: 1rem; font-weight: 700; color: #111827; }
.card-sub    { font-size: .8rem; color: #9ca3af; margin-top: 2px; }
.search-input {
  border: 1px solid #e5e7eb; border-radius: 8px; padding: 7px 12px;
  font-size: .85rem; outline: none; width: 200px;
  &:focus { border-color: #16a34a; }
}
.table-wrap { overflow-x: auto; }
.diag-table {
  width: 100%; border-collapse: collapse; font-size: .85rem;
  th { background: #f9fafb; color: #6b7280; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #f3f4f6; font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; }
  td { padding: 11px 12px; border-bottom: 1px solid #f9fafb; color: #374151; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f9fafb; }
}
.plant-cell { font-weight: 600; }
.farmer { color: #6b7280; }
.date   { color: #9ca3af; white-space: nowrap; }
.badge {
  display: inline-block; padding: 3px 9px; border-radius: 20px;
  font-size: .74rem; font-weight: 600; white-space: nowrap;
}
.sev-critical { background: #fce7f3; color: #9333ea; }
.sev-high     { background: #fee2e2; color: #dc2626; }
.sev-medium   { background: #fef3c7; color: #d97706; }
.sev-low      { background: #dbeafe; color: #2563eb; }
.sta-danger   { background: #fee2e2; color: #dc2626; }
.sta-warning  { background: #fef3c7; color: #d97706; }
.sta-success  { background: #dcfce7; color: #16a34a; }
.sta-info     { background: #dbeafe; color: #2563eb; }
.btn-view { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 2px 6px; border-radius: 6px; &:hover { background: #f3f4f6; } }
</style>