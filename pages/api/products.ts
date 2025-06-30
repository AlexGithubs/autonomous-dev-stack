import type { NextApiRequest, NextApiResponse } from 'next';
import { Product } from '../../types';

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Product[]>
) {
  // Mock data - replace with actual database call
  const products: Product[] = [
    {
      id: '1',
      name: 'Sample Product',
      description: 'This is a sample product',
      price: 99.99,
      image: '/sample-product.jpg',
      category: 'electronics',
      inStock: true
    }
  ];

  res.status(200).json(products);
}
