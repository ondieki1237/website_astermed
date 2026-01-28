'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Category {
  name: string
  subcategories?: string[]
}

const CATEGORIES: Category[] = [
  {
    name: 'Dental',
    subcategories: [
      'Dental gloves',
      'Face masks',
      'Dental burs',
      'Cotton rolls and gauze',
      'Saliva ejectors',
      'Impression materials',
      'Composite resin filling material',
      'Dental cement',
    ],
  },
  { name: 'Maternity' },
  {
    name: 'Surgical Supplies',
    subcategories: [
      'Surgical instruments',
      'Sterile drapes',
      'Surgical gloves',
      'Sutures',
    ],
  },
  { name: 'Diagnostic Equipment' },
  { name: 'Personal Protection' },
  { name: 'Patient Care' },
]

export default function CategorySidebar() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Dental')

  return (
    <aside className="w-64 bg-white">
      <div className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-6 tracking-tight">Category</h2>
        <div className="space-y-3">
          {CATEGORIES.map((category) => (
            <div key={category.name}>
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category.name ? null : category.name
                  )
                }
                className="w-full flex items-center justify-between bg-primary text-white px-4 py-2.5 font-medium text-sm hover:bg-primary/90 transition tracking-tight"
              >
                <span>{category.name}</span>
                {category.subcategories && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedCategory === category.name ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Subcategories */}
              {expandedCategory === category.name && category.subcategories && (
                <div className="mt-2 ml-3 space-y-1.5 border-l border-gray-300 pl-3">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      href={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub)}`}
                      className="block text-xs text-gray-600 hover:text-primary font-light transition"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
