import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  discountPercentage: { type: Number },
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  image: String,
  images: [String],
  specifications: mongoose.Schema.Types.Mixed,
  features: [String],
  warranty: String,
  manufacturerInfo: String,
  isOnOffer: { type: Boolean, default: false },
  offerStartDate: Date,
  offerEndDate: Date,
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  tags: [String],
  searchText: String,
  slug: String,
  inStock: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-generate SKU and slug when missing to avoid duplicate-null index issues
productSchema.pre('save', function (next) {
  if (!this.sku) {
    this.sku = `SKU-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`
  }
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
  }
  next()
});

const Product = mongoose.model('Product', productSchema);
export default Product;
