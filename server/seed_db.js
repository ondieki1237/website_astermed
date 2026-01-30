import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

const categories = [
    {
        name: 'Diagnostic Equipment',
        description: 'High-precision tools for accurate medical diagnosis.',
        subcategories: ['Ultrasound', 'ECG Machines', 'Stethoscopes']
    },
    {
        name: 'Surgical Instruments',
        description: 'Premium quality instruments for surgical procedures.',
        subcategories: ['Forceps', 'Scissors', 'Scalpels']
    },
    {
        name: 'Laboratory Supplies',
        description: 'Essential supplies for medical and research laboratories.',
        subcategories: ['Microscopes', 'Test Tubes', 'Centrifuges']
    },
    {
        name: 'Dental Care',
        description: 'Equipment and supplies for professional dental practice.',
        subcategories: ['Dental Chairs', 'X-Ray', 'Handpieces']
    },
    {
        name: 'Maternity & Infant Care',
        description: 'Specialized care equipment for mothers and newborns.',
        subcategories: ['Incubators', 'Fetal Monitors', 'Breast Pumps']
    },
    {
        name: 'Emergency & Trauma',
        description: 'Critical care equipment for emergency situations.',
        subcategories: ['Defibrillators', 'Stretchers', 'Ventilators']
    },
    {
        name: 'Patient Monitoring',
        description: 'Systems for continuous monitoring of patient vitals.',
        subcategories: ['Multi-para Monitors', 'Pulse Oximeters', 'BP Monitors']
    }
];

const products = [
    // Diagnostic Equipment
    {
        name: 'Digital Ultrasound Scanner',
        description: 'Portable high-resolution ultrasound scanner with multiple probes.',
        category: 'Diagnostic Equipment',
        subcategory: 'Ultrasound',
        price: 450000,
        isOnOffer: true,
        discountPercentage: 15,
        image: '/uploads/products/1769609325393-i77r24.webp',
        stock: 5
    },
    {
        name: '12-Lead ECG Machine',
        description: 'Advanced ECG machine with automated interpretation and thermal printer.',
        category: 'Diagnostic Equipment',
        subcategory: 'ECG Machines',
        price: 85000,
        isOnOffer: false,
        image: '/uploads/products/1769609358153-4zs6wo.webp',
        stock: 10
    },
    {
        name: 'Littmann Classic III Stethoscope',
        description: 'High acoustic sensitivity for performing general physical assessments.',
        category: 'Diagnostic Equipment',
        subcategory: 'Stethoscopes',
        price: 15000,
        isOnOffer: true,
        discountPercentage: 10,
        image: '/uploads/products/1769609380782-075crz.webp',
        stock: 50
    },
    // Surgical Instruments
    {
        name: 'Surgical Scissors Set',
        description: 'Precision-crafted stainless steel scissors set (5 pieces).',
        category: 'Surgical Instruments',
        subcategory: 'Scissors',
        price: 12000,
        isOnOffer: false,
        image: '/uploads/products/1769609404052-4mvhxe.webp',
        stock: 30
    },
    {
        name: 'Hemostatic Forceps',
        description: 'Locking forceps used to control bleeding during surgery.',
        category: 'Surgical Instruments',
        subcategory: 'Forceps',
        price: 3500,
        isOnOffer: true,
        discountPercentage: 5,
        image: '/uploads/products/1769610020494-c92gvi.webp',
        stock: 100
    },
    {
        name: 'Sterile Scalpel Blades',
        description: 'Box of 100 sterile carbon steel scalpel blades, size 10.',
        category: 'Surgical Instruments',
        subcategory: 'Scalpels',
        price: 2500,
        isOnOffer: false,
        image: '/uploads/products/1769610048297-no7v65.webp',
        stock: 200
    },
    // Laboratory Supplies
    {
        name: 'Binocular Microscope',
        description: 'Professional grade binocular microscope with 1000x magnification.',
        category: 'Laboratory Supplies',
        subcategory: 'Microscopes',
        price: 65000,
        isOnOffer: true,
        discountPercentage: 20,
        image: '/uploads/products/1769610718572-j3a7po.webp',
        stock: 8
    },
    {
        name: 'Digital Centrifuge',
        description: 'High-speed digital centrifuge with timer and safety lock.',
        category: 'Laboratory Supplies',
        subcategory: 'Centrifuges',
        price: 42000,
        isOnOffer: false,
        image: '/uploads/products/1769758686941-8pg4pt.webp',
        stock: 12
    },
    {
        name: 'Borosilicate Test Tubes',
        description: 'Pack of 50 heat-resistant borosilicate glass test tubes.',
        category: 'Laboratory Supplies',
        subcategory: 'Test Tubes',
        price: 4500,
        isOnOffer: false,
        image: '/uploads/products/1769609325393-i77r24.webp',
        stock: 150
    },
    // Dental Care
    {
        name: 'Ergonomic Dental Chair',
        description: 'Fully adjustable ergonomic dental chair with LED operating light.',
        category: 'Dental Care',
        subcategory: 'Dental Chairs',
        price: 850000,
        isOnOffer: true,
        discountPercentage: 12,
        image: '/uploads/products/1769609358153-4zs6wo.webp',
        stock: 3
    },
    {
        name: 'Intraoral X-Ray System',
        description: 'High-frequency intraoral X-ray system for dental imaging.',
        category: 'Dental Care',
        subcategory: 'X-Ray',
        price: 320000,
        isOnOffer: false,
        image: '/uploads/products/1769609380782-075crz.webp',
        stock: 4
    },
    {
        name: 'High-Speed Dental Handpiece',
        description: 'Air-driven high-speed dental handpiece with ceramic bearings.',
        category: 'Dental Care',
        subcategory: 'Handpieces',
        price: 18000,
        isOnOffer: true,
        discountPercentage: 15,
        image: '/uploads/products/1769609404052-4mvhxe.webp',
        stock: 25
    },
    // Maternity & Infant Care
    {
        name: 'Infant Incubator',
        description: 'Temperature and humidity controlled infant incubator with safety alarms.',
        category: 'Maternity & Infant Care',
        subcategory: 'Incubators',
        price: 550000,
        isOnOffer: true,
        discountPercentage: 10,
        image: '/uploads/products/1769610020494-c92gvi.webp',
        stock: 2
    },
    {
        name: 'Digital Fetal Monitor',
        description: 'Dual channel fetal monitor for twin pregnancy tracking.',
        category: 'Maternity & Infant Care',
        subcategory: 'Fetal Monitors',
        price: 120000,
        isOnOffer: false,
        image: '/uploads/products/1769610048297-no7v65.webp',
        stock: 6
    },
    {
        name: 'Electric Breast Pump',
        description: 'Dual electric breast pump with hospital-grade suction.',
        category: 'Maternity & Infant Care',
        subcategory: 'Breast Pumps',
        price: 24000,
        isOnOffer: true,
        discountPercentage: 20,
        image: '/uploads/products/1769610718572-j3a7po.webp',
        stock: 40
    },
    // Emergency & Trauma
    {
        name: 'Automated External Defibrillator (AED)',
        description: 'Easy-to-use AED with voice prompts and visual guidance.',
        category: 'Emergency & Trauma',
        subcategory: 'Defibrillators',
        price: 185000,
        isOnOffer: true,
        discountPercentage: 18,
        image: '/uploads/products/1769758686941-8pg4pt.webp',
        stock: 15
    },
    {
        name: 'Folding Ambulance Stretcher',
        description: 'Lightweight aluminum alloy folding stretcher with locking mechanisms.',
        category: 'Emergency & Trauma',
        subcategory: 'Stretchers',
        price: 45000,
        isOnOffer: false,
        image: '/uploads/products/1769609325393-i77r24.webp',
        stock: 8
    },
    {
        name: 'Portable Emergency Ventilator',
        description: 'Compact ventilator for emergency transport and ICU use.',
        category: 'Emergency & Trauma',
        subcategory: 'Ventilators',
        price: 320000,
        isOnOffer: true,
        discountPercentage: 10,
        image: '/uploads/products/1769609358153-4zs6wo.webp',
        stock: 4
    },
    // Patient Monitoring
    {
        name: 'Multi-Parameter Patient Monitor',
        description: '12-inch color display monitor for ECG, SpO2, NIBP, and TEMP.',
        category: 'Patient Monitoring',
        subcategory: 'Multi-para Monitors',
        price: 95000,
        isOnOffer: true,
        discountPercentage: 15,
        image: '/uploads/products/1769609380782-075crz.webp',
        stock: 10
    },
    {
        name: 'Digital Sphygmomanometer',
        description: 'Professional digital blood pressure monitor with large LCD screen.',
        category: 'Patient Monitoring',
        subcategory: 'BP Monitors',
        price: 8500,
        isOnOffer: false,
        image: '/uploads/products/1769609404052-4mvhxe.webp',
        stock: 60
    }
];

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Clearing existing categories and products...');
        await Category.deleteMany({});
        await Product.deleteMany({});

        console.log('Seeding categories...');
        for (const catData of categories) {
            const category = new Category(catData);
            await category.save();
        }

        console.log('Seeding products...');
        for (const prodData of products) {
            const product = new Product(prodData);
            await product.save();
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
