'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import CategorySidebar from '@/components/category-sidebar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatPrice } from '@/lib/currency'
import { resolveImageSrc } from '@/lib/image'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  isOnOffer?: boolean
  discountPercentage?: number
}

const TOP_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '2',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '3',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '4',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '5',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '6',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '7',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '8',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '9',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '10',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '11',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '12',
    name: 'Fetal Dopler',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    isOnOffer: true,
    discountPercentage: 20,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex gap-8 bg-white px-8 py-8">
        {/* Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <CategorySidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-8 tracking-tight">Our Top Products:</h2>

          {/* Products Grid - 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOP_PRODUCTS.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="bg-white border border-gray-300 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img
                      src={resolveImageSrc(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isOnOffer && (
                      <div className="absolute top-3 right-3 bg-accent text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xs shadow-md">
                        {product.discountPercentage}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-medium text-gray-800 text-center text-xs mb-4 tracking-tight">{product.name}</h3>

                    {/* Price */}
                    <div className="text-center flex-1 flex flex-col justify-end">
                      {product.isOnOffer ? (
                        <>
                          <p className="text-base font-bold text-primary">
                            {formatPrice(product.price * (1 - (product.discountPercentage || 0) / 100))}
                          </p>
                          <p className="text-xs line-through text-gray-400">{formatPrice(product.price)}</p>
                        </>
                      ) : (
                        <p className="text-base font-bold text-primary">{formatPrice(product.price)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
