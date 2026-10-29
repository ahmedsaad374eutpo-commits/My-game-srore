import { ShoppingCart, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  cartCount: number;
}

export function Header({ cartCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-bold text-white shadow-sm">
            س
          </div>
          <span className="hidden text-xl font-bold text-slate-900 sm:block">
            سوق<span className="text-amber-600">نا</span>
          </span>
        </div>

        <div className="relative hidden flex-1 md:block">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="ابحث عن منتجات، خدمات، عروض..."
            className="rounded-xl border-amber-200 bg-amber-50/50 pr-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden text-slate-700 sm:inline-flex">
            تسجيل الدخول
          </Button>
          <Button className="hidden bg-amber-600 hover:bg-amber-700 sm:inline-flex">
            إنشاء حساب
          </Button>
          <Button variant="outline" size="icon" className="relative border-amber-200">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -left-2 -top-2 h-5 w-5 rounded-full bg-orange-600 p-0 text-xs">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}