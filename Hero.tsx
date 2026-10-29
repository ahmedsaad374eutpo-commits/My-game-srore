import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gift, Trophy } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-l from-amber-600 via-orange-600 to-amber-700">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-yellow-300 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-white">
            <Badge className="mb-4 border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Sparkles className="ml-1 h-3 w-3" />
              منصة التسوق الشاملة
            </Badge>
            <h1 className="mb-4 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              تسوق، اربح،
              <br />
              <span className="text-yellow-300">واكسب الجوائز</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg text-amber-100">
              اكتشف منتجات وخدمات مميزة، استفد من الكوبونات والعروض، اجمع النقاط،
              وشارك في السحوبات والمزادات الحصرية.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-white text-amber-700 hover:bg-amber-50">
                ابدأ التسوق
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                اكتشف العروض
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <Gift className="mb-3 h-8 w-8 text-yellow-300" />
              <h3 className="mb-1 font-bold">كوبونات خصم</h3>
              <p className="text-sm text-amber-100">وفّر حتى 70% على مشترياتك</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <Trophy className="mb-3 h-8 w-8 text-yellow-300" />
              <h3 className="mb-1 font-bold">سحوبات وجوائز</h3>
              <p className="text-sm text-amber-100">شارك واربح جوائز قيمة</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold">نقاط المكافآت</h3>
                <span className="text-2xl font-bold text-yellow-300">2,450</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-3/4 rounded-full bg-yellow-300" />
              </div>
              <p className="mt-2 text-sm text-amber-100">
                أنت على بعد 550 نقطة من جائزة 500 ريال
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}