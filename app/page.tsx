import Header from '@/components/header'
import Footer from '@/components/footer'
import Link from 'next/link'
import { resolveImageSrc } from '@/lib/image'
import { getFeaturedStaticProducts } from '@/lib/static-catalog'

export default function Home() {
  const products = getFeaturedStaticProducts(12)
  const whatsappNumber = '254746999725'

  const orderViaWhatsApp = (product: (typeof products)[number]) => {
    const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://astermed.codewithseth.co.ke'}/products/${product._id}`
    const message = `Hello AsterMed, I'd like to order ${product.name}.\n${productUrl}`
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex gap-6 px-4 xl:px-8 py-6 pt-28 md:pt-32 lg:pt-28 max-w-[1400px] mx-auto w-full">
        <div className="flex-1 space-y-8 w-full">
          <div className="relative bg-[#5A946A] p-4 md:p-6 lg:p-8 shadow-sm border border-[#487a55] rounded-sm">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="relative z-10 flex flex-col items-start">
              <h1 className="hidden lg:block text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-wider uppercase leading-tight">
                AsterMed Medical Supplies
              </h1>
              <p className="text-sm md:text-base text-white/95 mb-4 max-w-xl font-medium leading-relaxed">
                Premium healthcare equipment and materials for professionals worldwide. Fast, reliable, and authentic.
              </p>
            </div>
          </div>

          <div className="bg-white">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 tracking-tight uppercase border-l-4 border-[#5A946A] pl-3 leading-none">
                Featured Products
              </h2>
              <Link href="/products" className="text-sm text-[#5A946A] hover:text-gray-900 font-medium transition-colors">
                View All Products →
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 border border-gray-200 bg-gray-50">
                <p className="text-gray-500 text-sm">No products available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {products.map((product) => (
                  <div key={product._id} className="group bg-white border border-gray-200 hover:border-[#5A946A] transition-colors flex flex-col h-full rounded-sm">
                    <Link href={`/products/${product._id}`} className="block">
                      <div className="relative w-full aspect-square bg-[#f8f9fa] flex items-center justify-center p-4 border-b border-gray-100">
                        <img
                          src={resolveImageSrc(product.image)}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        />

                        {product.isOnOffer && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                            Sale {product.discountPercentage}%
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4 flex flex-col flex-1">
                      <Link href={`/products/${product._id}`}>
                        <h3 className="font-medium text-gray-800 text-[13px] leading-snug mb-3 line-clamp-2 min-h-[36px] group-hover:text-[#5A946A] transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-auto flex flex-col gap-2">
                        <a
                          href={orderViaWhatsApp(product)}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-[#5A946A] text-white text-[11px] font-bold uppercase tracking-wide py-2.5 hover:bg-[#487a55] transition-colors rounded-sm text-center"
                        >
                          Order via WhatsApp
                        </a>
                        <Link href={`/products/${product._id}`} className="w-full bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wide py-2.5 text-center hover:bg-gray-200 transition-colors rounded-sm">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
