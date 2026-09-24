// test-final-avec-vos-ids.js
const axios = require('axios')

const BASE_URL = 'http://localhost:3005/nest/api'

// VOTRE TOKEN (admin)
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzYwNzQ5OTEsInN1YiI6ImNkMjg2OTAxLWIyYzItNGJiMC1iYzAzLWZkNjZjZTM5YzkwNiIsImVtYWlsIjoic291cm91ci5oYWRkYWppMUBpc2ltZy50biIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnt9LCJyb2xlIjoidXNlciIsInNlc3Npb25faWQiOiI1YzIzNDQxMi0xNWU0LTQ1ZjUtOTE1YS03MzQyZWRmNGY1MDMifQ.clCjV-X5udMn3h4wjn_RKSVfW4AJqAOJyMkzm0rytoM'

// VOS IDS RÉELS
const ADMIN_ID = 'aa61ccb6-0291-45e6-8051-1e5313787947'
const EXPERT_ID = 'd2afc002-455f-4d5b-8192-9858c0dbd2df'

// Récupérer un ID de projet existant (depuis les données)
const PROJECT_ID = 'b1d68cb9-6729-42ae-9ccc-f45ade38386c' // "ddddddd"

const headers = { Authorization: `Bearer ${TOKEN}` }

async function testPermissions() {
  console.log('🚀 TEST DES PERMISSIONS AVEC VOS IDS\n')
  console.log('=' .repeat(60))

  // 1. Vérifier vos rôles
  console.log('\n1️⃣  VÉRIFICATION DES RÔLES')
  console.log(`   Admin ID: ${ADMIN_ID}`)
  console.log(`   Expert ID: ${EXPERT_ID}`)
  console.log(`   Projet ID: ${PROJECT_ID}`)

  // 2. Donner des permissions à l'Expert
  console.log('\n2️⃣  DONNER DES PERMISSIONS À L\'EXPERT')
  try {
    const grant = await axios.post(`${BASE_URL}/project-permission/grant`, {
      projectId: PROJECT_ID,
      userId: EXPERT_ID,
      canView: true,
      canUpload: true,
      canAnnotate: true,
      canValidate: true,   // Expert peut valider
      canEdit: false,
      canDelete: false
    }, { headers })
    
    console.log('   ✅ Permissions accordées!')
    console.log(`      ${JSON.stringify(grant.data, null, 2)}`)
  } catch (error) {
    console.error('   ❌ Erreur:', error.response?.data?.message || error.message)
  }

  // 3. Lire les permissions de l'Expert
  console.log('\n3️⃣  LIRE LES PERMISSIONS DE L\'EXPERT')
  try {
    const perms = await axios.get(`${BASE_URL}/project-permission/${PROJECT_ID}/${EXPERT_ID}`, { headers })
    console.log('   ✅ Permissions actuelles:')
    console.log(`      View: ${perms.data.canView}`)
    console.log(`      Upload: ${perms.data.canUpload}`)
    console.log(`      Annotate: ${perms.data.canAnnotate}`)
    console.log(`      Validate: ${perms.data.canValidate}`)
    console.log(`      Edit: ${perms.data.canEdit}`)
    console.log(`      Delete: ${perms.data.canDelete}`)
  } catch (error) {
    console.error('   ❌ Erreur:', error.response?.data?.message || error.message)
  }

  // 4. Lister tous les utilisateurs avec permissions sur ce projet
  console.log('\n4️⃣  UTILISATEURS AVEC PERMISSIONS SUR CE PROJET')
  try {
    const users = await axios.get(`${BASE_URL}/project-permission/${PROJECT_ID}/users`, { headers })
    console.log(`   ✅ ${users.data.length} utilisateur(s):`)
    users.data.forEach(u => {
      console.log(`      - ${u.user?.email}: View=${u.canView}, Upload=${u.canUpload}, Validate=${u.canValidate}`)
    })
  } catch (error) {
    console.error('   ❌ Erreur:', error.response?.data?.message || error.message)
  }

  // 5. (Optionnel) Révoquer les permissions
  console.log('\n5️⃣  (OPTIONNEL) RÉVOQUER LES PERMISSIONS')
  console.log('   Pour révoquer, décommentez les lignes ci-dessous')
  // try {
  //   await axios.delete(`${BASE_URL}/project-permission/${PROJECT_ID}/${EXPERT_ID}`, { headers })
  //   console.log('   ✅ Permissions révoquées')
  // } catch (error) {
  //   console.error('   ❌ Erreur:', error.response?.data?.message)
  // }

  console.log('\n' + '='.repeat(60))
  console.log('✨ TEST TERMINÉ !')
}

testPermissions()