export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  supplierName?: string;
  supplierDescription?: string;
  supplierLocation?: string;
  supplierContact?: string;
  image: string;
  hoverImage?: string;
  galleryImages?: string[];
  colorOptions?: string[];
  sizeOptions?: string[];
  description: string;
  originalPrice?: number;
  featured?: boolean;
  inStock?: boolean;
};
