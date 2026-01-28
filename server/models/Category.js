import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, index: true },
  description: String,
  subcategories: [String],
  createdAt: { type: Date, default: Date.now },
})

categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
  }
  next()
})

const Category = mongoose.model('Category', categorySchema)
export default Category
