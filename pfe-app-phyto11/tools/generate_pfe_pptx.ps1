param(
  [string]$Output = "Presentation_PFE_Phyto_20min.pptx"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$outPath = Join-Path $root $Output
$work = Join-Path $root "tmp_pptx_build"

if (Test-Path $work) { Remove-Item -LiteralPath $work -Recurse -Force }
New-Item -ItemType Directory -Force -Path $work | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "_rels") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "docProps") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt\_rels") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt\slides") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt\slides\_rels") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt\media") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt\theme") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt\slideMasters") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt\slideMasters\_rels") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt\slideLayouts") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work "ppt\slideLayouts\_rels") | Out-Null

function X([string]$s) {
  if ($null -eq $s) { return "" }
  return [System.Security.SecurityElement]::Escape($s)
}

function Emu([double]$inches) {
  return [int64]([Math]::Round($inches * 914400))
}

$mediaMap = @{}
$mediaCounter = 0
function Add-Media([string]$relativePath) {
  if ([string]::IsNullOrWhiteSpace($relativePath)) { return $null }
  $full = Join-Path $root $relativePath
  if (!(Test-Path $full)) { return $null }
  if ($mediaMap.ContainsKey($relativePath)) { return $mediaMap[$relativePath] }
  $script:mediaCounter += 1
  $ext = [IO.Path]::GetExtension($full).TrimStart(".").ToLowerInvariant()
  $name = "image$script:mediaCounter.$ext"
  Copy-Item -LiteralPath $full -Destination (Join-Path $work "ppt\media\$name") -Force
  $mediaMap[$relativePath] = @{ Target = "../media/$name"; Name = $name; Ext = $ext }
  return $mediaMap[$relativePath]
}

function TextShape([int]$id, [double]$x, [double]$y, [double]$w, [double]$h, [string[]]$lines, [int]$fontSize, [string]$color = "334155", [switch]$Bold) {
  $p = ""
  foreach ($line in $lines) {
    $safe = X $line
    $b = if ($Bold) { ' b="1"' } else { "" }
    $p += "<a:p><a:r><a:rPr lang=""fr-FR"" sz=""$($fontSize*100)""$b><a:solidFill><a:srgbClr val=""$color""/></a:solidFill></a:rPr><a:t>$safe</a:t></a:r></a:p>"
  }
  return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$id" name="Text $id"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
  <p:spPr><a:xfrm><a:off x="$(Emu $x)" y="$(Emu $y)"/><a:ext cx="$(Emu $w)" cy="$(Emu $h)"/></a:xfrm><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>
  <p:txBody><a:bodyPr wrap="square" anchor="t"/><a:lstStyle/>$p</p:txBody>
</p:sp>
"@
}

function RectShape([int]$id, [double]$x, [double]$y, [double]$w, [double]$h, [string]$fill, [string]$line = "FFFFFF", [int]$alpha = 100000) {
  return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$id" name="Rect $id"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="$(Emu $x)" y="$(Emu $y)"/><a:ext cx="$(Emu $w)" cy="$(Emu $h)"/></a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    <a:solidFill><a:srgbClr val="$fill"><a:alpha val="$alpha"/></a:srgbClr></a:solidFill>
    <a:ln w="6350"><a:solidFill><a:srgbClr val="$line"/></a:solidFill></a:ln>
  </p:spPr>
</p:sp>
"@
}

function PictureShape([int]$id, [double]$x, [double]$y, [double]$w, [double]$h, [string]$rid) {
  return @"
<p:pic>
  <p:nvPicPr><p:cNvPr id="$id" name="Image $id"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
  <p:blipFill><a:blip r:embed="$rid"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
  <p:spPr><a:xfrm><a:off x="$(Emu $x)" y="$(Emu $y)"/><a:ext cx="$(Emu $w)" cy="$(Emu $h)"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
</p:pic>
"@
}

$slides = @(
  @{T="Application intelligente pour la detection et le suivi des microalgues"; S="PFE - Soutenance 20 minutes"; B=@("Detection, segmentation et classification des microalgues", "Validation experte et amelioration continue", "Cas : Karenia, Alexandrium et Autres"); I="Figures\generated_pfe\01_cover_lab_ai.png"; N="Bonjour. Je presente une application web intelligente qui analyse des images microscopiques de microalgues, propose des predictions IA, puis laisse l'expert valider les resultats."; Layout="cover"},
  @{T="Contexte general"; B=@("Les microalgues sont essentielles dans les ecosystemes aquatiques.", "Certaines especes peuvent provoquer des blooms algaux.", "Le suivi repose encore fortement sur l'observation experte.", "Besoin : accelerer l'analyse sans supprimer la validation humaine."); I="Figures\generated_pfe\02_context_existing.png"; N="Le contexte du projet est la surveillance scientifique des microalgues. L'application assiste l'expert en automatisant les taches repetitives et en gardant la decision humaine."},
  @{T="Analyse de l'existant"; B=@("Observation manuelle precise mais lente.", "Images, annotations et resultats souvent disperses.", "Comptage et classification peu automatises.", "Corrections expertes rarement reutilisees pour ameliorer le modele."); I="Figures\generated_pfe\02_context_existing.png"; N="L'existant montre un besoin de centralisation, de rapidite et de traçabilite. Le projet repond a ces limites avec une plateforme integree."},
  @{T="Problematique et motivation"; B=@("Comment passer d'une image microscopique brute a une information fiable et exploitable ?", "Motivations : gain de temps, reduction des erreurs repetitives, centralisation, alertes, dataset valide.", "Principe : l'IA propose, l'expert confirme."); I="Figures\generated_pfe\03_ai_pipeline.png"; N="La problematique consiste a concevoir un systeme capable de detecter, classifier, calculer des statistiques, generer des alertes et apprendre des corrections expertes."},
  @{T="Objectifs du PFE"; B=@("Gerer les projets, utilisateurs, images et permissions.", "Importer et organiser des images microscopiques.", "Lancer une analyse IA sur les images selectionnees.", "Afficher les resultats : classe, score, crop, bbox et probabilites.", "Valider ou corriger les predictions.", "Suivre les analytics et alertes bloom."); I="Figures\generated_pfe\05_bloom_analytics.png"; N="L'objectif est une application complete, utilisable dans un workflow metier : preparation, analyse, validation et decision."},
  @{T="Conduite du projet : Waterfall"; B=@("1. Analyse des besoins", "2. Conception UML et architecture", "3. Implementation frontend, backend et IA", "4. Tests fonctionnels et validation", "5. Livraison et documentation"); I="Figures\chapter4\architecture_generale_simple.svg"; N="La methode Waterfall structure le travail : comprendre les besoins, concevoir l'architecture, implementer, tester et documenter."},
  @{T="Analyse des besoins et acteurs"; B=@("Visiteur : inscription et connexion.", "Technicien : projet, import images et lancement analyse.", "Expert : validation, correction et reentrainement.", "Administrateur : utilisateurs, permissions, modeles, alertes.", "Besoin transversal : securite et traçabilite."); I="Figures\chapter4\architecture_generale_simple.svg"; N="Les roles sont separes pour securiser les actions. Les permissions par projet controlent la consultation, l'import, l'annotation, la validation, l'edition et la suppression."},
  @{T="Conception : architecture generale"; B=@("Frontend Vue : interface, projets, analytics, validation.", "Backend NestJS : logique metier, securite, notifications.", "API IA FastAPI : prediction, validation, dataset, reentrainement.", "PostgreSQL/Supabase : persistance et authentification.", "Docker/Kong : orchestration et gateway."); I="Figures\chapter4\architecture_generale_simple.svg"; N="L'architecture est modulaire : chaque service a une responsabilite claire, ce qui facilite la maintenance et l'evolution."},
  @{T="Architecture physique"; B=@("Client UI : port 3001.", "Backend NestJS : port 3005.", "API IA : port 8001.", "Kong Gateway : port 8015.", "PostgreSQL : port 5433.", "Services conteneurises avec Docker Compose."); I="Figures\chapter4\docker_containers.svg"; N="Le deploiement local se fait en plusieurs conteneurs. Cette separation isole les services et rend l'environnement reproductible."},
  @{T="Architecture frontend"; B=@("Vue 3, TypeScript et Vite.", "Pinia pour l'etat applicatif.", "Vue Router pour la navigation.", "Axios pour les appels API.", "ApexCharts / Chart.js pour les graphiques.", "Ecrans : dashboard, projets, images, resultats IA, analytics, permissions."); I="Figures\chapter4\frontend_architecture.svg"; N="Le frontend porte le workflow utilisateur : selectionner les images, lancer l'analyse, lire les resultats, valider et interpreter les statistiques."},
  @{T="Architecture backend"; B=@("NestJS + Prisma + PostgreSQL.", "Modules : Auth, User, Project, Image, Annotation, AiModel.", "Gestion fine des droits : canView, canUpload, canAnnotate, canValidate, canEdit, canDelete.", "Notifications et alertes bloom.", "Documentation API avec Swagger."); I="Figures\chapter4\backend_architecture.svg"; N="Le backend est la couche metier et securite. Il controle les acces, persiste les donnees et coordonne les notifications."},
  @{T="Module IA : CRISP-DM"; B=@("Business understanding : besoin d'identification rapide.", "Data understanding : images microscopiques.", "Data preparation : crops, normalisation, augmentation.", "Modeling : YOLO, SAM2, ResNet50.", "Evaluation : confiance et validation expert.", "Deployment : API FastAPI integree."); I="Figures\generated_pfe\03_ai_pipeline.png"; N="Pour l'IA, j'ai suivi CRISP-DM : comprendre le besoin, preparer les donnees, modeliser, evaluer et deployer."},
  @{T="Donnees et preparation"; B=@("Classes : Karenia, Alexandrium, Autres.", "Chargement depuis URL, fichier local ou data image.", "Controle format et conversion image.", "Extraction des crops detectes.", "Normalisation 224 x 224 pour ResNet.", "Data augmentation : rotations, flips, luminosite, contraste."); I="Figures\generated_pfe\03_ai_pipeline.png"; N="La preparation des donnees est essentielle. Les crops normalises et augmentes rendent le modele plus robuste face aux variations microscopiques."},
  @{T="Detection avec YOLO"; B=@("Role : localiser les microalgues dans l'image.", "Sortie : bounding boxes, classe YOLO, score de confiance.", "Parametres utilises : confidence 0.15, IoU 0.50.", "Chaque detection devient un crop independant.", "Base de la validation cellule par cellule."); I="Figures\generated_pfe\03_ai_pipeline.png"; N="YOLO detecte les objets dans l'image. Cette etape transforme une image complete en cellules candidates a classifier."},
  @{T="Segmentation SAM2 et classification ResNet50"; B=@("SAM2 : masque de segmentation optionnel.", "ResNet50 : classification du crop.", "Classes principales : Karenia et Alexandrium.", "Si confiance < 50 %, classe finale = Autres.", "Sortie : probabilites par classe et score de confiance."); I="Figures\generated_pfe\03_ai_pipeline.png"; N="SAM2 ameliore la visualisation de la zone detectee. ResNet50 donne la classe finale avec une probabilite. Le seuil limite les predictions forcees."},
  @{T="Validation experte et apprentissage continu"; B=@("Chaque crop possede un identifiant crop_id.", "L'expert confirme ou corrige la prediction.", "Endpoint : POST /validate/{crop_id}.", "Le crop valide alimente le dataset par classe.", "Statistiques dataset : GET /dataset/stats.", "Reentrainement : POST /retrain."); I="Figures\generated_pfe\04_human_validation_learning.png"; N="La validation expert est le coeur de la fiabilite. Les corrections deviennent de nouvelles donnees d'entrainement et ferment la boucle d'apprentissage."},
  @{T="Fonctionnalites et interface"; B=@("Dashboard et gestion des projets.", "Import et galerie d'images.", "Analyse IA par selection d'images.", "Resultats avec classes, scores, crops et masques.", "Correction et validation expert.", "Analytics, notifications et permissions."); I="Figures\generated_pfe\05_bloom_analytics.png"; N="L'interface suit le flux metier naturel : projet, images, analyse, validation, statistiques et decision."},
  @{T="Alertes bloom et aide a la decision"; B=@("Calcul des pourcentages par espece.", "Detection d'un seuil critique de Karenia.", "Notification des experts et administrateurs.", "Deduplication des alertes recentes.", "Objectif : decision rapide, structuree et traçable."); I="Figures\generated_pfe\05_bloom_analytics.png"; N="Les resultats IA sont transformes en indicateurs metier. L'alerte bloom aide a reagir rapidement lorsque le seuil est atteint."},
  @{T="Outils et technologies"; B=@("Frontend : Vue 3, TypeScript, Vite, Pinia, Axios, ApexCharts.", "Backend : NestJS, Prisma, PostgreSQL, Swagger, JWT, Supabase Auth.", "IA : FastAPI, PyTorch, Torchvision, YOLO, SAM2, ResNet50, OpenCV, PIL, NumPy.", "DevOps : Docker Compose et Kong Gateway."); I="Figures\chapter4\ai_architecture.svg"; N="La stack est choisie pour separer interface, metier, donnees et IA, tout en gardant un environnement deployable."},
  @{T="Resultats, apports et perspectives"; B=@("Application web fonctionnelle et modulaire.", "Pipeline IA integre : YOLO -> SAM2 -> ResNet50.", "Validation experte et dataset enrichi.", "Analytics, notifications et alertes bloom.", "Perspectives : plus de donnees, metriques precision/rappel/F1, optimisation inference, deploiement production."); I="Figures\generated_pfe\01_cover_lab_ai.png"; N="Le projet apporte une solution complete : analyse automatisee, decision humaine, traçabilite et amelioration continue du modele IA."}
)

function Write-Utf8NoBom([string]$path, [string]$content) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $enc)
}

$slideRels = ""
$sldIds = ""
for ($i = 1; $i -le $slides.Count; $i++) {
  $rid = "rId$($i+1)"
  $slideRels += "<Relationship Id=""$rid"" Type=""http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"" Target=""slides/slide$i.xml""/>"
  $sldIds += "<p:sldId id=""$($255+$i)"" r:id=""$rid""/>"
}

$contentOverrides = ""
for ($i = 1; $i -le $slides.Count; $i++) {
  $contentOverrides += "<Override PartName=""/ppt/slides/slide$i.xml"" ContentType=""application/vnd.openxmlformats-officedocument.presentationml.slide+xml""/>"
}

Write-Utf8NoBom (Join-Path $work "[Content_Types].xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="svg" ContentType="image/svg+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  $contentOverrides
</Types>
"@

Write-Utf8NoBom (Join-Path $work "_rels\.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

Write-Utf8NoBom (Join-Path $work "docProps\core.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Presentation PFE Phyto</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-06-13T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-13T00:00:00Z</dcterms:modified>
</cp:coreProperties>
"@

Write-Utf8NoBom (Join-Path $work "docProps\app.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft PowerPoint</Application>
  <PresentationFormat>Widescreen</PresentationFormat>
  <Slides>$($slides.Count)</Slides>
</Properties>
"@

Write-Utf8NoBom (Join-Path $work "ppt\presentation.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>$sldIds</p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="wide"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>
"@

Write-Utf8NoBom (Join-Path $work "ppt\_rels\presentation.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  $slideRels
</Relationships>
"@

Write-Utf8NoBom (Join-Path $work "ppt\slideMasters\slideMaster1.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>
"@

Write-Utf8NoBom (Join-Path $work "ppt\slideMasters\_rels\slideMaster1.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>
"@

Write-Utf8NoBom (Join-Path $work "ppt\slideLayouts\slideLayout1.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
</p:sldLayout>
"@

Write-Utf8NoBom (Join-Path $work "ppt\slideLayouts\_rels\slideLayout1.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>
"@

Write-Utf8NoBom (Join-Path $work "ppt\theme\theme1.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Phyto PFE">
  <a:themeElements>
    <a:clrScheme name="Phyto"><a:dk1><a:srgbClr val="0B1F33"/></a:dk1><a:lt1><a:srgbClr val="F7FAFC"/></a:lt1><a:dk2><a:srgbClr val="334155"/></a:dk2><a:lt2><a:srgbClr val="FFFFFF"/></a:lt2><a:accent1><a:srgbClr val="1B8A5A"/></a:accent1><a:accent2><a:srgbClr val="19A7CE"/></a:accent2><a:accent3><a:srgbClr val="E85D04"/></a:accent3><a:accent4><a:srgbClr val="64748B"/></a:accent4><a:accent5><a:srgbClr val="0F766E"/></a:accent5><a:accent6><a:srgbClr val="14B8A6"/></a:accent6><a:hlink><a:srgbClr val="19A7CE"/></a:hlink><a:folHlink><a:srgbClr val="1B8A5A"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="Aptos"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Phyto"><a:fillStyleLst/><a:lnStyleLst/><a:effectStyleLst/><a:bgFillStyleLst/></a:fmtScheme>
  </a:themeElements>
</a:theme>
"@

for ($i = 1; $i -le $slides.Count; $i++) {
  $s = $slides[$i-1]
  $media = Add-Media $s.I
  $rels = "<Relationship Id=""rId1"" Type=""http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"" Target=""../slideLayouts/slideLayout1.xml""/>"
  $imgShape = ""
  if ($null -ne $media) {
    $rels += "<Relationship Id=""rId2"" Type=""http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"" Target=""$($media.Target)""/>"
    if ($s.Layout -eq "cover") {
      $imgShape = PictureShape 20 6.55 0.35 6.35 6.8 "rId2"
    } else {
      $imgShape = PictureShape 20 7.05 1.25 5.8 4.35 "rId2"
    }
  }

  $num = "{0:00}" -f $i
  $title = $s.T
  $subtitle = if ($s.ContainsKey("S")) { $s.S } else { "PFE - Application Phyto" }
  $bullets = @()
  foreach ($b in $s.B) { $bullets += "• $b" }
  $note = "Discours : $($s.N)"

  $shapes = ""
  $shapes += RectShape 2 0 0 13.333 7.5 "F7FAFC" "F7FAFC"
  $shapes += RectShape 3 0 0 13.333 0.18 "1B8A5A" "1B8A5A"
  if ($s.Layout -eq "cover") {
    $shapes += RectShape 4 0.45 0.55 6.15 6.35 "FFFFFF" "D9E6E1"
    $shapes += TextShape 5 0.75 0.85 5.65 1.35 @($title) 34 "0B1F33" -Bold
    $shapes += TextShape 6 0.78 2.28 5.25 0.45 @($subtitle) 15 "1B8A5A" -Bold
    $shapes += TextShape 7 0.85 3.05 5.25 1.9 $bullets 16 "334155"
    $shapes += TextShape 8 0.75 6.45 5.8 0.35 @("Soutenance PFE - 20 minutes") 12 "64748B"
  } else {
    $shapes += TextShape 5 0.55 0.38 9.8 0.55 @($title) 26 "0B1F33" -Bold
    $shapes += TextShape 6 11.35 0.42 1.35 0.35 @($num) 14 "1B8A5A" -Bold
    $shapes += RectShape 7 0.55 1.18 5.95 4.72 "FFFFFF" "D9E6E1"
    $shapes += TextShape 8 0.85 1.45 5.35 3.95 $bullets 15 "334155"
    $shapes += RectShape 9 0.55 6.02 12.25 1.05 "EFF6F4" "CFE4DC"
    $shapes += TextShape 10 0.8 6.15 11.7 0.72 @($note) 8 "334155"
  }
  $shapes += $imgShape

  Write-Utf8NoBom (Join-Path $work "ppt\slides\slide$i.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      $shapes
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>
"@

  Write-Utf8NoBom (Join-Path $work "ppt\slides\_rels\slide$i.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  $rels
</Relationships>
"@
}

if (Test-Path $outPath) { Remove-Item -LiteralPath $outPath -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($work, $outPath)
Remove-Item -LiteralPath $work -Recurse -Force
Write-Host "PPTX generated: $outPath"
