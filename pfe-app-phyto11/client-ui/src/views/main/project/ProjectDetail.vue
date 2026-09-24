<template>
  <!-- ══ CHARGEMENT ══ -->
  <div v-if="isLoadingPermissions" class="loading-container">
    <div class="loading-pulse">
      <div class="pulse-ring"></div>
      <div class="pulse-ring pulse-ring--delay"></div>
      <el-icon class="is-loading pulse-icon"><Loading /></el-icon>
    </div>
    <span class="loading-text">Chargement des permissions...</span>
  </div>

  <!-- ══ ACCÈS REFUSÉ ══ -->
  <div v-else-if="!canView" class="access-denied">
    <div class="access-denied__card">
      <div class="access-denied__icon">🔒</div>
      <h2>Accès Refusé</h2>
      <p>Vous n'avez pas la permission de voir ce projet.</p>
      <el-button type="primary" class="btn-primary-custom"
        @click="$router.push('/dashboard')">
        ← Retour au tableau de bord
      </el-button>
    </div>
  </div>

  <!-- ══ CONTENU PRINCIPAL ══ -->
  <div v-else class="page-wrapper">

    <!-- ── SIDEBAR ── -->
    <aside class="sidebar">
      <div class="sidebar__brand">
        <span class="brand-dot"></span>
        <span class="brand-name">BioScan</span>
      </div>

      <nav class="sidebar__nav">
        <button class="nav-item"
          :class="{ active: activeTab === 'details' }"
          @click="activeTab = 'details'">
          <span class="nav-icon">📋</span><span>Détails</span>
        </button>
        <button class="nav-item"
          :class="{ active: activeTab === 'analytics' }"
          @click="switchToAnalytics">
          <span class="nav-icon">📊</span><span>Analytics</span>
        </button>
        <button v-if="isAdminUser" class="nav-item"
          :class="{ active: activeTab === 'permissions' }"
          @click="activeTab = 'permissions'">
          <span class="nav-icon">🔑</span><span>Permissions</span>
        </button>
      </nav>

      <!-- Dataset IA -->
      <div class="sidebar__dataset" v-if="datasetStats.total > 0">
        <div class="dataset-title">🧠 Dataset IA</div>
        <div class="dataset-row"
          v-for="(count, cls) in datasetStats.by_class" :key="cls">
          <span class="dataset-cls" :class="`cls-${cls}`">{{ cls }}</span>
          <span class="dataset-count">{{ count }}</span>
        </div>
        <div class="dataset-total">Total : {{ datasetStats.total }}</div>
      </div>

      <div class="sidebar__meta">
        <div class="meta-card">
          <div class="meta-card__label">Créé le</div>
          <div class="meta-card__value">{{ formatDate(project?.createdAt) }}</div>
        </div>
        <div class="meta-card">
          <div class="meta-card__label">Modifié le</div>
          <div class="meta-card__value">{{ formatDate(project?.updatedAt) }}</div>
        </div>
        <div class="meta-card">
          <div class="meta-card__label">Outil</div>
          <div class="meta-card__value tool-badge">{{ project?.tool || '—' }}</div>
        </div>
      </div>

      <div class="sidebar__actions" v-if="canEdit">
        <button class="btn-edit" @click="handleEdit" :disabled="loadingAnnotations">
          <el-icon><Edit /></el-icon> Modifier
        </button>
        <button class="btn-delete" @click="handleDelete" :disabled="loadingAnnotations">
          <el-icon><Delete /></el-icon> Supprimer
        </button>
      </div>
    </aside>

    <!-- ── MAIN CONTENT ── -->
    <main class="main-content">

      <!-- Breadcrumb -->
      <div class="breadcrumb-bar">
        <span class="breadcrumb-link"
          @click="$router.push({ name: listProjectRouteName })">Projets</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ project?.title || 'Détails' }}</span>
      </div>

      <!-- Hero Header -->
      <header class="project-hero">
        <div class="hero-content">
          <div class="hero-badge">Projet Actif</div>
          <h1 class="hero-title">{{ project?.title || 'Titre du Projet' }}</h1>
          <p class="hero-description">{{ project?.description || 'Aucune description fournie.' }}</p>
        </div>
        <div class="hero-stats">
          <div class="stat-pill">
            <span class="stat-pill__number">{{ projectImages.length }}</span>
            <span class="stat-pill__label">Images</span>
          </div>
          <div class="stat-pill">
            <span class="stat-pill__number">{{ selectedImages.length }}</span>
            <span class="stat-pill__label">Sélectionnées</span>
          </div>
          <div v-if="kareniaPercent >= 30" class="alert-badge alert-badge--danger">
            <span class="alert-badge__icon">🔴</span>
            <div class="alert-badge__content">
              <span class="alert-badge__percent">{{ kareniaPercent }}%</span>
              <span class="alert-badge__label">Karenia Bloom</span>
            </div>
          </div>
          <div v-if="alexandriumPercent >= 30" class="alert-badge alert-badge--warning">
            <span class="alert-badge__icon">🟠</span>
            <div class="alert-badge__content">
              <span class="alert-badge__percent">{{ alexandriumPercent }}%</span>
              <span class="alert-badge__label">Alexandrium Bloom</span>
            </div>
          </div>
          <div class="stat-pill">
            <span class="stat-pill__number">{{ totalCrops }}</span>
            <span class="stat-pill__label">Cellules</span>
          </div>
        </div>
      </header>

      <!-- BLOOM ALERT -->
      <div v-if="bloomAlert.show" class="bloom-alert" @click="bloomAlert.show = false">
        <div class="bloom-alert__pulse"></div>
        <div class="bloom-alert__body">
          <div class="bloom-alert__icon">
            {{ bloomAlert.severity === 'ALEXANDRIUM_ALERT' ? '🟠' : '🔴' }}
          </div>
          <div class="bloom-alert__text">
            <strong>
              {{ bloomAlert.severity === 'ALEXANDRIUM_ALERT' ? 'ALERTE ALEXANDRIUM' : 'ALERTE BLOOM KARENIA' }}
              — {{ bloomAlert.percentage.toFixed(1) }}%
            </strong>
            <span>
              {{ bloomAlert.cellsCount }} cellules sur {{ bloomAlert.totalCells }} analysées
              · Niveau : {{ bloomAlert.severity }}
            </span>
          </div>
          <button class="bloom-alert__close" @click.stop="bloomAlert.show = false">✕</button>
        </div>
      </div>

      <!-- ══════════════ ONGLET DÉTAILS ══════════════ -->
      <div v-if="activeTab === 'details'" class="tab-content">

        <div class="images-toolbar" v-if="projectImages.length > 0">
          <div class="toolbar-left">
            <h2 class="section-heading">
              <span class="section-heading__icon">🖼️</span>
              Galerie d'images
              <span class="count-badge">{{ projectImages.length }}</span>
            </h2>
          </div>
          <div class="toolbar-right">
            <button class="toolbar-btn toolbar-btn--secondary"
              @click="toggleSelectAll" :disabled="loadingAnnotations">
              <span>{{ selectAll ? '☐ Désélectionner' : '☑ Tout sélectionner' }}</span>
            </button>
            <button v-if="canAnnotate" class="toolbar-btn toolbar-btn--success"
              @click="viewAnnotations"
              :disabled="selectedImages.length === 0 || loadingAnnotations">
              <span v-if="!loadingAnnotations">🔬 Analyser ({{ selectedImages.length }})</span>
              <span v-else class="btn-loading">
                <el-icon class="spin-icon"><Loading /></el-icon> Traitement...
              </span>
            </button>
            <button v-if="canValidate" class="toolbar-btn toolbar-btn--warning"
              @click="validateAnnotations"
              :disabled="!hasModifiedAnnotations || loadingAnnotations">
              ✓ Valider les annotations
            </button>
            <button v-if="canAnnotate && datasetStats.total >= 20"
              class="toolbar-btn toolbar-btn--retrain"
              @click="triggerRetrain"
              :disabled="loadingAnnotations || retraining">
              <span v-if="!retraining">🔄 Améliorer modèle ({{ datasetStats.total }})</span>
              <span v-else class="btn-loading">
                <el-icon class="spin-icon"><Loading /></el-icon> Réentraînement...
              </span>
            </button>
          </div>
        </div>

        <!-- Loading overlay -->
        <div v-if="loadingAnnotations" class="analysis-overlay">
          <div class="analysis-card">
            <div class="analysis-animation">
              <div class="scan-line"></div>
              <div class="microscope-icon">🔬</div>
            </div>
            <h3>Analyse IA en cours</h3>
            <p>Traitement de {{ selectedImages.length }} image(s)...</p>
            <div class="progress-bar">
              <div class="progress-bar__fill" :style="{ width: analysisProgress + '%' }"></div>
            </div>
            <div class="progress-text">{{ analysisProgress }}%</div>
          </div>
        </div>

        <!-- Image Grid -->
        <div class="image-grid" :class="{ 'image-grid--loading': loadingAnnotations }">
          <div
            v-for="(image, index) in projectImages"
            :key="image.id"
            class="image-card"
            :class="{
              'image-card--karenia':     getImageDominantClass(image.id) === 'Karenia',
              'image-card--alexandrium': getImageDominantClass(image.id) === 'Alexandrium',
              'image-card--autres':      getImageDominantClass(image.id) === 'Autres',
              'image-card--multi':       getImageSpeciesCount(image.id) > 1,
              'image-card--analyzing':   loadingAnnotations && selectedImageIds.includes(image.id),
              'image-card--selected':    selectedImageIds.includes(image.id),
            }"
          >
            <label class="custom-checkbox"
              :class="{ checked: selectedImageIds.includes(image.id) }">
              <input type="checkbox"
                :checked="selectedImageIds.includes(image.id)"
                :disabled="loadingAnnotations"
                @change="(e) => handleCheckboxChange(e, image)" />
              <span class="checkbox-visual">
                <svg v-if="selectedImageIds.includes(image.id)" viewBox="0 0 12 10" fill="none">
                  <polyline points="1,5 4,8 11,1" stroke="white" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </label>

            <el-image
              :src="image.url"
              :preview-src-list="projectImages.map(img => img.url)"
              fit="cover" class="card-image" :initial-index="index">
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>Indisponible</span>
                </div>
              </template>
            </el-image>

            <!-- ANNOTATION OVERLAY -->
            <div class="annotation-overlay"
              v-if="hasAnnotation(image.id) || (loadingAnnotations && selectedImageIds.includes(image.id))">

              <div v-if="loadingAnnotations && selectedImageIds.includes(image.id)"
                class="analyzing-badge">
                <el-icon class="spin-icon"><Loading /></el-icon> Analyse...
              </div>

              <template v-else-if="hasAnnotation(image.id)">
                <!-- CAS 1 : crops détectés -->
                <div v-if="getCropsForImage(image.id).length > 0" class="crops-list">
                  <div v-for="crop in getCropsForImage(image.id)"
                    :key="crop.crop_id" class="crop-row">

                    <el-select v-if="canValidate"
                      v-model="cropCorrections[crop.crop_id]"
                      size="small"
                      @change="handleCropCorrectionChange(image.id)"
                      class="annotation-select-custom crop-select">
                      <el-option label="🔴 Karenia Selliformis" value="Karenia" />
                      <el-option label="🟠 Alexandrium" value="Alexandrium" />
                      <el-option label="🟢 Autres Cellules" value="Autres" />
                    </el-select>

                    <div v-else class="annotation-tag" :class="{
                      'tag--karenia':     cropCorrections[crop.crop_id] === 'Karenia',
                      'tag--alexandrium': cropCorrections[crop.crop_id] === 'Alexandrium',
                      'tag--autres':      cropCorrections[crop.crop_id] === 'Autres',
                    }">
                      {{ cropCorrections[crop.crop_id] === 'Karenia' ? '🔴 Karenia'
                       : cropCorrections[crop.crop_id] === 'Alexandrium' ? '🟠 Alexandrium'
                       : '🟢 Autres' }}
                      <span class="crop-conf">
                        ({{ Math.round((crop.confidence ?? 0) * 100) }}%)
                      </span>
                    </div>
                  </div>
                </div>

                <!-- CAS 2 : annotation legacy -->
                <div v-else class="crops-list">
                  <div class="crop-row">
                    <el-select v-if="canValidate"
                      v-model="annotationTypes[image.id]"
                      size="small"
                      @change="handleAnnotationChange(image.id)"
                      class="annotation-select-custom crop-select">
                      <el-option label="🔴 Karenia Selliformis" value="Karenia" />
                      <el-option label="🟠 Alexandrium" value="Alexandrium" />
                      <el-option label="🟢 Autres Cellules" value="Autres" />
                    </el-select>
                    <div v-else class="annotation-tag" :class="{
                      'tag--karenia':     currentAnnotation(image.id) === 'Karenia',
                      'tag--alexandrium': currentAnnotation(image.id) === 'Alexandrium',
                      'tag--autres':      currentAnnotation(image.id) === 'Autres',
                    }">
                      {{ currentAnnotation(image.id) === 'Karenia' ? '🔴 Karenia'
                       : currentAnnotation(image.id) === 'Alexandrium' ? '🟠 Alexandrium'
                       : '🟢 Autres' }}
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div v-if="selectedImageIds.includes(image.id)" class="selected-shimmer"></div>
          </div>

          <div class="image-grid__empty" v-if="projectImages.length === 0">
            <div class="empty-state">
              <div class="empty-state__icon">🖼️</div>
              <h3>Aucune image</h3>
              <p>Ce projet ne contient pas encore d'images.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════ ONGLET ANALYTICS ══════════════ -->
      <div v-if="activeTab === 'analytics'" class="tab-content analytics-tab">

        <div class="analytics-metrics">
          <div class="a-metric">
            <div class="a-metric__label">Microalgues détectées</div>
            <div class="a-metric__value">{{ totalCrops }}</div>
            <div class="a-metric__sub">sur {{ annotationsResult.length }} images analysées</div>
          </div>
          <div class="a-metric" :class="{ 'a-metric--danger': kareniaPercent >= 30 }">
            <div class="a-metric__label">% Karenia</div>
            <div class="a-metric__value">{{ kareniaPercent }}%</div>
            <div class="a-metric__sub">{{ countsBySpecies.Karenia }} cellules</div>
          </div>
          <div class="a-metric">
            <div class="a-metric__label">Confiance moyenne</div>
            <div class="a-metric__value">{{ avgConfidence }}%</div>
            <div class="a-metric__sub">modèle ResNet50</div>
          </div>
          <div class="a-metric">
            <div class="a-metric__label">Dataset IA</div>
            <div class="a-metric__value">{{ datasetStats.total }}</div>
            <div class="a-metric__sub">crops validés</div>
          </div>
        </div>

        <div v-if="kareniaPercent >= 30" class="a-bloom-alert">
          <span class="a-bloom-alert__icon">🔴</span>
          <div>
            <strong>Alerte bloom — {{ kareniaPercent }}% de Karenia</strong>
            <span>{{ countsBySpecies.Karenia }} cellules sur {{ totalCrops }}
              · {{ kareniaPercent >= 60 ? 'BLOOM_CRITICAL' : 'BLOOM_HIGH' }}</span>
          </div>
        </div>

        <div v-if="totalCrops === 0" class="a-empty">
          <div class="a-empty__icon">📊</div>
          <h3>Aucune donnée analytique</h3>
          <p>Lancez une analyse depuis l'onglet Détails pour voir les graphiques ici.</p>
          <button class="toolbar-btn toolbar-btn--success" @click="activeTab = 'details'">
            ← Aller à la galerie
          </button>
        </div>

        <template v-else>
          <div class="a-charts-row">
            <div class="a-chart-card">
              <div class="a-chart-title">Répartition par espèce</div>
              <div class="a-legend">
                <span class="a-legend__item">
                  <span class="a-legend__sq" style="background:#dc2626"></span>
                  Karenia {{ countsBySpecies.Karenia }}
                </span>
                <span class="a-legend__item">
                  <span class="a-legend__sq" style="background:#ea580c"></span>
                  Alexandrium {{ countsBySpecies.Alexandrium }}
                </span>
                <span class="a-legend__item">
                  <span class="a-legend__sq" style="background:#16a34a"></span>
                  Autres {{ countsBySpecies.Autres }}
                </span>
              </div>
              <div class="a-chart-wrap" style="height:200px">
                <canvas id="donut-chart" aria-label="Répartition des espèces"></canvas>
              </div>
            </div>

            <div class="a-chart-card">
              <div class="a-chart-title">Dataset IA par espèce</div>
              <div class="a-legend">
                <span class="a-legend__item">
                  <span class="a-legend__sq" style="background:#0066cc"></span>
                  Fichiers validés (total : {{ datasetStats.total }})
                </span>
              </div>
              <div class="a-chart-wrap" style="height:200px">
                <canvas id="bar-chart" aria-label="Fichiers validés par espèce"></canvas>
              </div>
            </div>
          </div>

          <div class="a-chart-card">
            <div class="a-chart-title">Détail par image</div>
            <div class="a-table-wrap">
              <table class="a-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Espèces détectées</th>
                    <th>Confiance moy.</th>
                    <th>Barre</th>
                    <th>Cellules</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in confidenceTable" :key="row.id">
                    <td class="a-table__id">{{ row.id.substring(0, 16) }}…</td>
                    <td>
                      <div class="species-tags">
                        <span v-for="sp in row.species" :key="sp.name"
                          class="a-species-pill"
                          :class="{
                            'a-species-pill--k': sp.name === 'Karenia',
                            'a-species-pill--a': sp.name === 'Alexandrium',
                            'a-species-pill--o': sp.name === 'Autres',
                          }">
                          {{ sp.name }} ({{ sp.count }})
                        </span>
                      </div>
                    </td>
                    <td>{{ row.confidence }}%</td>
                    <td>
                      <div class="a-bar-wrap">
                        <div class="a-bar-fill" :style="{
                          width: row.confidence + '%',
                          background: row.dominant === 'Karenia' ? '#dc2626'
                            : row.dominant === 'Alexandrium' ? '#ea580c' : '#16a34a'
                        }"></div>
                      </div>
                    </td>
                    <td>{{ row.crops }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>

      <!-- ══════════════ ONGLET PERMISSIONS ══════════════ -->
      <div v-if="activeTab === 'permissions' && isAdminUser"
        class="tab-content permissions-panel">
        <h2 class="section-heading">
          <span class="section-heading__icon">🔑</span>
          Gestion des permissions
        </h2>
        <button class="btn-permissions"
          @click="$router.push({
            name: 'admin-project-permissions',
            params: { id: route.params.id }
          })">
          🔑 Gérer les permissions
        </button>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted, onUnmounted, ref, watch,
  computed, reactive, nextTick,
} from 'vue'
import { setCurrentPageBreadcrumbs } from '@/core/helpers/config'
import { storeToRefs } from 'pinia'
import { useProjectStore }     from '@/store/useProjectModule'
import { useAuthStore }        from '@/store/useAuth'
import { useAnnotationStore }  from '@/store/useAnnotationModule'
import { useAiModelStore }     from '@/store/useAiModelModule'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { Picture, Edit, Delete, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectPermissions } from '@/composables/useProjectPermissions'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// ════════════════════════════════
//  CONFIG
// ════════════════════════════════
const API_URL = import.meta.env.VITE_API_URL
const AI_URLS = Array.from(new Set([
  import.meta.env.VITE_AI_URL,
  'http://localhost:8002',
  'http://localhost:8001',
].filter(Boolean).map((url: string) => url.replace(/\/$/, ''))))
const activeAiUrl = ref(AI_URLS[0])

const aiRequest = async <T = any>(
  method: 'get' | 'post',
  path: string,
  data?: any,
  config: Record<string, any> = {}
) => {
  const orderedUrls = Array.from(
    new Set([activeAiUrl.value, ...AI_URLS].filter(Boolean))
  )
  let lastError: any = null
  for (const baseUrl of orderedUrls) {
    try {
      const response = await axios.request<T>({
        method,
        url: `${baseUrl}${path}`,
        data,
        timeout: config.timeout ?? 120_000,
        ...config,
      })
      activeAiUrl.value = baseUrl
      return response
    } catch (err: any) {
      lastError = err
      if (err?.response) throw err
      console.warn(`AI API indisponible sur ${baseUrl}, tentative...`)
    }
  }
  throw lastError
}

const BLOOM_THRESHOLD      = 30
const BLOOM_HIGH_THRESHOLD = 60

// ════════════════════════════════
//  INTERFACES
// ════════════════════════════════
interface ProjectImage {
  id:           string
  url:          string
  name?:        string
  annotations?: { id: string; result: string; url?: string | null }[]
}

interface Microalgue {
  crop_id:       string
  id:            string
  url:           string
  class_name:    'Karenia' | 'Alexandrium' | 'Autres'
  confidence:    number
  probabilities: Record<string, number>
  image_path:    string
  validated:     boolean
}

interface AnnotationResult {
  id:                string
  result_image_path: string
  microalgues:       Microalgue[]
  counts:            Record<string, number>
  error?:            string
}

interface DatasetStats {
  total:    number
  by_class: Record<string, number>
  pending:  number
}

// ════════════════════════════════
//  STORES & COMPOSABLES
// ════════════════════════════════
const route  = useRoute()
const router = useRouter()
const { currentUser }                   = storeToRefs(useAuthStore())
const { project }                       = storeToRefs(useProjectStore())
const { getProjectById, deleteProject } = useProjectStore()
const annotationStore                   = useAnnotationStore()
const aiModelStore                      = useAiModelStore()

const activeTab            = ref('details')
const isAdminUser          = computed(() =>
  currentUser.value?.userRole?.toUpperCase() === 'ADMIN'
)
const isLoadingPermissions = ref(true)

const { canAnnotate, canValidate, canEdit, canView, loadPermissions } =
  useProjectPermissions(route.params.id as string)

// ════════════════════════════════
//  STATE
// ════════════════════════════════
const projectImages           = ref<ProjectImage[]>([])
const selectedImageIds        = ref<string[]>([])
const selectedImages          = ref<{ id: string; url: string }[]>([])
const selectAll               = ref(false)
const loadingAnnotations      = ref(false)
const retraining              = ref(false)
const analysisProgress        = ref(0)
const annotationsResult       = ref<AnnotationResult[]>([])
const annotationTypes         = ref<Record<string, string>>({})
const originalAnnotationTypes = ref<Record<string, string>>({})
const imageAnnotationIds      = ref<Record<string, string>>({})
const hasModifiedAnnotations  = ref(false)

const cropCorrections         = ref<Record<string, string>>({})
const originalCropCorrections = ref<Record<string, string>>({})

const CROP_IDS_KEY = `algaevision_crop_ids_${route.params.id}`

const _loadCropIds = (): Record<string, string[]> => {
  try {
    const raw = localStorage.getItem(CROP_IDS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
const _saveCropIds = (data: Record<string, string[]>) => {
  try {
    localStorage.setItem(CROP_IDS_KEY, JSON.stringify(data))
  } catch { console.warn('localStorage quota dépassé') }
}

const imageCropIds = ref<Record<string, string[]>>(_loadCropIds())

const datasetStats = reactive<DatasetStats>({
  total:    0,
  by_class: { Alexandrium: 0, Autres: 0, Karenia: 0 },
  pending:  0,
})

const bloomAlert = reactive({
  show:       false,
  percentage: 0,
  cellsCount: 0,
  totalCells: 0,
  severity:   '',
})

const chartInstances = ref<Record<string, Chart>>({})

// ════════════════════════════════
//  COMPUTED
// ════════════════════════════════
const SUPABASE_GENERIC = ['user', 'authenticated', 'anon', '']

const rolePrefix = computed(() => {
  const raw =
    currentUser.value?.userRole?.toLowerCase() ||
    (!SUPABASE_GENERIC.includes(currentUser.value?.role?.toLowerCase() ?? '')
      ? currentUser.value?.role?.toLowerCase()
      : null) ||
    'user'
  const map: Record<string, string> = {
    expert: 'expert', biologiste: 'expert', biologist: 'expert',
    technicien: 'technicien', admin: 'admin', user: 'user',
  }
  return map[raw] ?? 'user'
})

const listProjectRouteName = computed(() => `${rolePrefix.value}-list-project`)
const editProjectRouteName = computed(() => `${rolePrefix.value}-edit-project`)

const countsBySpecies = computed(() => {
  const counts: Record<string, number> = { Karenia: 0, Alexandrium: 0, Autres: 0 }
  for (const res of annotationsResult.value) {
    for (const m of res.microalgues ?? []) {
      const cls = cropCorrections.value[m.crop_id] ?? m.class_name
      if (cls in counts) counts[cls]++
    }
  }
  return counts
})

const totalCrops = computed(() =>
  Object.values(countsBySpecies.value).reduce((a, b) => a + b, 0)
)

const kareniaPercent = computed(() => {
  if (totalCrops.value === 0) return 0
  return Math.round((countsBySpecies.value.Karenia / totalCrops.value) * 100)
})

const alexandriumPercent = computed(() => {
  if (totalCrops.value === 0) return 0
  return Math.round((countsBySpecies.value.Alexandrium / totalCrops.value) * 100)
})

const avgConfidence = computed(() => {
  const all = annotationsResult.value.flatMap(r => r.microalgues ?? [])
  if (all.length === 0) return 0
  const sum = all.reduce((s, m) => s + (m.confidence ?? 0), 0)
  return Math.round((sum / all.length) * 100)
})

const confidenceTable = computed(() =>
  annotationsResult.value
    .filter(res => (res.microalgues ?? []).length > 0)
    .map(res => {
      const crops = res.microalgues ?? []
      const avg = crops.length
        ? Math.round(crops.reduce((s, m) => s + (m.confidence ?? 0), 0) / crops.length * 100)
        : 0
      const speciesCounts: Record<string, number> = {}
      for (const m of crops) {
        const cls = cropCorrections.value[m.crop_id] ?? m.class_name
        speciesCounts[cls] = (speciesCounts[cls] ?? 0) + 1
      }
      const dominant = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
      const species  = Object.entries(speciesCounts).map(([name, count]) => ({ name, count }))
      return { id: res.id, dominant, species, confidence: avg, crops: crops.length }
    })
)

// ════════════════════════════════
//  HELPERS IMAGE-CARD
// ════════════════════════════════
const getImageDominantClass = (imageId: string): string | null => {
  const crops = getCropsForImage(imageId)
  if (crops.length === 0) return annotationTypes.value[imageId] ?? null
  const speciesCounts: Record<string, number> = {}
  for (const m of crops) {
    const cls = cropCorrections.value[m.crop_id] ?? m.class_name
    speciesCounts[cls] = (speciesCounts[cls] ?? 0) + 1
  }
  return Object.entries(speciesCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

const getImageSpeciesCount = (imageId: string): number => {
  const crops = getCropsForImage(imageId)
  if (crops.length === 0) return 0
  return new Set(crops.map(m => cropCorrections.value[m.crop_id] ?? m.class_name)).size
}

// ════════════════════════════════
//  HELPERS PAYLOAD / COUNTS
// ════════════════════════════════
const computeCounts = (microalgues: Microalgue[]): Record<string, number> => {
  const counts: Record<string, number> = { Karenia: 0, Alexandrium: 0, Autres: 0 }
  for (const m of microalgues) {
    if (m.class_name in counts) counts[m.class_name]++
  }
  return counts
}

const getDominantFromMicroalgues = (microalgues: Microalgue[]): string => {
  if (microalgues.length === 0) return 'Autres'
  const counts: Record<string, number> = {}
  for (const m of microalgues) {
    counts[m.class_name] = (counts[m.class_name] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Autres'
}

const resultFromStoredAnnotation = (
  image: ProjectImage,
  annotation: { result: string; url?: string | null }
): AnnotationResult => {
  if (annotation.url) {
    try {
      const parsed = JSON.parse(annotation.url)
      if (parsed?.version === 1 && Array.isArray(parsed?.microalgues)) {
        const microalgues = parsed.microalgues as Microalgue[]
        if (microalgues.length > 0) {
          return {
            id:                image.id,
            result_image_path: '',
            microalgues,
            counts: parsed.counts ?? computeCounts(microalgues),
          }
        }
      }
      if (Array.isArray(parsed?.microalgues) && parsed.microalgues.length > 0) {
        const microalgues = parsed.microalgues as Microalgue[]
        return {
          id:                image.id,
          result_image_path: '',
          microalgues,
          counts: parsed.counts ?? computeCounts(microalgues),
        }
      }
    } catch { /* url plain ou corrompue */ }
  }

  const cls = (['Karenia', 'Alexandrium', 'Autres'] as const).includes(
    annotation.result as any
  )
    ? (annotation.result as 'Karenia' | 'Alexandrium' | 'Autres')
    : 'Autres'

  return {
    id:                image.id,
    result_image_path: '',
    microalgues: [{
      crop_id:       `stored-${image.id}`,
      id:            image.id,
      url:           image.url,
      class_name:    cls,
      confidence:    1,
      probabilities: { [cls]: 1 },
      image_path:    image.url,
      validated:     true,
    }],
    counts: {
      Karenia:     cls === 'Karenia'     ? 1 : 0,
      Alexandrium: cls === 'Alexandrium' ? 1 : 0,
      Autres:      cls === 'Autres'      ? 1 : 0,
    },
  }
}

// ════════════════════════════════
//  AUTH HEADERS
// ════════════════════════════════
const getAuthHeaders = (): Record<string, string> => {
  const PATTERNS = ['sb-access-token', 'supabase.auth.token']
  for (const pattern of PATTERNS) {
    try {
      const raw = localStorage.getItem(pattern)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const token  = parsed?.access_token || parsed?.currentSession?.access_token || parsed?.session?.access_token
      if (token && token.length > 20) return { Authorization: `Bearer ${token}` }
    } catch { continue }
  }
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith('sb-') || !key.endsWith('-auth-token')) continue
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '{}')
      const token  = parsed?.access_token
      if (token && token.length > 20) return { Authorization: `Bearer ${token}` }
    } catch { continue }
  }
  return {}
}

// ════════════════════════════════
//  UTILITAIRES
// ════════════════════════════════
const formatDate = (d?: string) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const getCropsForImage = (imageId: string): Microalgue[] => {
  const result = annotationsResult.value.find(r => r.id === imageId)
  return result?.microalgues ?? []
}

const currentAnnotation = (imageId: string): string | null => {
  const crops = getCropsForImage(imageId)
  if (crops.length > 0) {
    const species = [...new Set(
      crops.map(c => cropCorrections.value[c.crop_id] ?? c.class_name)
    )]
    return species.join(' + ')
  }
  if (annotationTypes.value[imageId]) return annotationTypes.value[imageId]
  return null
}

const hasAnnotation = (imageId: string) => currentAnnotation(imageId) !== null

// ════════════════════════════════
//  SÉLECTION
// ════════════════════════════════
const handleCheckboxChange = (e: Event, image: ProjectImage) => {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    if (!selectedImageIds.value.includes(image.id))
      selectedImageIds.value = [...selectedImageIds.value, image.id]
    if (!selectedImages.value.some(i => i.id === image.id))
      selectedImages.value = [...selectedImages.value, { id: image.id, url: image.url }]
  } else {
    selectedImageIds.value = selectedImageIds.value.filter(id => id !== image.id)
    selectedImages.value   = selectedImages.value.filter(i => i.id !== image.id)
  }
  selectAll.value = selectedImageIds.value.length === projectImages.value.length
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedImageIds.value = []
    selectedImages.value   = []
    selectAll.value        = false
  } else {
    selectedImageIds.value = projectImages.value.map(img => img.id)
    selectedImages.value   = projectImages.value.map(({ id, url }) => ({ id, url }))
    selectAll.value        = true
  }
}

const handleCropCorrectionChange = (_imageId: string) => {
  hasModifiedAnnotations.value =
    Object.keys(cropCorrections.value).some(
      cropId => cropCorrections.value[cropId] !== originalCropCorrections.value[cropId]
    ) ||
    Object.keys(annotationTypes.value).some(
      id => annotationTypes.value[id] !== originalAnnotationTypes.value[id]
    )
}

const handleAnnotationChange = (_imageId: string) => {
  handleCropCorrectionChange(_imageId)
}

// ════════════════════════════════
//  BLOOM ALERT
// ════════════════════════════════
const checkAndNotifyBloom = async (results: AnnotationResult[]) => {
  let totalCells = 0, kareniaCells = 0, alexandriumCells = 0

  for (const res of results) {
    const cells = res.microalgues ?? []
    totalCells       += cells.length
    kareniaCells     += cells.filter(m => m.class_name === 'Karenia').length
    alexandriumCells += cells.filter(m => m.class_name === 'Alexandrium').length
  }
  if (totalCells === 0) return

  const kareniaPerc     = (kareniaCells / totalCells) * 100
  const alexandriumPerc = (alexandriumCells / totalCells) * 100
  let alertTriggered    = false
  let alertSpecies      = 'Karenia'
  let alertPercentage   = kareniaPerc
  let alertCells        = kareniaCells

  if (kareniaPerc >= BLOOM_THRESHOLD) {
    const severity = kareniaPerc >= BLOOM_HIGH_THRESHOLD ? 'BLOOM_CRITICAL' : 'BLOOM_HIGH'
    Object.assign(bloomAlert, { show: true, percentage: kareniaPerc, cellsCount: kareniaCells, totalCells, severity })
    ElMessage({ message: `🔴 ALERTE BLOOM KARENIA : ${kareniaPerc.toFixed(1)}%`, type: 'error', duration: 8000 })
    alertTriggered = true
  } else if (alexandriumPerc >= BLOOM_THRESHOLD) {
    alertSpecies = 'Alexandrium'; alertPercentage = alexandriumPerc; alertCells = alexandriumCells
    Object.assign(bloomAlert, { show: true, percentage: alexandriumPerc, cellsCount: alexandriumCells, totalCells, severity: 'ALEXANDRIUM_ALERT' })
    ElMessage({ message: `🟠 ALERTE ALEXANDRIUM : ${alexandriumPerc.toFixed(1)}%`, type: 'warning', duration: 8000 })
    alertTriggered = true
  }

  if (alertTriggered) {
    try {
      await axios.post(`${API_URL}/nest/api/notification/notify-bloom-alert`, {
        bloomPercentage: alertPercentage, alexandriumPercentage: alexandriumPerc,
        severityLevel: bloomAlert.severity, speciesName: alertSpecies,
        projectId: route.params.id, projectTitle: project.value?.title || 'Inconnu',
        imageCount: results.length, kareniaCells, alexandriumCells, alertCells, totalCells,
      }, { headers: getAuthHeaders() })
    } catch (err) { console.warn('Bloom alert non envoyée :', err) }
  }
}

// ════════════════════════════════
//  ANALYSE IA
// ════════════════════════════════
const viewAnnotations = async () => {
  if (!canAnnotate.value) { ElMessage.error('Accès refusé.'); return }
  if (selectedImages.value.length === 0) return
  activeTab.value = 'details'

  await aiModelStore.fetchAiModels({ take: 1, skip: 0 })
  const aiModelId = aiModelStore.aimodelList[0]?.id
  if (!aiModelId) { ElMessage.error('Aucun modèle IA disponible.'); return }

  try {
    loadingAnnotations.value = true
    analysisProgress.value   = 0
    bloomAlert.show          = false

    ElMessage.info({ message: `Envoi de ${selectedImages.value.length} image(s) au modèle IA...`, duration: 3000 })

    const progressInterval = setInterval(() => {
      if (analysisProgress.value < 80) analysisProgress.value += 5
    }, 300)

    let response: any
    try {
      response = await aiRequest<AnnotationResult[]>(
        'post', '/predict_from_urls',
        { selectedImages: selectedImages.value },
        { headers: { 'Content-Type': 'application/json' } }
      )
    } finally {
      clearInterval(progressInterval)
      analysisProgress.value = 100
    }

    annotationsResult.value = response.data

    for (const res of annotationsResult.value) {
      const crops   = res.microalgues ?? []
      const cropIds = crops.map((m: Microalgue) => m.crop_id).filter(Boolean)
      if (cropIds.length > 0) imageCropIds.value[res.id] = cropIds
      for (const crop of crops) {
        cropCorrections.value[crop.crop_id]         = crop.class_name
        originalCropCorrections.value[crop.crop_id] = crop.class_name
      }
    }
    _saveCropIds(imageCropIds.value)

    let totalCropsDetected = 0

    for (const res of annotationsResult.value) {
      const crops = res.microalgues ?? []
      totalCropsDetected += crops.length

      const speciesCounts: Record<string, number> = {}
      for (const crop of crops) {
        speciesCounts[crop.class_name] = (speciesCounts[crop.class_name] ?? 0) + 1
      }
      const dominantSpecies =
        Object.entries(speciesCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Autres'

      const initialPayload = JSON.stringify({
        version:     1,
        microalgues: crops,
        counts:      computeCounts(crops),
      })

      if (!imageAnnotationIds.value[res.id]) {
        // ✅ FIX P2025 : pas de validatedBy
        const created = await annotationStore.createAnnotation({
          data: {
            image:   { id: res.id },
            aimodel: { id: aiModelId },
            result:  dominantSpecies,
            url:     initialPayload,
          } as any,
        })
        const createdId = (created as any)?.id ?? (annotationStore.annotation as any)?.id
        if (createdId) imageAnnotationIds.value[res.id] = createdId
      } else {
        // ✅ FIX P2025 : pas de validatedBy
        await annotationStore.editAnnotation({
          id:   imageAnnotationIds.value[res.id],
          data: {
            result: dominantSpecies,
            url:    initialPayload,
          } as any,
        })
      }

      annotationTypes.value[res.id]         = dominantSpecies
      originalAnnotationTypes.value[res.id] = dominantSpecies
    }

    await checkAndNotifyBloom(annotationsResult.value)
    await notifyAfterAnalysis()
    await fetchDatasetStats()

    const msg = totalCropsDetected === 0
      ? `⚠️ ${annotationsResult.value.length} image(s) analysées — aucune microalgue détectée.`
      : `✅ ${annotationsResult.value.length} image(s) analysées — ${totalCropsDetected} microalgue(s) détectée(s) !`

    ElMessage({ message: msg, type: totalCropsDetected === 0 ? 'warning' : 'success', duration: 5000 })

  } catch (error: any) {
    console.error('Erreur analyse IA:', error)
    ElMessage.error(`Échec de l'analyse IA : ${error.response?.data?.detail || error.message || 'Erreur inconnue'}`)
  } finally {
    loadingAnnotations.value = false
    activeTab.value          = 'details'
    setTimeout(() => { analysisProgress.value = 0 }, 800)
  }
}

// ════════════════════════════════
//  VALIDATION
// ════════════════════════════════
const validateAnnotations = async () => {
  if (!canValidate.value) { ElMessage.error('Accès refusé.'); return }

  const cropToValidate = Object.entries(cropCorrections.value).filter(
    ([cropId, cls]) => originalCropCorrections.value[cropId] !== cls
  )
  const legacyToValidate = Object.entries(annotationTypes.value).filter(
    ([id, type]) => originalAnnotationTypes.value[id] !== type && getCropsForImage(id).length === 0
  )

  if (cropToValidate.length === 0 && legacyToValidate.length === 0) {
    ElMessage.info('Aucune modification à valider.')
    return
  }

  try {
    loadingAnnotations.value = true
    let fastApiOk = 0
    let nestjsOk  = 0

    for (const [cropId, confirmedClass] of cropToValidate) {
      try {
        await aiRequest('post', `/validate/${cropId}`, { confirmed_class: confirmedClass })
        fastApiOk++
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          console.warn(`FastAPI validate error [${cropId}]:`, err?.response?.data || err.message)
        }
      }
    }

    const imageIdsWithCorrections = new Set<string>()
    for (const [cropId] of cropToValidate) {
      for (const res of annotationsResult.value) {
        if ((res.microalgues ?? []).some(m => m.crop_id === cropId)) {
          imageIdsWithCorrections.add(res.id)
          break
        }
      }
    }

    const updatedAnnotationsResult: AnnotationResult[] = []

    for (const res of annotationsResult.value) {
      const correctedMicroalgues: Microalgue[] = (res.microalgues ?? []).map(m => {
        const correctedClass = cropCorrections.value[m.crop_id]
        return correctedClass
          ? { ...m, class_name: correctedClass as 'Karenia' | 'Alexandrium' | 'Autres', validated: true }
          : { ...m, validated: true }
      })

      const correctedCounts   = computeCounts(correctedMicroalgues)
      const correctedDominant = getDominantFromMicroalgues(correctedMicroalgues)

      updatedAnnotationsResult.push({ ...res, microalgues: correctedMicroalgues, counts: correctedCounts })

      if (imageIdsWithCorrections.has(res.id)) {
        const annotationId = imageAnnotationIds.value[res.id]
        if (!annotationId) continue

        const correctedPayload = JSON.stringify({
          version:     1,
          microalgues: correctedMicroalgues,
          counts:      correctedCounts,
        })

        try {
          // ✅ FIX P2025 : pas de validatedBy
          await annotationStore.editAnnotation({
            id:   annotationId,
            data: {
              result: correctedDominant,
              url:    correctedPayload,
            } as any,
          })
          nestjsOk++
          annotationTypes.value[res.id]         = correctedDominant
          originalAnnotationTypes.value[res.id] = correctedDominant
        } catch (err) {
          console.warn(`NestJS save error [${res.id}]:`, err)
        }
      }
    }

    annotationsResult.value = updatedAnnotationsResult

    for (const [imageId, newClass] of legacyToValidate) {
      const annotationId = imageAnnotationIds.value[imageId]
      if (!annotationId) continue
      try {
        // ✅ FIX P2025 : pas de validatedBy
        await annotationStore.editAnnotation({
          id:   annotationId,
          data: {
            result: newClass,
          } as any,
        })
        nestjsOk++
        annotationTypes.value[imageId]         = newClass
        originalAnnotationTypes.value[imageId] = newClass
      } catch (err) {
        console.warn(`NestJS legacy error [${imageId}]:`, err)
      }
    }

    originalCropCorrections.value = { ...cropCorrections.value }
    hasModifiedAnnotations.value  = false
    _saveCropIds(imageCropIds.value)

    await fetchDatasetStats()

    ElMessage({
      message:  `✅ ${fastApiOk} crop(s) corrigé(s) · ${nestjsOk} annotation(s) sauvegardée(s) en base`,
      type:     'success',
      duration: 6000,
    })

  } catch (error: any) {
    ElMessage.error(`Échec de la validation : ${error.message}`)
  } finally {
    loadingAnnotations.value = false
  }
}

// ════════════════════════════════
//  RETRAIN
// ════════════════════════════════
const triggerRetrain = async () => {
  if (datasetStats.total < 20) {
    ElMessage.warning(`Minimum 20 images requises. Actuellement : ${datasetStats.total}`)
    return
  }
  try {
    await ElMessageBox.confirm(
      `Lancer le réentraînement sur ${datasetStats.total} images ? (2-5 min)`,
      '🔄 Améliorer le modèle IA',
      { confirmButtonText: 'Lancer', cancelButtonText: 'Annuler', type: 'info' }
    )
    retraining.value = true
    const res = await aiRequest('post', '/retrain')
    ElMessage.success({ message: `🔄 ${res.data.message}`, duration: 8000 })
    setTimeout(fetchDatasetStats, 30_000)
  } catch (err: any) {
    if (err === 'cancel' || String(err).includes('cancel')) return
    ElMessage.error('Échec du lancement du réentraînement.')
  } finally {
    retraining.value = false
  }
}

// ════════════════════════════════
//  ACTIONS PROJET
// ════════════════════════════════
const handleEdit = () =>
  router.push({ name: editProjectRouteName.value, params: { id: route.params.id } })

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      'Êtes-vous sûr de vouloir supprimer ce projet ? Irréversible.',
      'Supprimer le projet',
      { confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler', type: 'warning' }
    )
    await deleteProject(project.value?.id as string)
    ElMessage.success('Projet supprimé avec succès.')
    router.push({ name: listProjectRouteName.value })
  } catch (err: any) {
    if (err === 'cancel' || String(err).includes('cancel')) return
    ElMessage.error('Échec de la suppression.')
  }
}

const notifyAfterAnalysis = async () => {
  try {
    await axios.post(
      `${API_URL}/nest/api/notification/notify-analysis`,
      { projectId: route.params.id, projectTitle: project.value?.title || 'Projet', imageCount: annotationsResult.value.length },
      { headers: getAuthHeaders() }
    )
  } catch (err) { console.warn('Notification analyse non envoyée:', err) }
}

// ════════════════════════════════
//  ANALYTICS
// ════════════════════════════════
const fetchDatasetStats = async () => {
  try {
    const res = await aiRequest<DatasetStats>('get', '/dataset/stats')
    datasetStats.total    = res.data.total    ?? 0
    datasetStats.by_class = res.data.by_class ?? { Alexandrium: 0, Autres: 0, Karenia: 0 }
    datasetStats.pending  = res.data.pending  ?? 0
  } catch { /* silencieux */ }
}

const destroyCharts = () => {
  Object.values(chartInstances.value).forEach(c => { try { c?.destroy() } catch { } })
  chartInstances.value = {}
}

const renderCharts = async () => {
  await nextTick()
  destroyCharts()

  const isDark    = matchMedia('(prefers-color-scheme: dark)').matches
  const textColor = isDark ? '#a0aec0' : '#64748b'
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'

  const donutEl = document.getElementById('donut-chart') as HTMLCanvasElement | null
  if (donutEl && totalCrops.value > 0) {
    chartInstances.value.donut = new Chart(donutEl, {
      type: 'doughnut',
      data: {
        labels:   ['Karenia', 'Alexandrium', 'Autres'],
        datasets: [{
          data: [countsBySpecies.value.Karenia, countsBySpecies.value.Alexandrium, countsBySpecies.value.Autres],
          backgroundColor: ['#dc2626', '#ea580c', '#16a34a'],
          borderWidth: 2, borderColor: isDark ? '#1a202c' : '#ffffff', hoverOffset: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: {
          legend:  { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} cellules` } },
        },
      },
    })
  }

  const barEl = document.getElementById('bar-chart') as HTMLCanvasElement | null
  if (barEl) {
    const ds = datasetStats.by_class ?? {}
    chartInstances.value.bar = new Chart(barEl, {
      type: 'bar',
      data: {
        labels:   ['Alexandrium', 'Autres', 'Karenia'],
        datasets: [{
          label: 'Fichiers',
          data:  [ds.Alexandrium ?? 0, ds.Autres ?? 0, ds.Karenia ?? 0],
          backgroundColor: ['#ea580c', '#16a34a', '#dc2626'],
          borderRadius: 5, borderWidth: 0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
        },
      },
    })
  }
}

const switchToAnalytics = async () => {
  activeTab.value = 'analytics'
  await fetchDatasetStats()
  if (totalCrops.value > 0) await renderCharts()
}

// ════════════════════════════════
//  WATCHERS
// ════════════════════════════════
watch(projectImages, () => {
  selectedImageIds.value = []
  selectedImages.value   = []
  selectAll.value        = false
  bloomAlert.show        = false
})

watch(activeTab, async tab => {
  if (tab === 'analytics') {
    await fetchDatasetStats()
    if (totalCrops.value > 0) await renderCharts()
  }
})

watch(annotationsResult, async () => {
  if (activeTab.value === 'analytics' && totalCrops.value > 0) await renderCharts()
})

// ════════════════════════════════
//  LIFECYCLE
// ════════════════════════════════
onMounted(async () => {
  const id = route.params.id as string

  await loadPermissions()
  isLoadingPermissions.value = false

  if (!canView.value) {
    ElMessage.error("Vous n'avez pas accès à ce projet")
    router.push('/dashboard')
    return
  }

  const data = await getProjectById(id)

  if (data?.images && Array.isArray(data.images)) {
    annotationsResult.value = []
    projectImages.value = data.images
      .filter((img: any) => img.id && img.url)
      .map((img: any) => ({ id: img.id, url: img.url, name: img.name, annotations: img.annotations }))

    projectImages.value.forEach((img: ProjectImage) => {
      if (img.annotations?.length) {
        const last = img.annotations[img.annotations.length - 1]
        if (last.result) {
          const restored = resultFromStoredAnnotation(img, last)
          annotationsResult.value.push(restored)

          for (const crop of restored.microalgues) {
            cropCorrections.value[crop.crop_id]         = crop.class_name
            originalCropCorrections.value[crop.crop_id] = crop.class_name
          }

          const dominant = getDominantFromMicroalgues(restored.microalgues)
          annotationTypes.value[img.id]         = dominant
          originalAnnotationTypes.value[img.id] = dominant
        }
        imageAnnotationIds.value[img.id] = last.id
      }
    })
  }

  await fetchDatasetStats()
  setCurrentPageBreadcrumbs('Project Details', ['Projects'])
})

onUnmounted(() => {
  destroyCharts()
})
</script>

<style lang="scss" scoped>
:root {
  --ocean:     #0066cc;
  --ocean-dk:  #004d99;
  --ocean-lt:  #e8f2ff;
  --teal:      #00b4d8;
  --success:   #10b981;
  --warn:      #f59e0b;
  --danger:    #ef4444;
  --ink:       #0f172a;
  --muted:     #64748b;
  --border:    #e2e8f0;
  --surface:   #f8fafc;
  --card:      #ffffff;
  --radius:    12px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08);
  --shadow-md: 0 4px 16px rgba(0,0,0,.10);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.12);
}

.loading-container {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 100vh; gap: 20px; background: var(--surface);
  .loading-pulse {
    position: relative; width: 80px; height: 80px;
    display: flex; align-items: center; justify-content: center;
    .pulse-ring {
      position: absolute; inset: 0; border-radius: 50%;
      border: 3px solid var(--ocean); opacity: 0;
      animation: pulse-ring 1.8s ease-out infinite;
      &--delay { animation-delay: .6s; }
    }
    .pulse-icon { font-size: 28px; color: var(--ocean); animation: spin 1s linear infinite; }
  }
  .loading-text { font-size: 15px; color: var(--muted); }
}
@keyframes pulse-ring {
  0%   { transform: scale(.6); opacity: .8; }
  100% { transform: scale(1.4); opacity: 0; }
}

.access-denied {
  min-height: 100vh; display: flex; align-items: center;
  justify-content: center; background: var(--surface);
  &__card {
    background: white; border-radius: 24px; padding: 56px 48px;
    text-align: center; box-shadow: var(--shadow-lg); max-width: 400px;
  }
  &__icon { font-size: 56px; margin-bottom: 16px; }
  h2 { font-size: 24px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
  p  { color: var(--muted); margin-bottom: 28px; font-size: 15px; }
}

.page-wrapper {
  display: flex; min-height: 100vh; background: var(--surface);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.sidebar {
  width: 240px; min-width: 240px;
  background: linear-gradient(175deg, #0a1628 0%, #0f2547 50%, #0d1f40 100%);
  display: flex; flex-direction: column; padding: 28px 20px; gap: 24px;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;

  &__brand {
    display: flex; align-items: center; gap: 10px;
    padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,.08);
    .brand-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 12px var(--teal); }
    .brand-name { font-size: 20px; font-weight: 800; color: white; letter-spacing: -.02em; }
  }
  &__nav    { display: flex; flex-direction: column; gap: 4px; }
  &__meta   { display: flex; flex-direction: column; gap: 10px; margin-top: auto; }
  &__dataset {
    background: rgba(255,255,255,.06); border-radius: 10px; padding: 12px;
    .dataset-title { font-size: 10px; color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
    .dataset-row   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .dataset-cls   { font-size: 12px; font-weight: 600; }
    .cls-Karenia     { color: #fca5a5; }
    .cls-Alexandrium { color: #fdba74; }
    .cls-Autres      { color: #86efac; }
    .dataset-count { font-size: 13px; font-weight: 700; color: white; }
    .dataset-total { font-size: 10px; color: rgba(255,255,255,.35); margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,.08); }
  }
  &__actions { display: flex; flex-direction: column; gap: 8px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.08); }
}

.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  border-radius: 10px; border: none; background: transparent;
  color: rgba(255,255,255,.55); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all .2s; width: 100%; text-align: left;
  .nav-icon { font-size: 16px; }
  &:hover  { background: rgba(255,255,255,.08); color: white; }
  &.active { background: rgba(0,180,216,.15); color: var(--teal); border-left: 3px solid var(--teal); }
}

.meta-card {
  background: rgba(255,255,255,.06); border-radius: 10px; padding: 10px 12px;
  &__label { font-size: 10px; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 3px; }
  &__value { font-size: 12px; color: rgba(255,255,255,.85); font-weight: 500; }
  .tool-badge { display: inline-block; background: rgba(0,180,216,.2); color: var(--teal); border-radius: 5px; padding: 1px 6px; font-size: 11px; }
}

.btn-edit, .btn-delete {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 14px;
  border-radius: 9px; border: none; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all .2s;
  &:disabled { opacity: .4; cursor: not-allowed; }
}
.btn-edit   { background: rgba(0,102,204,.25); color: #60a5fa; &:hover:not(:disabled) { background: rgba(0,102,204,.4); } }
.btn-delete { background: rgba(239,68,68,.15); color: #f87171; &:hover:not(:disabled) { background: rgba(239,68,68,.3); } }

.main-content { flex: 1; padding: 32px 36px; overflow-y: auto; max-width: calc(100vw - 240px); }

.breadcrumb-bar {
  display: flex; align-items: center; gap: 8px; margin-bottom: 24px; font-size: 13px; color: var(--muted);
  .breadcrumb-link    { cursor: pointer; color: var(--ocean); &:hover { text-decoration: underline; } }
  .breadcrumb-sep     { color: var(--border); }
  .breadcrumb-current { color: var(--ink); font-weight: 500; }
}

.project-hero {
  background: linear-gradient(135deg, #0066cc 0%, #0099cc 60%, #00b4d8 100%);
  border-radius: 20px; padding: 36px 40px; margin-bottom: 24px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;
  box-shadow: 0 8px 32px rgba(0,102,204,.25); position: relative; overflow: hidden;
  &::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,.06); }
}
.hero-content     { flex: 1; position: relative; z-index: 1; }
.hero-badge       { display: inline-block; background: rgba(255,255,255,.2); color: white; border-radius: 20px; padding: 3px 12px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 12px; backdrop-filter: blur(4px); }
.hero-title       { font-size: 28px; font-weight: 800; color: white; margin: 0 0 10px; line-height: 1.2; letter-spacing: -.02em; }
.hero-description { color: rgba(255,255,255,.8); font-size: 14px; line-height: 1.6; max-width: 520px; margin: 0; }
.hero-stats       { display: flex; gap: 12px; flex-shrink: 0; position: relative; z-index: 1; flex-wrap: wrap; align-items: center; }

.stat-pill {
  background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
  border-radius: 14px; padding: 10px 16px; text-align: center;
  border: 1px solid rgba(255,255,255,.2); min-width: 70px;
  &__number { display: block; font-size: 20px; font-weight: 800; color: white; line-height: 1; margin-bottom: 4px; }
  &__label  { display: block; font-size: 9px; color: rgba(255,255,255,.7); text-transform: uppercase; letter-spacing: .07em; }
}

.alert-badge {
  display: flex; align-items: center; gap: 10px; padding: 8px 18px; border-radius: 40px;
  backdrop-filter: blur(8px); animation: alertPulse 1.5s ease-in-out infinite; min-width: 120px;
  &--danger  { background: rgba(239,68,68,.25); border: 1px solid rgba(239,68,68,.6); box-shadow: 0 0 16px rgba(239,68,68,.25); }
  &--warning { background: rgba(245,158,11,.25); border: 1px solid rgba(245,158,11,.6); box-shadow: 0 0 16px rgba(245,158,11,.25); }
  &__icon    { font-size: 22px; }
  &__content { display: flex; flex-direction: column; align-items: flex-start; }
  &__percent { font-size: 18px; font-weight: 800; line-height: 1; }
  &--danger  &__percent { color: #fca5a5; }
  &--warning &__percent { color: #fdba74; }
  &__label   { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: rgba(255,255,255,.85); margin-top: 2px; }
}
@keyframes alertPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: .9; } }

.bloom-alert {
  position: relative; background: linear-gradient(135deg, #fef2f2, #fff5f5);
  border: 1.5px solid #fca5a5; border-left: 5px solid var(--danger);
  border-radius: 14px; margin-bottom: 24px; overflow: hidden; cursor: pointer;
  &__pulse { position: absolute; inset: 0; background: rgba(239,68,68,.03); animation: bloom-pulse 2s ease-in-out infinite; }
  &__body  { display: flex; align-items: center; gap: 16px; padding: 16px 20px; position: relative; z-index: 1; }
  &__icon  { font-size: 24px; }
  &__text  {
    flex: 1;
    strong { display: block; font-size: 14px; font-weight: 700; color: #991b1b; margin-bottom: 2px; }
    span   { font-size: 13px; color: #b91c1c; }
  }
  &__close { background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer; padding: 4px 8px; border-radius: 6px; &:hover { background: rgba(239,68,68,.1); } }
}
@keyframes bloom-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }

.section-heading {
  display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; color: var(--ink); margin: 0;
  &__icon { font-size: 18px; }
}
.count-badge { background: var(--ocean-lt); color: var(--ocean); font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.images-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.toolbar-left  { flex: 1; }
.toolbar-right { display: flex; gap: 10px; flex-wrap: wrap; }

.toolbar-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
  border-radius: 10px; border: none; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .2s; white-space: nowrap;
  &:disabled { opacity: .45; cursor: not-allowed; }
  &--secondary { background: white; color: var(--ink); border: 1.5px solid var(--border); &:hover:not(:disabled) { border-color: var(--ocean); color: var(--ocean); } }
  &--success   { background: linear-gradient(135deg, #059669, #10b981); color: white; box-shadow: 0 3px 10px rgba(16,185,129,.3); &:hover:not(:disabled) { transform: translateY(-1px); } }
  &--warning   { background: linear-gradient(135deg, #d97706, #f59e0b); color: white; box-shadow: 0 3px 10px rgba(245,158,11,.3); &:hover:not(:disabled) { transform: translateY(-1px); } }
  &--retrain   { background: linear-gradient(135deg, #6d28d9, #8b5cf6); color: white; box-shadow: 0 3px 10px rgba(109,40,217,.3); &:hover:not(:disabled) { transform: translateY(-1px); } }
}
.btn-loading { display: flex; align-items: center; gap: 6px; }

.analysis-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(15,23,42,.7); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}
.analysis-card {
  background: white; border-radius: 24px; padding: 48px 40px;
  text-align: center; box-shadow: var(--shadow-lg); max-width: 380px; width: 90%;
  h3 { font-size: 22px; font-weight: 700; color: var(--ink); margin: 16px 0 8px; }
  p  { color: var(--muted); font-size: 14px; margin-bottom: 24px; }
}
.analysis-animation {
  position: relative; width: 80px; height: 80px; margin: 0 auto;
  background: var(--ocean-lt); border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 36px;
  .scan-line { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, var(--ocean), transparent); animation: scan 1.5s ease-in-out infinite; border-radius: 2px; }
}
@keyframes scan { 0% { top: 5%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 92%; opacity: 0; } }
.progress-bar {
  height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;
  &__fill { height: 100%; background: linear-gradient(90deg, var(--ocean), var(--teal)); border-radius: 3px; transition: width .3s ease; }
}
.progress-text { font-size: 12px; color: var(--muted); margin-top: 6px; }

.image-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; transition: opacity .3s;
  &--loading { opacity: .6; pointer-events: none; }
  &__empty   { grid-column: 1 / -1; }
}

.image-card {
  position: relative; aspect-ratio: 1; border-radius: 14px; overflow: hidden; background: #e2e8f0;
  transition: all .25s cubic-bezier(.34, 1.56, .64, 1); border: 2px solid transparent; box-shadow: var(--shadow-sm);
  &:hover         { transform: translateY(-3px) scale(1.01); box-shadow: var(--shadow-md); }
  &--selected     { border-color: var(--ocean); box-shadow: 0 0 0 3px rgba(0,102,204,.15), var(--shadow-md); }
  &--karenia      { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.12); }
  &--alexandrium  { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.12); }
  &--autres       { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.12); }
  &--multi        { border-color: transparent; background-clip: padding-box; box-shadow: 0 0 0 2px #ef4444, 0 0 0 4px #f59e0b, var(--shadow-md); }
  &--analyzing    { animation: analyzing-glow 1s ease-in-out infinite alternate; }
}
@keyframes analyzing-glow {
  from { box-shadow: 0 0 0 2px rgba(0,102,204,.3); }
  to   { box-shadow: 0 0 0 6px rgba(0,102,204,.15), 0 0 20px rgba(0,180,216,.2); }
}

.custom-checkbox {
  position: absolute; top: 8px; left: 8px; z-index: 10; cursor: pointer;
  input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
  .checkbox-visual {
    display: flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 6px;
    background: rgba(255,255,255,.92); border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,.25); transition: all .18s; backdrop-filter: blur(4px);
    svg { width: 12px; height: 12px; }
  }
  &.checked .checkbox-visual { background: var(--ocean); border-color: var(--ocean); }
  &:hover .checkbox-visual   { border-color: var(--ocean); transform: scale(1.1); }
  &:has(input:disabled)      { cursor: not-allowed; opacity: .5; }
}

.card-image {
  width: 100%; height: 100%;
  :deep(.el-image__inner) { object-fit: cover; width: 100%; height: 100%; }
}
.image-error {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: var(--muted); background: var(--surface); gap: 8px; font-size: 12px;
  .el-icon { font-size: 28px; }
}

.annotation-overlay {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 6px;
  background: linear-gradient(to top, rgba(0,0,0,.8) 0%, transparent 100%);
  display: flex; justify-content: center; align-items: flex-end; min-height: 56px; z-index: 6;
}
.analyzing-badge {
  display: flex; align-items: center; gap: 5px; background: rgba(0,102,204,.85); color: white;
  font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; backdrop-filter: blur(4px);
}

.crops-list {
  display: flex; flex-direction: column; gap: 4px; width: 100%; padding: 4px;
  background: rgba(0,0,0,.5); border-radius: 8px; backdrop-filter: blur(6px);
  max-height: 120px; overflow-y: auto;
  &::-webkit-scrollbar       { width: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,.3); border-radius: 2px; }
}
.crop-row { display: flex; align-items: center; gap: 4px; width: 100%; }

.crop-select {
  width: 100% !important;
  :deep(.el-input__wrapper) { background: rgba(255,255,255,.95) !important; border: 1.5px solid rgba(15,23,42,.3) !important; box-shadow: 0 2px 6px rgba(0,0,0,.2) !important; border-radius: 6px !important; padding: 0 6px !important; }
  :deep(.el-input__inner)   { color: #0f172a !important; font-size: 11px !important; font-weight: 700 !important; height: 26px !important; }
  :deep(.el-select__caret)  { color: #0f172a !important; }
}
.annotation-select-custom {
  width: 100%;
  :deep(.el-input__wrapper) { background: #ffffff; border: 2px solid #0f172a; box-shadow: 0 3px 10px rgba(0,0,0,.28); border-radius: 8px; }
  :deep(.el-input__inner)   { color: #0f172a; font-size: 12px; font-weight: 900; }
  :deep(.el-select__caret)  { color: #0f172a; }
}
.annotation-tag {
  font-size: 11px; font-weight: 900; padding: 3px 9px; border-radius: 20px;
  letter-spacing: .02em; background: #ffffff; box-shadow: 0 3px 10px rgba(0,0,0,.28); white-space: nowrap;
  &.tag--karenia     { color: #dc2626; border: 2px solid #dc2626; }
  &.tag--alexandrium { color: #ea580c; border: 2px solid #ea580c; }
  &.tag--autres      { color: #15803d; border: 2px solid #16a34a; }
}
.crop-conf { font-size: 9px; opacity: .65; margin-left: 2px; font-weight: 400; }

.selected-shimmer {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(135deg, rgba(0,102,204,.06) 0%, rgba(0,180,216,.04) 100%);
  border-radius: inherit;
}

.empty-state {
  text-align: center; padding: 64px 24px; background: white;
  border-radius: 16px; border: 2px dashed var(--border);
  &__icon { font-size: 48px; margin-bottom: 16px; opacity: .5; }
  h3 { font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
  p  { color: var(--muted); font-size: 14px; }
}

.tab-content { animation: fade-up .3s ease-out; }
@keyframes fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.btn-primary-custom { background: linear-gradient(135deg, var(--ocean), var(--teal)) !important; border: none !important; border-radius: 10px !important; padding: 10px 24px !important; font-weight: 600 !important; }
.permissions-panel  { background: #ffffff; border: 1px solid rgba(15,23,42,.1); border-radius: 16px; padding: 22px; box-shadow: 0 6px 18px rgba(15,23,42,.08); }
.btn-permissions {
  display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px;
  border-radius: 10px; border: 1px solid #0057b8; background: #0066cc; color: #ffffff;
  font-size: 14px; font-weight: 800; cursor: pointer; transition: all .2s;
  box-shadow: 0 4px 12px rgba(0,102,204,.28);
  &:hover { background: #004f9f; transform: translateY(-1px); box-shadow: 0 8px 18px rgba(0,102,204,.34); }
}

.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.analytics-tab { display: flex; flex-direction: column; gap: 16px; background: #f8fafc; border: 1px solid rgba(15,23,42,.08); border-radius: 18px; padding: 18px; }
.analytics-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); } }
.a-metric {
  background: #ffffff; border-radius: 12px; padding: 16px; border: 1px solid rgba(15,23,42,.08); box-shadow: 0 1px 3px rgba(15,23,42,.04);
  &__label { font-size: 11px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .04em; }
  &__value { font-size: 28px; font-weight: 700; color: var(--ink); }
  &__sub   { font-size: 11px; color: var(--muted); margin-top: 4px; }
  &--danger &__value { color: #dc2626; }
}
.a-bloom-alert {
  display: flex; align-items: center; gap: 14px;
  background: #fef2f2; border: 1px solid #fca5a5; border-left: 4px solid #ef4444; border-radius: 10px; padding: 14px 18px;
  &__icon { font-size: 22px; }
  strong { display: block; font-size: 14px; font-weight: 700; color: #991b1b; }
  span   { font-size: 12px; color: #b91c1c; }
}
.a-empty {
  text-align: center; padding: 60px 24px; background: white; border-radius: 16px; border: 2px dashed var(--border);
  &__icon { font-size: 48px; margin-bottom: 16px; opacity: .4; }
  h3 { font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
  p  { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
}
.a-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; @media (max-width: 900px) { grid-template-columns: 1fr; } }
.a-chart-card { background: #ffffff; border: 1px solid rgba(15,23,42,.08); border-radius: 14px; padding: 18px; box-shadow: 0 1px 4px rgba(15,23,42,.05); }
.a-chart-title { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
.a-chart-wrap  { position: relative; width: 100%; }
.a-legend {
  display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 10px;
  &__item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted); }
  &__sq   { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
}
.a-table-wrap { overflow-x: auto; }
.a-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
  th { text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: .04em; }
  td { padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--ink); vertical-align: middle; }
  &__id { font-family: monospace; font-size: 11px; color: var(--muted); }
}
.species-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.a-species-pill {
  display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;
  &--k { background: #fee2e2; color: #991b1b; }
  &--a { background: #ffedd5; color: #9a3412; }
  &--o { background: #dcfce7; color: #166534; }
}
.a-bar-wrap { background: #f1f5f9; border-radius: 4px; height: 8px; width: 120px; overflow: hidden; }
.a-bar-fill { height: 100%; border-radius: 4px; transition: width .3s ease; }

@media (max-width: 768px) {
  .page-wrapper  { flex-direction: column; }
  .sidebar {
    width: 100%; min-width: unset; height: auto; position: static;
    flex-direction: row; flex-wrap: wrap; padding: 16px;
    &__meta, &__actions, &__dataset { display: none; }
    &__nav { flex-direction: row; }
  }
  .main-content  { padding: 20px 16px; max-width: 100%; }
  .project-hero  { flex-direction: column; }
  .hero-stats    { flex-wrap: wrap; gap: 8px; }
  .stat-pill     { padding: 6px 12px; min-width: 55px; &__number { font-size: 16px; } &__label { font-size: 8px; } }
  .alert-badge   { padding: 6px 12px; min-width: 100px; &__icon { font-size: 16px; } &__percent { font-size: 14px; } &__label { font-size: 7px; } }
  .image-grid    { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
  .analytics-metrics { grid-template-columns: repeat(2, 1fr); }
  .a-charts-row  { grid-template-columns: 1fr; }
}
</style>