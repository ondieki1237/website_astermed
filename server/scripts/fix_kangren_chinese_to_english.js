import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'

dotenv.config({ path: './.env' })

const TRANSLATIONS = {
  'kangren-disposable-cpr-training-barrier-face-shield-50-pcsbox': {
    description: 'Disposable CPR training barrier face shield (50 pcs/box).',
  },
  'kangren-cpr-compression-board': {
    description: 'CPR compression board.',
  },
  '口腔护理（高级成人护理及CPR模拟人）': {
    name: 'Oral Care (Advanced Adult Nursing and CPR Training Manikin)',
    description:
      'Product features: the manikin can lie supine with the knees bent, and after the legs are abducted it can support itself independently. The upper arms and calves rotate freely. This comprehensive nursing and first-aid manikin is 170 cm tall, has blinking eyes, flexible joints, and supports multiple training positions.',
  },
  '高级全功能老年护理人（男性）': {
    name: 'Advanced Full-Function Elderly Care Manikin (Male)',
    description: 'Advanced full-function elderly care manikin (male).',
  },
  '高级全功能老年护理人（女性）': {
    name: 'Advanced Full-Function Elderly Care Manikin (Female)',
    description: 'Advanced full-function elderly care manikin (female).',
  },
  '闭合式四肢骨折固定训练模型': {
    name: 'Closed Limb Fracture Fixation Training Model',
    description: 'Closed limb fracture fixation training model.',
  },
  '高级透明洗胃模型': {
    name: 'Advanced Transparent Gastric Lavage Model',
    description: 'Advanced transparent gastric lavage model.',
  },
  '高级鼻饲管与气管护理模型': {
    name: 'Advanced Nasogastric Tube and Tracheal Care Model',
    description: 'Advanced nasogastric tube and tracheal care model.',
  },
  '高级基础护理实习操作模型': {
    name: 'Advanced Basic Nursing Practice Model',
    description: 'Advanced basic nursing practice model.',
  },
  '高级鼻胃管与气管护理模型': {
    name: 'Advanced Nasogastric and Tracheal Care Model',
    description: 'Advanced nasogastric and tracheal care model.',
  },
  '多功能透明洗胃训练模型': {
    name: 'Multifunctional Transparent Gastric Lavage Training Model',
    description:
      'This model simulates the upper body structure of an adult male. The anatomy includes the nasal cavity, mouth, teeth, tongue, uvula, epiglottis, vocal cords, trachea, bronchi, lungs, esophagus, stomach, liver, and small intestine. It is made of imported materials with a realistic feel, and the stomach section is made of high-strength transparent material for easy observation.',
  },
  '高级吞咽机制模型': {
    name: 'Advanced Swallowing Mechanism Model',
    description: 'Advanced swallowing mechanism model.',
  },
  '高级吸痰练习模型': {
    name: 'Advanced Suctioning Practice Model',
    description: 'Advanced suctioning practice model.',
  },
  '高级肠外营养护理模型': {
    name: 'Advanced Parenteral Nutrition Care Model',
    description: 'Advanced parenteral nutrition care model.',
  },
  '胸椎模型': {
    name: 'Thoracic Spine Model',
    description: 'Thoracic spine model.',
  },
  '颈椎模型': {
    name: 'Cervical Spine Model',
    description: 'Cervical spine model.',
  },
  '脊椎模型（可弯曲）': {
    name: 'Flexible Spine Model',
    description: 'Flexible spine model.',
  },
  '脊椎带骨盆附半腿骨模型（不可弯曲/可弯曲）': {
    name: 'Spine with Pelvis and Half Leg Bone Model (Rigid/Flexible)',
    description: 'Spine with pelvis and half leg bone model (rigid/flexible).',
  },
  '脊椎带骨盆模型（不可弯曲/可弯曲）': {
    name: 'Spine with Pelvis Model (Rigid/Flexible)',
    description: 'Spine with pelvis model (rigid/flexible).',
  },
  '全身骨骼半边肌肉着色模型': {
    name: 'Full Body Skeleton Model with One-Side Muscle Coloring',
    description: 'Full body skeleton model with one-side muscle coloring.',
  },
  '全身骨骼半边肌肉着色附韧带模型': {
    name: 'Full Body Skeleton Model with One-Side Muscle Coloring and Ligaments',
    description: 'Full body skeleton model with one-side muscle coloring and ligaments.',
  },
  '全身骨骼85cm附血管神经模型': {
    name: '85 cm Full Body Skeleton Model with Blood Vessels and Nerves',
    description: '85 cm full body skeleton model with blood vessels and nerves.',
  },
  '一次性CPR训练屏障消毒面膜（50张/盒）': {
    name: 'Disposable CPR Training Barrier Face Shield (50 pcs/box)',
    description: 'Disposable CPR training barrier face shield (50 pcs/box).',
  },
  'CPR按压板': {
    name: 'CPR Compression Board',
    description: 'CPR compression board.',
  },
}

function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim()
}

function containsChinese(value) {
  return /[\u3400-\u9FBF]/.test(String(value || ''))
}

function translate(name, description) {
  const key = cleanText(name)
  const mapped = TRANSLATIONS[key]
  return {
    name: mapped?.name || key,
    description: mapped?.description || cleanText(description),
  }
}

function buildSearchText(doc) {
  const parts = []
  if (doc.name) parts.push(doc.name)
  if (doc.description) parts.push(doc.description)
  if (doc.category) parts.push(doc.category)
  if (doc.subcategory) parts.push(doc.subcategory)
  if (Array.isArray(doc.tags)) parts.push(doc.tags.join(' '))
  if (doc.specifications && typeof doc.specifications === 'object') {
    parts.push(Object.entries(doc.specifications).map(([k, v]) => `${k} ${v}`).join(' '))
  }
  return cleanText(parts.join(' '))
}

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set in server/.env')

  await mongoose.connect(uri)

  const products = await Product.find({ category: 'Training Materials' })
  const targets = products.filter((p) => containsChinese(p.name) || containsChinese(p.description) || containsChinese(p.subcategory))
  console.log(`Found ${targets.length} Chinese Training Materials products`) 

  let updated = 0
  for (const product of targets) {
    const next = translate(product.name, product.description)
    const slugMapped = TRANSLATIONS[cleanText(product.slug)]
    product.name = next.name
    product.description = slugMapped?.description || next.description || next.name
    if (containsChinese(product.subcategory)) {
      product.subcategory = 'Training Materials'
    }
    product.searchText = buildSearchText(product)
    product.updatedAt = new Date()
    await product.save()
    updated += 1
  }

  console.log(`Updated ${updated} products`)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
