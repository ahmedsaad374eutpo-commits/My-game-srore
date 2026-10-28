import { useEffect, useState } from "react";
import { ShoppingCart, CreditCard, Shield, Zap, Wallet, Plus, Flame, Target, Smartphone, CheckCircle2, Trophy, Home, Crown, Star, Music2, Gamepad2, Apple, ShoppingBag, User, LogOut, UserPlus, LogIn, Eye, EyeOff, Ticket, Upload, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";

interface CartItem {
  id: number;
  name: string;
  amount: string;
  price: number;
  image: string;
  color: string;
  platform?: string;
}

interface MobileCartItem {
  operator: string;
  logo: string;
  color: string;
  amount: number;
  phone: string;
}

interface User {
  name: string;
  email: string;
  password: string;
  inviteCode?: string;
  points: number;
  balance: number;
}

const VODAFONE_CASH_NUMBER = "01065028436";
const INSTAPAY_NUMBER = "01102850050";

const isValidEgPhone = (v: string) => /^01[0125]\d{8}$/.test(v.trim());

interface TopUpRequest {
  id: number;
  amount: number;
  method: string;
  sender: string;
  status: "pending";
}

const freeFireItems = [
  { id: 1, name: "فري فاير", amount: "100 جوهر", price: 50, image: "🔥", color: "from-orange-500 to-red-600" },
  { id: 2, name: "فري فاير", amount: "310 جوهر", price: 140, image: "🔥", color: "from-orange-500 to-red-600", popular: true },
  { id: 3, name: "فري فاير", amount: "520 جوهر", price: 220, image: "🔥", color: "from-orange-500 to-red-600" },
  { id: 4, name: "فري فاير", amount: "1060 جوهر", price: 450, image: "🔥", color: "from-orange-500 to-red-600" },
  { id: 5, name: "فري فاير", amount: "2180 جوهر", price: 900, image: "🔥", color: "from-orange-500 to-red-600" },
  { id: 6, name: "فري فاير", amount: "5600 جوهر", price: 2200, image: "🔥", color: "from-orange-500 to-red-600", popular: true },
];

const freeFireMemberships = [
  { id: 101, name: "عضوية أسبوعية", amount: "450 جوهر", price: 90, image: "👑", color: "from-amber-400 to-yellow-600", popular: true },
  { id: 102, name: "عضوية شهرية", amount: "2600 جوهر", price: 300, image: "👑", color: "from-yellow-500 to-amber-600" },
  { id: 103, name: "عضوية مخفضة", amount: "100 جوهر", price: 60, image: "💎", color: "from-purple-500 to-fuchsia-600" },
];

const pubgItems = [
  { id: 5, name: "ببجي", amount: "60 UC", price: 60, image: "🎯", color: "from-yellow-500 to-orange-600" },
  { id: 6, name: "ببجي", amount: "300+25 UC", price: 280, image: "🎯", color: "from-yellow-500 to-orange-600", popular: true },
  { id: 7, name: "ببجي", amount: "600+60 UC", price: 550, image: "🎯", color: "from-yellow-500 to-orange-600" },
  { id: 8, name: "ببجي", amount: "1500+300 UC", price: 1300, image: "🎯", color: "from-yellow-500 to-orange-600" },
  { id: 9, name: "ببجي", amount: "3000+850 UC", price: 2500, image: "🎯", color: "from-yellow-500 to-orange-600" },
];

const efootballAndroidItems = [
  { id: 10, name: "بيس (أندرويد)", amount: "550 كوين", price: 270, image: "⚽", color: "from-green-500 to-emerald-600" },
  { id: 11, name: "بيس (أندرويد)", amount: "750 كوين", price: 360, image: "⚽", color: "from-green-500 to-emerald-600" },
  { id: 12, name: "بيس (أندرويد)", amount: "1040 كوين", price: 470, image: "⚽", color: "from-green-500 to-emerald-600", popular: true },
  { id: 13, name: "بيس (أندرويد)", amount: "2130 كوين", price: 900, image: "⚽", color: "from-green-500 to-emerald-600" },
  { id: 14, name: "بيس (أندرويد)", amount: "3250 كوين", price: 1350, image: "⚽", color: "from-green-500 to-emerald-600" },
  { id: 15, name: "بيس (أندرويد)", amount: "5700 كوين", price: 2050, image: "⚽", color: "from-green-500 to-emerald-600" },
  { id: 16, name: "بيس (أندرويد)", amount: "6000 كوين", price: 2200, image: "⚽", color: "from-green-500 to-emerald-600" },
  { id: 17, name: "بيس (أندرويد)", amount: "12800 كوين", price: 4100, image: "⚽", color: "from-green-500 to-emerald-600" },
  { id: 18, name: "بيس (أندرويد)", amount: "25600 كوين", price: 8100, image: "⚽", color: "from-green-500 to-emerald-600" },
];

const efootballIOSItems = [
  { id: 19, name: "بيس (أيفون)", amount: "550 كوين", price: 270, image: "⚽", color: "from-blue-500 to-indigo-600" },
  { id: 20, name: "بيس (أيفون)", amount: "1040 كوين", price: 470, image: "⚽", color: "from-blue-500 to-indigo-600", popular: true },
  { id: 21, name: "بيس (أيفون)", amount: "2130 كوين", price: 900, image: "⚽", color: "from-blue-500 to-indigo-600" },
  { id: 22, name: "بيس (أيفون)", amount: "3250 كوين", price: 1350, image: "⚽", color: "from-blue-500 to-indigo-600" },
  { id: 23, name: "بيس (أيفون)", amount: "5700 كوين", price: 2150, image: "⚽", color: "from-blue-500 to-indigo-600" },
  { id: 24, name: "بيس (أيفون)", amount: "6000 كوين", price: 2200, image: "⚽", color: "from-blue-500 to-indigo-600" },
  { id: 25, name: "بيس (أيفون)", amount: "12800 كوين", price: 4400, image: "⚽", color: "from-blue-500 to-indigo-600" },
  { id: 26, name: "بيس (أيفون)", amount: "25600 كوين", price: 8700, image: "⚽", color: "from-blue-500 to-indigo-600" },
];

const fifaItems = [
  { id: 27, name: "فيفا 24", amount: "500 FP", price: 250, image: "⚽", color: "from-sky-500 to-blue-600" },
  { id: 28, name: "فيفا 24", amount: "1050 FP", price: 500, image: "⚽", color: "from-sky-500 to-blue-600", popular: true },
  { id: 29, name: "فيفا 24", amount: "2200 FP", price: 1000, image: "⚽", color: "from-sky-500 to-blue-600" },
  { id: 30, name: "فيفا 24", amount: "4600 FP", price: 2000, image: "⚽", color: "from-sky-500 to-blue-600" },
  { id: 31, name: "فيفا 24", amount: "12000 FP", price: 5000, image: "⚽", color: "from-sky-500 to-blue-600" },
];

const tiktokItems = [
  { id: 32, name: "تيك توك", amount: "100 عملة", price: 30, image: "🎵", color: "from-slate-700 to-slate-900" },
  { id: 33, name: "تيك توك", amount: "500 عملة", price: 140, image: "🎵", color: "from-slate-700 to-slate-900" },
  { id: 34, name: "تيك توك", amount: "1000 عملة", price: 270, image: "🎵", color: "from-slate-700 to-slate-900", popular: true },
  { id: 35, name: "تيك توك", amount: "5000 عملة", price: 1300, image: "🎵", color: "from-slate-700 to-slate-900" },
  { id: 36, name: "تيك توك", amount: "10000 عملة", price: 2500, image: "🎵", color: "from-slate-700 to-slate-900" },
  { id: 37, name: "تيك توك", amount: "20000 عملة", price: 4800, image: "🎵", color: "from-slate-700 to-slate-900" },
];

const itunesUSItems = [
  { id: 38, name: "ايتونز أمريكي", amount: "$10", price: 500, image: "🍎", color: "from-slate-600 to-slate-800" },
  { id: 39, name: "ايتونز أمريكي", amount: "$25", price: 1200, image: "🍎", color: "from-slate-600 to-slate-800", popular: true },
  { id: 40, name: "ايتونز أمريكي", amount: "$50", price: 2400, image: "🍎", color: "from-slate-600 to-slate-800" },
  { id: 41, name: "ايتونز أمريكي", amount: "$100", price: 4700, image: "🍎", color: "from-slate-600 to-slate-800" },
];

const itunesSAItems = [
  { id: 42, name: "ايتونز سعودي", amount: "50 ريال", price: 700, image: "🍎", color: "from-emerald-600 to-green-700" },
  { id: 43, name: "ايتونز سعودي", amount: "100 ريال", price: 1400, image: "🍎", color: "from-emerald-600 to-green-700", popular: true },
  { id: 44, name: "ايتونز سعودي", amount: "200 ريال", price: 2800, image: "🍎", color: "from-emerald-600 to-green-700" },
  { id: 45, name: "ايتونز سعودي", amount: "500 ريال", price: 6900, image: "🍎", color: "from-emerald-600 to-green-700" },
];

const amazonEGItems = [
  { id: 46, name: "أمازون مصر", amount: "50 ج.م", price: 55, image: "📦", color: "from-amber-500 to-orange-600" },
  { id: 47, name: "أمازون مصر", amount: "100 ج.م", price: 110, image: "📦", color: "from-amber-500 to-orange-600" },
  { id: 48, name: "أمازون مصر", amount: "200 ج.م", price: 220, image: "📦", color: "from-amber-500 to-orange-600", popular: true },
  { id: 49, name: "أمازون مصر", amount: "500 ج.م", price: 550, image: "📦", color: "from-amber-500 to-orange-600" },
  { id: 50, name: "أمازون مصر", amount: "1000 ج.م", price: 1100, image: "📦", color: "from-amber-500 to-orange-600" },
];

const mobileOperators = [
  { id: 1, name: "فودافون", logo: "📱", color: "from-red-500 to-rose-600", amounts: [10, 20, 50, 100, 200] },
  { id: 2, name: "اتصالات", logo: "📡", color: "from-green-500 to-emerald-600", amounts: [10, 20, 50, 100, 200] },
  { id: 3, name: "اورنج", logo: "🟠", color: "from-orange-500 to-amber-600", amounts: [10, 20, 50, 100, 200] },
  { id: 4, name: "وي", logo: "🌐", color: "from-purple-500 to-violet-600", amounts: [10, 20, 50, 100, 200] },
];

const paymentMethods = [
  { id: "wallet", label: "محفظتي", icon: Wallet, desc: "رصيد الموقع" },
  { id: "instapay", label: "إنستا باي", icon: Zap, desc: "تحويل فوري", number: INSTAPAY_NUMBER },
  { id: "cash", label: "فودافون كاش", icon: Wallet, desc: "تحويل فودافون كاش", number: VODAFONE_CASH_NUMBER },
  { id: "card", label: "بطاقة ائتمانية", icon: CreditCard, desc: "Visa / Mastercard" },
  { id: "fawry", label: "فوري باي", icon: Zap, desc: "دفع سريع وآمن" },
  { id: "bank", label: "تحويل بنكي", icon: CreditCard, desc: "حوالة بنكية" },
];

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mobileCart, setMobileCart] = useState<MobileCartItem[]>([]);
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("instapay");
  const [currentPage, setCurrentPage] = useState("home");
  const [gameTab, setGameTab] = useState("android");
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customMobileAmount, setCustomMobileAmount] = useState("");

  // Payment proof state
  const [senderNumber, setSenderNumber] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofNote, setProofNote] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  // Wallet top-up state
  const [walletTopUpAmount, setWalletTopUpAmount] = useState("");
  const [walletTopUpMethod, setWalletTopUpMethod] = useState("instapay");
  const [walletSenderNumber, setWalletSenderNumber] = useState("");
  const [walletProofImage, setWalletProofImage] = useState<string | null>(null);
  const [walletTopUpSuccess, setWalletTopUpSuccess] = useState(false);
  const [proofTxnRef, setProofTxnRef] = useState("");
  const [walletTxnRef, setWalletTxnRef] = useState("");
  const [topUpRequests, setTopUpRequests] = useState<TopUpRequest[]>([]);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authInviteCode, setAuthInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const loadMe = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) {
        setCurrentUser(null);
        return;
      }
      const u = await res.json();
      setCurrentUser({ name: u.name, email: u.email, password: "", inviteCode: u.invite_code, points: u.points, balance: u.balance });
    } catch {
      /* الخادم غير متاح */
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const addToCart = (item: CartItem) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const addMobileToCart = () => {
    const amount = selectedAmount || (customMobileAmount ? parseFloat(customMobileAmount) : 0);
    if (selectedOperator && amount > 0 && phoneNumber) {
      setMobileCart([...mobileCart, { operator: selectedOperator.name, logo: selectedOperator.logo, color: selectedOperator.color, amount, phone: phoneNumber }]);
      setSelectedAmount(null);
      setCustomMobileAmount("");
      setPhoneNumber("");
    }
  };

  const removeMobileFromCart = (index: number) => {
    setMobileCart(mobileCart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const mobileTotal = mobileCart.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = total + mobileTotal;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWalletImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWalletProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      setAuthError("سجل الدخول أولاً لإتمام الطلب");
      setCurrentPage("auth");
      return;
    }
    const isProof = paymentMethod === "instapay" || paymentMethod === "cash";
    if (paymentMethod !== "wallet" && !isProof) {
      alert("طريقة الدفع دي غير متاحة حالياً، اختر المحفظة أو فودافون كاش أو إنستا باي");
      return;
    }
    if (!email.trim()) {
      alert("أدخل البريد الإلكتروني لاستلام الكود");
      return;
    }
    if (isProof && (!isValidEgPhone(senderNumber) || proofTxnRef.trim().length < 6 || !proofImage)) return;

    const form = new FormData();
    form.append("payload", JSON.stringify({
      items: cart.map((i) => ({ sku: `${i.name}|${i.amount}` })),
      mobile: mobileCart.map((m) => ({ operator: m.operator, phone: m.phone, amount: m.amount })),
      email: email.trim(),
      method: paymentMethod,
      note: proofNote,
    }));
    if (isProof && proofImage) {
      form.append("sender_number", senderNumber.trim());
      form.append("txn_ref", proofTxnRef.trim());
      form.append("proof", await (await fetch(proofImage)).blob(), "proof");
    }
    try {
      const res = await fetch("/api/orders", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(typeof err?.detail === "string" ? err.detail : "تعذر إرسال الطلب، حاول مرة أخرى");
        return;
      }
    } catch {
      alert("تعذر الاتصال بالخادم");
      return;
    }
    setOrderSubmitted(true);
    setCart([]);
    setMobileCart([]);
    setEmail("");
    setSenderNumber("");
    setProofTxnRef("");
    setProofImage(null);
    setProofNote("");
    loadMe();
  };
  const handleWalletTopUp = async () => {
    const amount = parseFloat(walletTopUpAmount);
    if (!amount || amount <= 0) return;
    if (!currentUser) {
      setAuthError("يجب تسجيل الدخول أولاً لشحن المحفظة");
      setCurrentPage("auth");
      return;
    }
    if (!isValidEgPhone(walletSenderNumber) || walletTxnRef.trim().length < 6 || !walletProofImage) return;

    // الرصيد لا يُضاف هنا أبداً: الخادم يسجل الطلب والأدمن يؤكده
    const form = new FormData();
    form.append("amount", String(amount));
    form.append("method", walletTopUpMethod);
    form.append("sender_number", walletSenderNumber.trim());
    form.append("txn_ref", walletTxnRef.trim());
    form.append("proof", await (await fetch(walletProofImage)).blob(), "proof");
    try {
      const res = await fetch("/api/wallet/topups", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(typeof err?.detail === "string" ? err.detail : "تعذر إرسال الطلب، حاول مرة أخرى");
        return;
      }
      const created = await res.json();
      setTopUpRequests([...topUpRequests, { id: created.id, amount, method: walletTopUpMethod, sender: walletSenderNumber, status: "pending" }]);
    } catch {
      alert("تعذر الاتصال بالخادم");
      return;
    }
    setWalletTopUpSuccess(true);
    setWalletTopUpAmount("");
    setWalletSenderNumber("");
    setWalletTxnRef("");
    setWalletProofImage(null);
  };

  const handleRegister = async () => {
    if (!authName || !authEmail || !authPassword) {
      setAuthError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (authPassword.length < 8) {
      setAuthError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword, invite_code: authInviteCode.trim() || null }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setAuthError(typeof data?.detail === "string" ? data.detail : "تعذر إنشاء الحساب، راجع البيانات");
        return;
      }
      await loadMe();
      setAuthSuccess(data.message);
    } catch {
      setAuthError("تعذر الاتصال بالخادم");
      return;
    }
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthInviteCode("");
    setAuthError("");
    setCurrentPage("home");
  };
  const handleLogin = async () => {
    if (!authEmail || !authPassword) {
      setAuthError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setAuthError(typeof data?.detail === "string" ? data.detail : "بيانات الدخول غير صحيحة");
        return;
      }
      await loadMe();
    } catch {
      setAuthError("تعذر الاتصال بالخادم");
      return;
    }
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
    setAuthSuccess("");
    setCurrentPage("home");
  };
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => null);
    setCurrentUser(null);
    setCurrentPage("home");
  };

  const renderAuthPage = () => (
    <div className="mx-auto max-w-md">
      <Card className="overflow-hidden border-amber-100 shadow-xl">
        <div className="bg-gradient-to-l from-amber-600 to-orange-600 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            {authMode === "login" ? <LogIn className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {authMode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </h2>
          <p className="mt-2 text-amber-100">
            {authMode === "login" ? "أهلاً بعودتك! سجل دخولك للمتابعة" : "انضم إلينا واستمتع بمزايا حصرية"}
          </p>
        </div>

        <CardContent className="p-8">
          {authError && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
              {authError}
            </div>
          )}

          {authMode === "register" && (
            <div className="mb-4">
              <Label htmlFor="authName">الاسم الكامل</Label>
              <Input
                id="authName"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <div className="mb-4">
            <Label htmlFor="authEmail">البريد الإلكتروني</Label>
            <Input
              id="authEmail"
              type="email"
              placeholder="example@email.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="mt-1"
              dir="ltr"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="authPassword">كلمة المرور</Label>
            <div className="relative mt-1">
              <Input
                id="authPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="pl-10"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {authMode === "register" && (
            <div className="mb-6">
              <Label htmlFor="authInviteCode" className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-amber-600" />
                رمز الدعوة (اختياري)
              </Label>
              <Input
                id="authInviteCode"
                type="text"
                placeholder="مثال: SH1234"
                value={authInviteCode}
                onChange={(e) => setAuthInviteCode(e.target.value)}
                className="mt-1"
                dir="ltr"
              />
              <p className="mt-2 text-xs text-amber-600">
                🎁 أدخل رمز دعوة صديق واحصل على 50 نقطة مكافأة إضافية
              </p>
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-l from-amber-600 to-orange-600 py-6 text-lg hover:from-amber-700 hover:to-orange-700"
            onClick={authMode === "login" ? handleLogin : handleRegister}
          >
            {authMode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </Button>

          <div className="mt-6 text-center text-sm text-slate-500">
            {authMode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
            <button
              className="mr-2 font-bold text-amber-600 hover:text-amber-700"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthError("");
              }}
            >
              {authMode === "login" ? "إنشاء حساب جديد" : "تسجيل الدخول"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWalletPage = () => (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="overflow-hidden border-emerald-100 shadow-xl">
        <div className="bg-gradient-to-l from-emerald-600 to-teal-600 p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100">رصيد محفظتك</p>
              <p className="mt-2 text-4xl font-bold text-white">
                {currentUser ? currentUser.balance : 0} <span className="text-2xl">ج.م</span>
              </p>
              <p className="mt-2 text-sm text-emerald-100">
                {currentUser ? currentUser.name : "سجل الدخول لعرض محفظتك"}
              </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
              <Wallet className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {walletTopUpSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 p-6">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <p className="font-bold text-green-800">
              تم استلام طلب شحن المحفظة! سيتم إضافة الرصيد بعد مراجعة الإثبات
            </p>
          </CardContent>
        </Card>
      )}

      {topUpRequests.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="space-y-2 p-6">
            <p className="font-bold text-amber-800">طلبات الشحن قيد المراجعة</p>
            {topUpRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-white p-3 text-sm">
                <span className="font-bold text-slate-900">{r.amount} ج.م</span>
                <span className="text-slate-600">{r.method === "cash" ? "فودافون كاش" : "إنستا باي"} - <span dir="ltr">{r.sender}</span></span>
                <Badge className="bg-amber-500">قيد المراجعة</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-emerald-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            شحن المحفظة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>المبلغ المراد شحنه</Label>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {[50, 100, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setWalletTopUpAmount(String(amt))}
                  className={`rounded-xl border-2 p-3 text-center font-bold transition-all ${
                    walletTopUpAmount === String(amt)
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-700 hover:border-emerald-300"
                  }`}
                >
                  {amt} ج.م
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="أو أدخل مبلغ مخصص"
              value={walletTopUpAmount}
              onChange={(e) => setWalletTopUpAmount(e.target.value)}
              className="mt-3"
            />
          </div>

          <div>
            <Label>طريقة الشحن</Label>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {[
                { id: "instapay", label: "إنستا باي", number: INSTAPAY_NUMBER, color: "from-purple-500 to-fuchsia-600" },
                { id: "cash", label: "فودافون كاش", number: VODAFONE_CASH_NUMBER, color: "from-red-500 to-rose-600" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setWalletTopUpMethod(m.id)}
                  className={`rounded-xl border-2 p-4 text-right transition-all ${
                    walletTopUpMethod === m.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} text-white`}>
                      {m.id === "instapay" ? <Zap className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{m.label}</p>
                      <p className="text-xs text-slate-500" dir="ltr">{m.number}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold text-slate-700">رقم التحويل:</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900" dir="ltr">
                  {walletTopUpMethod === "instapay" ? INSTAPAY_NUMBER : VODAFONE_CASH_NUMBER}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(walletTopUpMethod === "instapay" ? INSTAPAY_NUMBER : VODAFONE_CASH_NUMBER, "wallet")}
                >
                  {copied === "wallet" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <Label>الرقم الذي قمت بالتحويل منه *</Label>
              <Input
                type="tel"
                placeholder="01xxxxxxxxx"
                value={walletSenderNumber}
                onChange={(e) => setWalletSenderNumber(e.target.value)}
                className="mt-1 bg-white"
                dir="ltr"
              />
            </div>

            <div className="mb-4">
              <Label>رقم العملية (من رسالة التأكيد) *</Label>
              <Input
                placeholder="مثال: 123456789"
                value={walletTxnRef}
                onChange={(e) => setWalletTxnRef(e.target.value)}
                className="mt-1 bg-white"
                dir="ltr"
              />
            </div>

            <div>
              <Label>صورة إثبات التحويل (سكرين شوت) *</Label>
              <div className="mt-2">
                <input
                  id="walletProof"
                  type="file"
                  accept="image/*"
                  onChange={handleWalletImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="walletProof"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-white p-6 transition-all hover:border-emerald-500 hover:bg-emerald-50"
                >
                  {walletProofImage ? (
                    <div className="w-full">
                      <img src={walletProofImage} alt="إثبات" className="mx-auto max-h-64 rounded-lg object-contain" />
                      <p className="mt-3 text-center text-sm font-bold text-green-600">✓ تم رفع الصورة</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-3 h-10 w-10 text-emerald-500" />
                      <p className="font-bold text-slate-700">اضغط لرفع صورة الإثبات</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 py-6 text-lg hover:from-emerald-700 hover:to-teal-700"
            onClick={handleWalletTopUp}
            disabled={!walletTopUpAmount || !isValidEgPhone(walletSenderNumber) || walletTxnRef.trim().length < 6 || !walletProofImage}
          >
            <Wallet className="ml-2 h-5 w-5" />
            تأكيد شحن المحفظة
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderGameItems = (items: any[]) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="group overflow-hidden border-slate-200 transition-all hover:shadow-xl">
          <div className={`relative bg-gradient-to-br ${item.color} p-6`}>
            {item.popular && (
              <Badge className="absolute top-4 right-4 bg-white/20 text-white">
                الأكثر مبيعاً
              </Badge>
            )}
            <div className="text-6xl">{item.image}</div>
            <h3 className="mt-4 text-xl font-bold text-white">{item.name}</h3>
            <p className="text-sm text-white/80">شحن</p>
          </div>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">الكمية</p>
                <p className="text-2xl font-bold text-slate-900">{item.amount}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500">السعر</p>
                <p className="text-2xl font-bold text-orange-600">{item.price} ج.م</p>
              </div>
            </div>
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={() => addToCart(item)}
            >
              <ShoppingCart className="ml-2 h-4 w-4" />
              أضف إلى السلة
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case "auth":
        return renderAuthPage();
      case "wallet":
        return renderWalletPage();
      case "freefire":
        return (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200">
                <Flame className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">فري فاير</h2>
                <p className="mt-1 text-slate-500">شحن جواهر فري فاير بأسعار مميزة</p>
              </div>
            </div>

            <div className="mb-10">
              <div className="mb-6 flex items-center gap-3">
                <Crown className="h-6 w-6 text-amber-500" />
                <h3 className="text-2xl font-bold text-slate-900">العضويات</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {freeFireMemberships.map((item) => (
                  <Card key={item.id} className="group overflow-hidden border-slate-200 transition-all hover:shadow-xl">
                    <div className={`relative bg-gradient-to-br ${item.color} p-6`}>
                      {item.popular && (
                        <Badge className="absolute top-4 right-4 bg-white/20 text-white">
                          الأكثر طلباً
                        </Badge>
                      )}
                      <div className="text-6xl">{item.image}</div>
                      <h3 className="mt-4 text-xl font-bold text-white">{item.name}</h3>
                      <p className="text-sm text-white/80">عضوية</p>
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500">الكمية</p>
                          <p className="text-2xl font-bold text-slate-900">{item.amount}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-slate-500">السعر</p>
                          <p className="text-2xl font-bold text-orange-600">{item.price} ج.م</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600"
                        onClick={() => addToCart(item)}
                      >
                        <Crown className="ml-2 h-4 w-4" />
                        اشترك الآن
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <Star className="h-6 w-6 text-orange-500" />
              <h3 className="text-2xl font-bold text-slate-900">الجواهر</h3>
            </div>
            {renderGameItems(freeFireItems)}
          </div>
        );
      case "pubg":
        return (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-200">
                <Target className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">ببجي موبايل</h2>
                <p className="mt-1 text-slate-500">شحن UC ببجي بأفضل العروض</p>
              </div>
            </div>
            {renderGameItems(pubgItems)}
          </div>
        );
      case "efootball":
        return (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">بيس (eFootball)</h2>
                <p className="mt-1 text-slate-500">شحن سريع ومضمون مع إيصال لكل الشحنات</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <p className="font-bold text-green-800">
                  شحن سريع ومضمون - سرعة في الرد واحترام في التعامل - متاح إيصال لكل الشحنات عشان تبقي شاحن وانت مطمن 🧾
                </p>
              </div>
            </div>

            <div className="mb-6 flex gap-4">
              <button
                onClick={() => setGameTab("android")}
                className={`rounded-xl px-6 py-3 font-bold transition-all ${
                  gameTab === "android" 
                    ? "bg-green-600 text-white shadow-lg shadow-green-200" 
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-green-300"
                }`}
              >
                📱 أندرويد
              </button>
              <button
                onClick={() => setGameTab("ios")}
                className={`rounded-xl px-6 py-3 font-bold transition-all ${
                  gameTab === "ios" 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300"
                }`}
              >
                🍎 أيفون (IOS)
              </button>
            </div>

            {gameTab === "android" ? renderGameItems(efootballAndroidItems) : renderGameItems(efootballIOSItems)}
          </div>
        );
      case "fifa":
        return (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200">
                <Gamepad2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">فيفا 24</h2>
                <p className="mt-1 text-slate-500">شحن نقاط FP فيفا بأسعار مميزة</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-sky-600" />
                <p className="font-bold text-sky-800">
                  شحن فوري ومضمون لجميع المنصات - PlayStation, Xbox, PC
                </p>
              </div>
            </div>

            {renderGameItems(fifaItems)}
          </div>
        );
      case "tiktok":
        return (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-200">
                <Music2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">تيك توك</h2>
                <p className="mt-1 text-slate-500">شحن عملات تيك توك لدعم المبدعين المفضلين لديك</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-slate-600" />
                <p className="font-bold text-slate-800">
                  شحن فوري لعملات تيك توك - أرسل الهدايا وادعم المبدعين 🎁
                </p>
              </div>
            </div>

            {renderGameItems(tiktokItems)}
          </div>
        );
      case "itunes":
        return (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-lg shadow-slate-200">
                <Apple className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">بطاقات ايتونز</h2>
                <p className="mt-1 text-slate-500">بطاقات ايتونز أمريكي وسعودي بأسعار مميزة</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-slate-600" />
                <p className="font-bold text-slate-800">
                  توصيل فوري للكود - شحن مباشر على حسابك في App Store 🍎
                </p>
              </div>
            </div>

            <div className="mb-10">
              <div className="mb-6 flex items-center gap-3">
                <Apple className="h-6 w-6 text-slate-700" />
                <h3 className="text-2xl font-bold text-slate-900">ايتونز أمريكي</h3>
              </div>
              {renderGameItems(itunesUSItems)}
            </div>

            <div>
              <div className="mb-6 flex items-center gap-3">
                <Apple className="h-6 w-6 text-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-900">ايتونز سعودي</h3>
              </div>
              {renderGameItems(itunesSAItems)}
            </div>
          </div>
        );
      case "amazon":
        return (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">رصيد أمازون مصر</h2>
                <p className="mt-1 text-slate-500">اشحن رصيد أمازون مصر للتسوق بسهولة</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-amber-600" />
                <p className="font-bold text-amber-800">
                  توصيل فوري للكود - استخدمه مباشرة على حسابك في أمازون مصر 📦
                </p>
              </div>
            </div>

            {renderGameItems(amazonEGItems)}
          </div>
        );
      case "mobile":
        return (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-200">
                <Smartphone className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">شحن رصيد الموبايل</h2>
                <p className="mt-1 text-slate-500">اشحن رصيدك لجميع شركات الاتصالات</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {mobileOperators.map((operator) => (
                <Card 
                  key={operator.id} 
                  className={`cursor-pointer border-2 transition-all hover:shadow-xl ${
                    selectedOperator?.id === operator.id ? "border-purple-500 bg-purple-50" : "border-slate-200"
                  }`}
                  onClick={() => setSelectedOperator(operator)}
                >
                  <div className={`bg-gradient-to-br ${operator.color} p-6`}>
                    <div className="text-6xl">{operator.logo}</div>
                    <h3 className="mt-4 text-xl font-bold text-white">{operator.name}</h3>
                    <p className="text-sm text-white/80">شحن رصيد</p>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-2">
                      {operator.amounts.map((amount: number) => (
                        <button
                          key={amount}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOperator(operator);
                            setSelectedAmount(amount);
                            setCustomMobileAmount("");
                          }}
                          className={`rounded-lg border-2 p-2 text-center transition-all ${
                            selectedAmount === amount && selectedOperator?.id === operator.id
                              ? "border-purple-500 bg-purple-100"
                              : "border-slate-200 hover:border-purple-300"
                          }`}
                        >
                          <p className="text-sm font-bold text-slate-900">{amount} ج.م</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedOperator && (
              <Card className="mt-6 border-purple-100 bg-purple-50/50">
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label>رقم الموبايل</Label>
                      <Input
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1 bg-white"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label>المبلغ المحدد</Label>
                      <Input
                        value={selectedAmount ? `${selectedAmount} ج.م` : "اختر المبلغ"}
                        disabled
                        className="mt-1 bg-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={addMobileToCart}
                        disabled={!selectedAmount || !phoneNumber}
                      >
                        <Plus className="ml-2 h-4 w-4" />
                        أضف إلى السلة
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-purple-100 pt-6">
                    <Label>أو أدخل مبلغ مخصص</Label>
                    <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="5"
                          placeholder="أدخل المبلغ الذي تريده"
                          value={customMobileAmount}
                          onChange={(e) => {
                            setCustomMobileAmount(e.target.value);
                            setSelectedAmount(null);
                          }}
                          className="bg-white"
                        />
                      </div>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={addMobileToCart}
                        disabled={!customMobileAmount || !phoneNumber}
                      >
                        <Plus className="ml-2 h-4 w-4" />
                        أضف المبلغ المخصص
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-12">
            {authSuccess && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center font-bold text-green-700">
                {authSuccess}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { icon: Zap, title: "توصيل فوري", desc: "استلم الكود خلال دقائق" },
                { icon: Shield, title: "دفع آمن", desc: "تشفير كامل لبياناتك" },
                { icon: CheckCircle2, title: "إيصال لكل شحنة", desc: "كن مطمئن مع كل عملية" },
              ].map((feature, i) => (
                <Card key={i} className="border-orange-100 bg-white/80 shadow-sm">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{feature.title}</h3>
                      <p className="text-sm text-slate-500">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-900">اختر اللعبة</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: "freefire", name: "فري فاير", desc: "شحن جواهر وعضويات", icon: Flame, color: "from-orange-500 to-red-600", emoji: "🔥" },
                  { id: "pubg", name: "ببجي موبايل", desc: "شحن UC", icon: Target, color: "from-yellow-500 to-orange-600", emoji: "🎯" },
                  { id: "efootball", name: "بيس eFootball", desc: "شحن كوين", icon: Trophy, color: "from-green-500 to-emerald-600", emoji: "⚽" },
                  { id: "fifa", name: "فيفا 24", desc: "شحن نقاط FP", icon: Gamepad2, color: "from-sky-500 to-blue-600", emoji: "🎮" },
                  { id: "tiktok", name: "تيك توك", desc: "شحن عملات", icon: Music2, color: "from-slate-700 to-slate-900", emoji: "🎵" },
                  { id: "itunes", name: "ايتونز", desc: "بطاقات أمريكي وسعودي", icon: Apple, color: "from-slate-600 to-slate-800", emoji: "🍎" },
                  { id: "amazon", name: "أمازون مصر", desc: "رصيد تسوق", icon: ShoppingBag, color: "from-amber-500 to-orange-600", emoji: "📦" },
                  { id: "mobile", name: "رصيد موبايل", desc: "جميع الشركات", icon: Smartphone, color: "from-purple-500 to-violet-600", emoji: "📱" },
                ].map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setCurrentPage(game.id)}
                    className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 text-center transition-all hover:border-orange-300 hover:shadow-xl"
                  >
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${game.color} text-white shadow-lg transition-transform group-hover:scale-110`}>
                      <game.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{game.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{game.desc}</p>
                    <div className="mt-4 text-3xl">{game.emoji}</div>
                  </button>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border-orange-100 bg-gradient-to-l from-amber-600 to-orange-600 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-amber-100">طرق الدفع المتاحة</p>
                    <p className="mt-2 text-2xl font-bold text-white">محفظتي • إنستا باي • فودافون كاش • بطاقة</p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-orange-50/30" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => setCurrentPage("home")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">شحن <span className="text-amber-600">سريع</span></h1>
              <p className="text-xs text-slate-500">متجر الشحن والبطاقات</p>
            </div>
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            {currentUser && (
              <button
                onClick={() => { loadMe(); setCurrentPage("wallet"); }}
                className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 transition-all hover:border-emerald-400 hover:bg-emerald-100"
              >
                <Wallet className="h-4 w-4 text-emerald-600" />
                <div className="text-right">
                  <p className="text-xs text-emerald-600">محفظتي</p>
                  <p className="text-sm font-bold text-emerald-700">{currentUser.balance} ج.م</p>
                </div>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-700">{currentUser.name}</p>
                    <p className="text-xs text-amber-600">{currentUser.points} نقطة</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                onClick={() => setCurrentPage("auth")}
              >
                <User className="ml-2 h-4 w-4" />
                حسابي
              </Button>
            )}

            <Button variant="outline" className="relative">
              <ShoppingCart className="ml-2 h-4 w-4" />
              <span className="hidden sm:inline">السلة</span>
              {(cart.length + mobileCart.length) > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs text-white">
                  {cart.length + mobileCart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {currentPage === "home" && (
        <section className="relative overflow-hidden bg-gradient-to-l from-amber-600 via-orange-600 to-red-700 py-16">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 text-8xl">🔥</div>
            <div className="absolute bottom-10 left-10 text-8xl">⚽</div>
            <div className="absolute top-20 left-1/4 text-6xl">⚡</div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                <Zap className="ml-1 h-3 w-3" />
                توصيل فوري
              </Badge>
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                شحن سريع
                <span className="block text-2xl text-amber-200 sm:text-3xl">كل احتياجاتك في مكان واحد</span>
              </h2>
              <p className="mb-8 text-lg text-amber-100">
                اشحن فري فاير، ببجي، بيس، فيفا، تيك توك، ايتونز، أمازون، ورصيد موبايل لكل الشركات. آمن، سريع، وموثوق.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50" onClick={() => setCurrentPage("freefire")}>
                  تسوق الآن
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setCurrentPage("wallet")}>
                  <Wallet className="ml-2 h-5 w-5" />
                  محفظتي
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {currentPage !== "home" && currentPage !== "auth" && (
          <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
            <button className="flex items-center gap-1 hover:text-amber-600" onClick={() => setCurrentPage("home")}>
              <Home className="h-4 w-4" />
              الرئيسية
            </button>
            <span>/</span>
            <span className="font-bold text-slate-900">
              {currentPage === "wallet" ? "محفظتي" :
               currentPage === "freefire" ? "فري فاير" : 
               currentPage === "pubg" ? "ببجي موبايل" : 
               currentPage === "efootball" ? "بيس eFootball" : 
               currentPage === "fifa" ? "فيفا 24" :
               currentPage === "tiktok" ? "تيك توك" :
               currentPage === "itunes" ? "ايتونز" :
               currentPage === "amazon" ? "أمازون مصر" :
               currentPage === "mobile" ? "رصيد موبايل" : ""}
            </span>
          </div>
        )}

        {renderPage()}

        {orderSubmitted && (
          <Card className="mt-12 border-green-200 bg-green-50 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-green-800">تم إرسال طلبك بنجاح! 🎉</h3>
              <p className="mt-2 text-green-700">
                {paymentMethod === "wallet" 
                  ? "تم خصم المبلغ من محفظتك وجاري تنفيذ طلبك" 
                  : "سيتم مراجعة إثبات التحويل وتنفيذ طلبك خلال دقائق"}
              </p>
              <Button 
                className="mt-6 bg-green-600 hover:bg-green-700"
                onClick={() => setOrderSubmitted(false)}
              >
                حسناً
              </Button>
            </CardContent>
          </Card>
        )}

        {(cart.length > 0 || mobileCart.length > 0) && (
          <Card className="mt-12 border-amber-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-amber-600" />
                سلة المشتريات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-2xl`}>
                        {item.image}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-amber-600">{item.price} ج.م</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeFromCart(index)}
                      >
                        إزالة
                      </Button>
                    </div>
                  </div>
                ))}

                {mobileCart.map((item, index) => (
                  <div key={`mobile-${index}`} className="flex items-center justify-between rounded-xl bg-purple-50 p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-2xl`}>
                        {item.logo}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.operator}</p>
                        <p className="text-sm text-slate-500">شحن {item.amount} ج.م - {item.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-purple-600">{item.amount} ج.م</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeMobileFromCart(index)}
                      >
                        إزالة
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-amber-100 pt-6">
                <div className="mb-6 flex items-center justify-between rounded-xl bg-amber-50 p-4">
                  <span className="text-lg font-bold text-slate-900">الإجمالي</span>
                  <span className="text-2xl font-bold text-amber-600">{grandTotal} ج.م</span>
                </div>

                <div className="mb-6">
                  <Label htmlFor="email">البريد الإلكتروني لاستلام الكود</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="mb-6">
                  <Label>طريقة الدفع</Label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`rounded-xl border-2 p-4 text-center transition-all ${
                          paymentMethod === method.id
                            ? "border-amber-600 bg-amber-50"
                            : "border-slate-200 hover:border-amber-300"
                        }`}
                      >
                        <method.icon className="mx-auto mb-2 h-6 w-6 text-amber-600" />
                        <span className="text-sm font-bold text-slate-900">{method.label}</span>
                        <span className="mt-1 block text-xs text-slate-500">{method.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "wallet" && (
                  <div className="mb-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-l from-emerald-50 to-teal-50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">الدفع من محفظتي</h3>
                        <p className="text-sm text-slate-600">
                          {currentUser 
                            ? `رصيدك الحالي: ${currentUser.balance} ج.م` 
                            : "سجل الدخول لاستخدام المحفظة"}
                        </p>
                      </div>
                    </div>
                    {currentUser && currentUser.balance < grandTotal && (
                      <div className="mt-4 rounded-xl bg-red-50 p-4">
                        <p className="text-sm font-bold text-red-600">
                          ⚠️ رصيدك غير كافٍ. تحتاج {grandTotal - currentUser.balance} ج.م إضافية
                        </p>
                        <Button
                          size="sm"
                          className="mt-2 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => setCurrentPage("wallet")}
                        >
                          شحن المحفظة الآن
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {(paymentMethod === "instapay" || paymentMethod === "cash") && (
                  <div className="mb-6 space-y-4">
                    <div className={`rounded-2xl border-2 p-6 ${
                      paymentMethod === "instapay" 
                        ? "border-purple-200 bg-gradient-to-l from-purple-50 to-fuchsia-50" 
                        : "border-red-200 bg-gradient-to-l from-red-50 to-rose-50"
                    }`}>
                      <div className="mb-4 flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                          paymentMethod === "instapay" 
                            ? "bg-gradient-to-br from-purple-500 to-fuchsia-600" 
                            : "bg-gradient-to-br from-red-500 to-rose-600"
                        }`}>
                          {paymentMethod === "instapay" ? <Zap className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {paymentMethod === "instapay" ? "الدفع عبر إنستا باي" : "الدفع عبر فودافون كاش"}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {paymentMethod === "instapay" 
                              ? "حوّل المبلغ على رقم إنستا باي التالي" 
                              : "حوّل المبلغ على رقم فودافون كاش التالي"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white p-4">
                        <p className="mb-2 text-sm font-bold text-slate-500">رقم التحويل</p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-2xl font-bold tracking-wider text-slate-900" dir="ltr">
                            {paymentMethod === "instapay" ? INSTAPAY_NUMBER : VODAFONE_CASH_NUMBER}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            onClick={() => copyToClipboard(
                              paymentMethod === "instapay" ? INSTAPAY_NUMBER : VODAFONE_CASH_NUMBER,
                              paymentMethod
                            )}
                          >
                            {copied === paymentMethod ? (
                              <>
                                <Check className="ml-1 h-4 w-4 text-green-600" />
                                تم النسخ
                              </>
                            ) : (
                              <>
                                <Copy className="ml-1 h-4 w-4" />
                                نسخ
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-white/70 p-4">
                        <p className="text-sm font-bold text-slate-700">
                          💰 المبلغ المطلوب تحويله: <span className="text-lg text-amber-600">{grandTotal} ج.م</span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                        <Upload className="h-5 w-5 text-amber-600" />
                        إثبات التحويل
                      </h3>

                      <div className="mb-4">
                        <Label htmlFor="senderNumber" className="text-slate-700">
                          الرقم الذي قمت بالتحويل منه *
                        </Label>
                        <Input
                          id="senderNumber"
                          type="tel"
                          placeholder="01xxxxxxxxx"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          className="mt-1 bg-white"
                          dir="ltr"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          {paymentMethod === "cash" ? "أدخل رقم فودافون كاش الذي حوّلت منه (11 رقم يبدأ بـ 01)" : "أدخل رقمك الذي حولت منه المبلغ لتأكيد العملية"}
                        </p>
                      </div>

                      <div className="mb-4">
                        <Label htmlFor="proofTxn" className="text-slate-700">رقم العملية (من رسالة التأكيد) *</Label>
                        <Input
                          id="proofTxn"
                          placeholder="مثال: 123456789"
                          value={proofTxnRef}
                          onChange={(e) => setProofTxnRef(e.target.value)}
                          className="mt-1 bg-white"
                          dir="ltr"
                        />
                      </div>

                      <div className="mb-4">
                        <Label htmlFor="proofImage" className="text-slate-700">
                          صورة إثبات التحويل (سكرين شوت)
                        </Label>
                        <div className="mt-2">
                          <input
                            id="proofImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="proofImage"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-white p-6 transition-all hover:border-amber-500 hover:bg-amber-50"
                          >
                            {proofImage ? (
                              <div className="w-full">
                                <img 
                                  src={proofImage} 
                                  alt="إثبات التحويل" 
                                  className="mx-auto max-h-64 rounded-lg object-contain"
                                />
                                <p className="mt-3 text-center text-sm font-bold text-green-600">
                                  ✓ تم رفع الصورة - اضغط لتغييرها
                                </p>
                              </div>
                            ) : (
                              <>
                                <Upload className="mb-3 h-10 w-10 text-amber-500" />
                                <p className="font-bold text-slate-700">اضغط لرفع صورة الإثبات</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  PNG, JPG - سكرين شوت التحويل
                                </p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="proofNote" className="text-slate-700">
                          ملاحظات إضافية (اختياري)
                        </Label>
                        <Textarea
                          id="proofNote"
                          placeholder="أي تفاصيل إضافية تريد إضافتها..."
                          value={proofNote}
                          onChange={(e) => setProofNote(e.target.value)}
                          className="mt-1 bg-white"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="mb-4 rounded-xl bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">
                      سيتم تحويلك لصفحة الدفع الآمنة لإدخال بيانات البطاقة
                    </p>
                  </div>
                )}

                {paymentMethod === "fawry" && (
                  <div className="mb-4 rounded-xl bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-700">
                      سيتم إرسال كود فوري باي إلى بريدك الإلكتروني
                    </p>
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <div className="mb-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">
                      سيتم إرسال بيانات الحساب البنكي إلى بريدك الإلكتروني
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-to-l from-amber-600 to-orange-600 py-6 text-lg hover:from-amber-700 hover:to-orange-700"
                  onClick={handleCheckout}
                  disabled={
                    (paymentMethod === "instapay" || paymentMethod === "cash") && 
                    (!isValidEgPhone(senderNumber) || proofTxnRef.trim().length < 6 || !proofImage)
                  }
                >
                  <Shield className="ml-2 h-5 w-5" />
                  {paymentMethod === "wallet" ? "ادفع من محفظتي" :
                   paymentMethod === "instapay" ? "تأكيد الطلب - إنستا باي" : 
                   paymentMethod === "cash" ? "تأكيد الطلب - فودافون كاش" :
                   paymentMethod === "fawry" ? "ادفع عبر فوري باي" : 
                   paymentMethod === "bank" ? "ادفع عبر تحويل بنكي" :
                   "ادفع الآن بأمان"}
                </Button>

                {(paymentMethod === "instapay" || paymentMethod === "cash") && 
                 (!isValidEgPhone(senderNumber) || proofTxnRef.trim().length < 6 || !proofImage) && (
                  <p className="mt-3 text-center text-sm text-red-500">
                    ⚠️ يجب إدخال الرقم المحول منه ورقم العملية ورفع صورة إثبات التحويل
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <Footer />
    </div>
  );
}