import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Gift, Hammer, CreditCard } from "lucide-react";

export function Deals() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-500 to-orange-600 text-white lg:col-span-2">
          <CardContent className="p-8">
            <div className="mb-4 flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <Badge className="bg-white/20 text-white">عرض محدود</Badge>
            </div>
            <h2 className="mb-2 font-serif text-3xl font-bold">
              صفقة اليوم: خصم 50%
            </h2>
            <p className="mb-6 max-w-md text-amber-100">
              على جميع الإلكترونيات والأجهزة الذكية. العرض ساري حتى منتصف الليل!
            </p>
            <div className="mb-6 flex gap-3">
              {["12", "45", "30"].map((time, i) => (
                <div
                  key={i}
                  className="flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm"
                >
                  <span className="text-2xl font-bold">{time}</span>
                  <span className="text-xs text-amber-100">
                    {["ساعة", "دقيقة", "ثانية"][i]}
                  </span>
                </div>
              ))}
            </div>
            <Button className="bg-white text-amber-700 hover:bg-amber-50">
              اغتنم العرض
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-rose-100 bg-rose-50/50">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Gift className="h-5 w-5 text-rose-600" />
                <h3 className="font-bold text-slate-900">السحب الأسبوعي</h3>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                اشترك الآن واربح جائزة 10,000 ريال
              </p>
              <Button className="w-full bg-rose-600 hover:bg-rose-700">
                اشترك الآن
              </Button>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50/50">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Hammer className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">مزاد اليوم</h3>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                iPhone 15 Pro يبدأ من 2,000 ريال
              </p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                شارك في المزاد
              </Button>
            </CardContent>
          </Card>

          <Card className="border-sky-100 bg-sky-50/50">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-sky-600" />
                <h3 className="font-bold text-slate-900">الدفع الإلكتروني</h3>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                طرق دفع آمنة ومتعددة
              </p>
              <Button className="w-full bg-sky-600 hover:bg-sky-700">
                اكتشف المزيد
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}