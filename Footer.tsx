import { Share2, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white">
                ⚡
              </div>
              <span className="text-lg font-bold text-slate-900">
                شحن <span className="text-amber-600">سريع</span>
              </span>
            </div>
            <p className="text-sm text-slate-600">
              متجر الشحن والبطاقات للألعاب مع توصيل فوري وأسعار منافسة
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-bold text-slate-900">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="cursor-pointer hover:text-amber-600">الرئيسية</li>
              <li className="cursor-pointer hover:text-amber-600">الألعاب</li>
              <li className="cursor-pointer hover:text-amber-600">العروض</li>
              <li className="cursor-pointer hover:text-amber-600">تواصل معنا</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-bold text-slate-900">خدمة العملاء</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="cursor-pointer hover:text-amber-600">اتصل بنا</li>
              <li className="cursor-pointer hover:text-amber-600">الشحن والتوصيل</li>
              <li className="cursor-pointer hover:text-amber-600">سياسة الاسترجاع</li>
              <li className="cursor-pointer hover:text-amber-600">الأسئلة الشائعة</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-bold text-slate-900">تابعنا</h3>
            <div className="flex gap-3">
              {[Share2, MessageCircle].map((Icon, i) => (
                <button
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 text-slate-600 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-amber-100 pt-6 text-center text-sm text-slate-500">
          © 2024 شحن سريع. جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}