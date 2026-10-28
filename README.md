# تشغيل المشروع

## الخادم
    cd backend
    pip install -r requirements.txt
    export ADMIN_KEY="مفتاح-طويل-عشوائي"
    export SECURE_COOKIES=0        # للتجربة المحلية على http فقط
    uvicorn app:app --reload --port 8000

- الأدمن: http://localhost:8000/admin/login (طلبات شحن المحفظة)
- طلبات الشراء (API بهيدر X-Admin-Key): GET /api/admin/orders ثم POST approve / reject / fulfill / refund
- الأسعار في backend/catalog.json (اتولدت من App.tsx). أي تعديل أسعار يتم هنا، مش في الواجهة.

## الواجهة (Vite)
في vite.config.ts أضف: server: { proxy: { "/api": "http://localhost:8000" } }
وبكده الكوكي والطلبات يشتغلوا من نفس الـ origin.
