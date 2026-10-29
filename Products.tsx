import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  image: string;
  badge?: string;
  category: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "سماعات لاسلكية فاخرة",
    price: 299,
    oldPrice: 450,
    rating: 4.8,
    image: "🎧",
    badge: "خصم 33%",
    category: "إلكترونيات",
  },
  {
    id: 2,
    name: "ساعة ذكية رياضية",
    price: 549,
    rating: 4.6,
    image: "⌚",
    category: "إلكترونيات",
  },
  {
    id: 3,
    name: "حقيبة جلدية فاخرة",
    price: 199,
    oldPrice: 280,
    rating: 4.9,
    image: "👜",
    badge: "الأكثر مبيعاً",
    category: "أزياء",
  },
  {
    id: 4,
    name: "نظارة شمسية كلاسيكية",
    price: 149,
    rating: 4.5,
    image: "🕶️",
    category: "أزياء",
  },
];

interface ProductsProps {
  onAddToCart: () => void;
}

export function Products({ onAddToCart }: ProductsProps) {
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="mb-2 font-serif text-3xl font-bold text-slate-900">
              منتجات مميزة
            </h2>
            <p className="text-slate-600">اختر من بين أفضل منتجاتنا</p>
          </div>
          <Button variant="outline" className="border-amber-200 text-amber-700">
            عرض الكل
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-amber-100 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 text-7xl">
                {product.badge && (
                  <Badge className="absolute right-3 top-3 bg-orange-600">
                    {product.badge}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-3 bg-white/80 backdrop-blur-sm"
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.includes(product.id)
                        ? "fill-rose-500 text-rose-500"
                        : "text-slate-400"
                    }`}
                  />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="mb-1 text-xs text-slate-500">
                  {product.category}
                </div>
                <h3 className="mb-2 font-bold text-slate-900">{product.name}</h3>
                <div className="mb-3 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-slate-700">
                    {product.rating}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-amber-700">
                    {product.price} ر.س
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {product.oldPrice} ر.س
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={onAddToCart}
                >
                  <ShoppingCart className="ml-2 h-4 w-4" />
                  أضف للسلة
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}