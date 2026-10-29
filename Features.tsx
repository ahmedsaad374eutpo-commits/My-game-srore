import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Ticket, Coins, Gift, Hammer, CreditCard } from "lucide-react";

const features = [
  {
    icon: ShoppingBag,
    title: "تسوق وشراء",
    desc: "منتجات وخدمات متنوعة",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Ticket,
    title: "كوبونات وعروض",
    desc: "خصومات حصرية يومية",
    color: "bg-orange-100 text-orange-700",
  },
  {
    icon: Coins,
    title: "نقاط ومكافآت",
    desc: "اجمع النقاط مع كل عملية",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    icon: Gift,
    title: "سحوبات وجوائز",
    desc: "فرص ربح جوائز قيمة",
    color: "bg-rose-100 text-rose-700",
  },
  {
    icon: Hammer,
    title: "مزادات وشراء بالجملة",
    desc: "أفضل الأسعار للمشترين",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: CreditCard,
    title: "دفع إلكتروني",
    desc: "طرق دفع آمنة ومتعددة",
    color: "bg-sky-100 text-sky-700",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="mb-2 font-serif text-3xl font-bold text-slate-900">
          كل ما تحتاجه في مكان واحد
        </h2>
        <p className="text-slate-600">
          منصة متكاملة تجمع بين التسوق والمكافآت والترفيه
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="group border-amber-100 bg-white transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <CardContent className="flex items-start gap-4 p-6">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-bold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}