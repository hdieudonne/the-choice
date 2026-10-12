
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  images: {
    id: string;
    imageUrl: string;
    alt: string | null;
    sortOrder: number;
  }[];
  variants: {
    id: string;
    size: string;
    color: string;
    stock: number;
  }[];
};
