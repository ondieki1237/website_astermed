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
  sku: { type: String, unique: true },
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
  slug: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);
export default Product;
