import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSupabaseOrder } from './utils/orderStorage';
import heroEarbudsImg from './assets/earbuds.jpg';
import j40EarbudsImg from './assets/j40_earbuds.jpg';
import multipleDeviceImg from './assets/multiple_device.jpg';

// Icons for modern, polished aesthetic matching reference
import {
  LuShoppingBag,
  LuTruck,
  LuShieldCheck,
  LuCircleCheck,
  LuChevronDown,
  LuUser,
  LuPhone,
  LuMapPin,
  LuPlus,
  LuMinus,
  LuBluetooth,
  LuHeadphones,
  LuBatteryCharging,
  LuSparkles,
  LuDroplets,
  LuEye,
  LuPackageCheck,
  LuArrowUp,
  LuActivity
} from 'react-icons/lu';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa6';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string; badge: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    address: '',
    variant: 'ব্ল্যাক (Black)',
    quantity: 1,
    deliveryZone: 'dhaka_outside' // 'dhaka_outside' (130) or 'dhaka_inside' (70)
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [showMobileFloatingBar, setShowMobileFloatingBar] = useState(false);

  useEffect(() => {
    document.title = 'J40 V5.4 Wireless 4-in-1 Earbuds | এক কেসে ২ জোড়া (৪টি) ইয়ারবাডস';

    // Hash scrolling if landed with #order-form or similar
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  // Control mobile floating purchase bar: visible across all sections EXCEPT Hero and Order Form
  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById('hero');
      const orderFormEl = document.getElementById('order-form');

      const scrollY = window.scrollY;
      const heroHeight = heroEl ? heroEl.offsetHeight : 450;
      const isPastHero = scrollY > (heroHeight - 120);

      let isInsideOrderForm = false;
      if (orderFormEl) {
        const rect = orderFormEl.getBoundingClientRect();
        isInsideOrderForm = rect.top < (window.innerHeight - 60) && rect.bottom > 80;
      }

      if (isPastHero && !isInsideOrderForm) {
        setShowMobileFloatingBar(true);
      } else {
        setShowMobileFloatingBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pricing configuration
  const regularPrice = 1490;
  const offerPrice = 1090;
  const deliveryCharge = 0;
  const subtotal = orderForm.quantity * offerPrice;
  const totalAmount = subtotal + deliveryCharge;

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    let firstErrorFieldId = '';

    if (!orderForm.name.trim()) {
      errors.name = 'অনুগ্রহ করে আপনার পুরো নাম লিখুন';
      if (!firstErrorFieldId) firstErrorFieldId = 'form-input-name';
    }

    const cleanPhone = orderForm.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      errors.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)';
      if (!firstErrorFieldId) firstErrorFieldId = 'form-input-phone';
    }

    if (!orderForm.address.trim() || orderForm.address.trim().length < 8) {
      errors.address = 'অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (বাসা/রোড/এলাকা/জেলা)';
      if (!firstErrorFieldId) firstErrorFieldId = 'form-input-address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      // Smoothly scroll back to the top of the missing or required area and focus it
      if (firstErrorFieldId) {
        const errorEl = document.getElementById(firstErrorFieldId);
        if (errorEl) {
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            errorEl.focus();
          }, 300);
        } else {
          const formTop = document.getElementById('order-form');
          if (formTop) {
            formTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      // 1. Create order in Supabase table: neworders
      const { data: createdOrder, error } = await createSupabaseOrder({
        name: orderForm.name.trim(),
        phone: orderForm.phone.trim(),
        address: orderForm.address.trim(),
        product: 'J40 V5.4 Wireless 4-in-1 Earbuds',
        color: orderForm.variant,
        quantity: orderForm.quantity,
        price: offerPrice,
        shipping_amount: deliveryCharge,
        total_amount: totalAmount,
        status: 'pending',
      });

      if (error) {
        console.warn('Supabase insertion notice:', error);
      }

      const fallbackId = Math.floor(100000 + Math.random() * 900000);
      const finalOrderId = createdOrder?.id
        ? `J40-${createdOrder.id}`
        : `J40-${fallbackId}`;

      // 2. Navigate to Thank You page with order details for Meta Pixel Purchase tracking
      navigate('/thank-you', {
        state: {
          order: {
            selectedColor: orderForm.variant,
            quantity: orderForm.quantity,
            customerName: orderForm.name.trim(),
            phoneNumber: orderForm.phone.trim(),
            fullAddress: orderForm.address.trim(),
            deliveryArea: orderForm.deliveryZone,
          },
          orderNumber: finalOrderId,
          grandTotal: totalAmount,
          deliveryFee: deliveryCharge,
          subtotal: subtotal,
        },
      });
    } catch (err) {
      console.error('Order submission error:', err);
      const fallbackId = `J40-${Math.floor(100000 + Math.random() * 900000)}`;
      navigate('/thank-you', {
        state: {
          order: {
            selectedColor: orderForm.variant,
            quantity: orderForm.quantity,
            customerName: orderForm.name.trim(),
            phoneNumber: orderForm.phone.trim(),
            fullAddress: orderForm.address.trim(),
            deliveryArea: orderForm.deliveryZone,
          },
          orderNumber: fallbackId,
          grandTotal: totalAmount,
          deliveryFee: deliveryCharge,
          subtotal: subtotal,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      q: 'এক কেসে কয়টি ইয়ারবাড থাকছে?',
      a: 'একটি মাত্র চার্জিং কেসের ভেতর মোট ৪টি ইয়ারবাড থাকছে—সম্পূর্ণ ২ জোড়া (ওপরে ১ জোড়া এবং নিচের পার্টে আরও ১ জোড়া)।'
    },
    {
      q: 'দুজন মানুষ কি আলাদা ফোনে ব্যবহার করতে পারবে?',
      a: 'হ্যাঁ! ডুয়াল কানেক্টিভিটি থাকার কারণে চাইলে দুজন মানুষ সম্পূর্ণ স্বাধীনভাবে দুটি আলাদা স্মার্টফোনে ২ জোড়া ইয়ারবাড কানেক্ট করে ব্যবহার করতে পারবেন।'
    },
    {
      q: 'চার্জিং কেসের ব্যাটারি ও চার্জ কীভাবে দেখা যায়?',
      a: 'কেসের ঠিক মাঝামাঝি থাকা ডিজিটাল LED স্ক্রিনে কেসের মোট চার্জের শতকরা পরিমাণ (১০০%) এবং ওপর ও নিচের প্রতিটি ইয়ারবাড আলাদাভাবে চার্জ হচ্ছে কিনা তার লাইভ স্ট্যাটাস খুব সহজেই দেখা যায়।'
    },
    {
      q: 'ব্লুটুথ ভার্সন কত এবং সাউন্ড কোয়ালিটি কেমন?',
      a: 'এতে দ্রুত ও স্ট্যাবল সংযোগের জন্য রয়েছে লেটেস্ট Bluetooth v5.4 প্রযুক্তি এবং হাই-ফাই (Hi-Fi) স্টেরিও সাউন্ড কোয়ালিটি যা মিউজিক শোনার অভিজ্ঞতাকে করে তোলে দারুণ।'
    },
    {
      q: 'কথা বলার সময় বাইরের শব্দ কমবে কি (ENC)?',
      a: 'হ্যাঁ, কথা বলার সময় বাইরের অপ্রয়োজনীয় কোলাহল কমিয়ে স্পষ্ট ও স্বচ্ছ ভয়েস নিশ্চিত করতে এতে রয়েছে ENC (Environmental Noise Cancellation) প্রযুক্তি।'
    },
    {
      q: 'ঘাম বা পানির ছিটেফোঁটায় কি সুরক্ষিত?',
      a: 'হ্যাঁ, ঘাম বা পানির হালকা ছিটেফোঁটা থেকে ইয়ারবাডকে সুরক্ষিত রাখতে এতে IPX5 ওয়াটার রেজিস্ট্যান্ট ফিচার দেওয়া হয়েছে।'
    },
    {
      q: 'সারা বাংলাদেশে কি ক্যাশ অন ডেলিভারি পাওয়া যাবে?',
      a: 'হ্যাঁ, কোনো অগ্রিম টাকা ছাড়া সারা বাংলাদেশে সম্পূর্ণ ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করবেন।'
    }
  ];

  return (
    <div className="min-h-screen text-[#0F172A] selection:bg-[#0284C7] selection:text-white relative font-bn bg-[#F8FAFC]">

      {/* ==================================================
          STICKY HEADER / NAVIGATION
          ================================================== */}
      <header className="sticky top-0 z-50 frosted-menu transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">

          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0284C7] shadow-[0_0_12px_rgba(2,132,199,0.7)] animate-pulse shrink-0" />
            <a href="#" className="flex flex-col text-left group">
              <div className="font-en text-base sm:text-lg font-extrabold tracking-wider text-[#0F172A] group-hover:text-[#0284C7] transition-colors leading-tight">
                J40 EARBUDS
              </div>
              <span className="text-[11px] sm:text-xs text-[#64748B] font-medium tracking-normal font-bn leading-tight">
                ওয়্যারলেস ৪-ইন-১ ইয়ারবাডস
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#475569]">
            <button onClick={() => scrollToSection('benefits')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
              মূল সুবিধা
            </button>
            <button onClick={() => scrollToSection('gallery')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
              গ্যালারি
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
              ফিচার্স
            </button>
            <button onClick={() => scrollToSection('offer')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
              স্পেশাল অফার
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
              প্রশ্নোত্তর
            </button>
          </nav>

          {/* Header Action CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => scrollToSection('order-form')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0284C7] to-[#2563EB] text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-sky-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <LuShoppingBag size={17} />
              <span>এখনই অর্ডার করুন</span>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2.5 md:hidden">
            <button
              onClick={() => scrollToSection('order-form')}
              className="px-4 py-1.5 rounded-full bg-[#0284C7] text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              অর্ডার করুন
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#334155] hover:text-[#0F172A] transition-colors rounded-lg bg-slate-100/80 cursor-pointer"
              aria-label="মেনু খুলুন"
            >
              {mobileMenuOpen ? <HiXMark size={22} /> : <HiBars3 size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-b border-slate-200 px-5 py-5 space-y-3 backdrop-blur-2xl shadow-xl">
            <button onClick={() => scrollToSection('benefits')} className="block w-full text-left py-2 text-base font-semibold text-[#334155] hover:text-[#0284C7] border-b border-slate-100">
              মূল সুবিধা
            </button>
            <button onClick={() => scrollToSection('gallery')} className="block w-full text-left py-2 text-base font-semibold text-[#334155] hover:text-[#0284C7] border-b border-slate-100">
              প্রোডাক্ট গ্যালারি
            </button>
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-base font-semibold text-[#334155] hover:text-[#0284C7] border-b border-slate-100">
              ফিচার্স
            </button>
            <button onClick={() => scrollToSection('offer')} className="block w-full text-left py-2 text-base font-semibold text-[#334155] hover:text-[#0284C7] border-b border-slate-100">
              স্পেশাল অফার
            </button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-base font-semibold text-[#334155] hover:text-[#0284C7]">
              প্রশ্নোত্তর
            </button>
          </div>
        )}
      </header>


      {/* ==================================================
          HERO SECTION
          ================================================== */}
      <section id="hero" className="relative pt-6 pb-14 md:pt-14 md:pb-24 overflow-hidden">
        {/* Light ambient subtle orbs */}
        <div className="hidden lg:block absolute -top-10 -right-10 w-72 h-72 eclipse-orb opacity-60 z-0" />
        <div className="hidden lg:block absolute bottom-0 left-10 w-80 h-80 eclipse-orb opacity-40 z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Hero Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">

              {/* Top Tag / Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 w-fit mb-4 md:mb-6 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
                <span className="text-xs uppercase tracking-wider text-[#0284C7] font-bold">
                  সীমিত স্টক • ১ কেসে ২ জোড়া (৪টি) ইয়ারবাড
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] xl:text-[2.85rem] font-bold tracking-tight text-[#0F172A] leading-[1.3] mb-4 md:mb-5 font-bn">
                এক কেসে ৪টি ইয়ারবাড! <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#2563EB] bg-clip-text text-transparent">
                  দুই মোবাইলেও একসাথে ব্যবহারের সুবিধা।
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-[#475569] leading-relaxed mb-6 font-normal">
                অত্যাধুনিক প্রযুক্তি এবং উদ্ভাবনী ডিজাইনের এক অপূর্ব সমন্বয়ে একটি মাত্র চার্জিং কেসে পাচ্ছেন সম্পূর্ণ ২ জোড়া ইয়ারবাড।
              </p>

              {/* Price / Offer Display */}
              <div className="flex flex-wrap items-baseline gap-3 sm:gap-4 mb-6">
                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0284C7] font-num tracking-tight">
                  ৳ ১,০৯০
                </span>
                <span className="text-xl sm:text-2xl text-[#94A3B8] line-through font-num font-semibold">
                  ৳ ১,৪৯০
                </span>
                <span className="text-base sm:text-lg md:text-xl font-extrabold text-emerald-600 flex items-center gap-1.5 tracking-tight animate-pulse">
                  <LuTruck size={22} className="text-emerald-500 shrink-0" />
                  <span>ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-6 max-w-xl">
                <button
                  onClick={() => scrollToSection('order-form')}
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#2563EB] text-white font-extrabold text-base sm:text-lg shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <LuShoppingBag size={21} />
                  <span>অর্ডার করতে চাই</span>
                </button>
                <a
                  href="https://wa.me/8801746867350?text=Hello%2C%20I%20want%20to%20order%20J40%20V5.4%20Wireless%204-in-1%20Earbuds"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-base sm:text-lg shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
                >
                  <FaWhatsapp size={22} />
                  <span>হোয়াটসঅ্যাপে মেসেজ দিন</span>
                </a>
              </div>

              {/* Supporting Points / Trust Badges */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#475569] font-medium">
                <span className="flex items-center gap-1.5 sm:gap-2 text-[#0284C7] font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                  <LuHeadphones size={16} /> ২ জোড়া (৪টি) ইয়ারবাড
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <LuBluetooth className="text-[#0284C7]" size={16} /> Bluetooth 5.4
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <LuBatteryCharging className="text-[#0284C7]" size={16} /> স্মার্ট LED ডিসপ্লে
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <LuDroplets className="text-[#0284C7]" size={16} /> IPX5 ওয়াটারপ্রুফ
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-[#64748B]">
                <LuTruck className="text-[#0284C7]" size={16} />
                <span>সারা বাংলাদেশে ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-5 relative flex justify-center items-center mt-2 lg:mt-0">
              <div className="relative w-full max-w-md lg:max-w-none rounded-3xl p-3 sm:p-4 bg-white border border-slate-200 shadow-xl group z-10">
                <img
                  src={heroEarbudsImg}
                  alt="J40 V5.4 Wireless 4-in-1 Earbuds - 2 Pairs 4 Earbuds in 1 Case"
                  className="w-full h-auto object-cover max-h-[380px] sm:max-h-[440px] md:max-h-[480px] rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="eager"
                />

                {/* Floating Feature Tags at Bottom */}
                <div className="absolute -bottom-3 left-2.5 sm:left-6 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white border border-sky-200 shadow-lg flex items-center gap-1.5 sm:gap-2 z-20">
                  <LuHeadphones size={16} className="text-[#0284C7] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold text-[#0F172A]">২ জোড়া ইয়ারবাড</span>
                </div>
                <div className="absolute -bottom-3 right-2.5 sm:right-6 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white border border-sky-200 shadow-lg flex items-center gap-1.5 sm:gap-2 z-20">
                  <LuActivity size={16} className="text-[#0284C7] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold text-[#0284C7]">LED ডিসপ্লে & ENC</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>




      {/* ==================================================
          PRODUCT INTRO & 4 CORE BENEFITS (4 Cards Grid)
          ================================================== */}
      <section id="benefits" className="py-12 md:py-16 border-t border-slate-200/80 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="mb-6 md:mb-8 text-center max-w-3xl mx-auto">
            <span className="text-xs tracking-widest text-[#0284C7] uppercase font-bold block mb-3 sm:mb-3.5">
              প্রোডাক্ট পরিচিতি
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight mb-3">
              এক কেসে ২ জোড়া ইয়ারবাডের স্বাধীনতা
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#475569] leading-relaxed font-normal">
              J40 V5.4-এর অভিনব চার্জিং কেসে পাচ্ছেন সম্পূর্ণ দুই জোড়া ইয়ারবাড। চাইলে দুজন আলাদা ডিভাইসে কিংবা একজন চার্জ ফুরিয়ে যাওয়ার চিন্তা ছাড়াই একটানা ব্যাকআপ হিসেবে ব্যবহার করতে পারবেন।
            </p>
            <div className="small-design-line" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {/* Card 01 */}
            <div className="p-6 sm:p-7 rounded-2xl light-card flex flex-col justify-start group hover:border-sky-300">
              <div className="font-num text-4xl sm:text-5xl font-black text-sky-200 group-hover:text-[#0284C7] transition-colors mb-3">
                ০১
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2">
                স্মার্ট টাচ কন্ট্রোল
              </h3>
              <p className="text-[#475569] text-xs sm:text-sm leading-relaxed font-normal">
                মিউজিক প্লে/পজ, গান পরিবর্তন ও কল রিসিভের জন্য ইয়ারবাডগুলোর ব্যাকপ্যানেলে রয়েছে অত্যন্ত রেসপন্সিভ টাচ সেন্সর।
              </p>
            </div>

            {/* Card 02 */}
            <div className="p-6 sm:p-7 rounded-2xl light-card flex flex-col justify-start group hover:border-cyan-300">
              <div className="font-num text-4xl sm:text-5xl font-black text-cyan-200 group-hover:text-cyan-600 transition-colors mb-3">
                ০২
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2">
                ডুয়াল কানেক্টিভিটি
              </h3>
              <p className="text-[#475569] text-xs sm:text-sm leading-relaxed font-normal">
                চাইলে দুজন মানুষ আলাদা ২টি স্মার্টফোনে ২ জোড়া স্বাধীনভাবে ব্যবহার করতে পারবেন, অথবা ১ জোড়া চার্জে রেখে অন্য জোড়া ননস্টপ চালাতে পারবেন।
              </p>
            </div>

            {/* Card 03 */}
            <div className="p-6 sm:p-7 rounded-2xl light-card flex flex-col justify-start group hover:border-blue-300">
              <div className="font-num text-4xl sm:text-5xl font-black text-blue-200 group-hover:text-blue-600 transition-colors mb-3">
                ০৩
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2">
                স্মার্ট LED ডিসপ্লে
              </h3>
              <p className="text-[#475569] text-xs sm:text-sm leading-relaxed font-normal">
                কেসের মাঝের ডিজিটাল স্ক্রিনে মোট ব্যাটারি পার্সেন্টেজ (১০০%) এবং ওপর ও নিচের প্রতিটি ইয়ারবাডের লাইভ চার্জিং স্ট্যাটাস দেখা যায়।
              </p>
            </div>

            {/* Card 04 */}
            <div className="p-6 sm:p-7 rounded-2xl light-card flex flex-col justify-start group hover:border-indigo-300">
              <div className="font-num text-4xl sm:text-5xl font-black text-indigo-200 group-hover:text-indigo-500 transition-colors mb-3">
                ০৪
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2">
                হাই-ফাই সাউন্ড ও ENC
              </h3>
              <p className="text-[#475569] text-xs sm:text-sm leading-relaxed font-normal">
                Bluetooth 5.4, প্রিমিয়াম হাই-ফাই মিউজিক কোয়ালিটি এবং কথা বলার সময় বাইরের নয়েজ কমানোর জন্য রয়েছে ENC ক্লিয়ার কলিং প্রযুক্তি।
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ==================================================
          PRODUCT GALLERY (4 Image Showcase with Lightbox)
          ================================================== */}
      <section id="gallery" className="py-12 md:py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <span className="text-xs tracking-widest text-[#0284C7] uppercase font-bold block mb-3 sm:mb-3.5">
              ছবিসমূহ
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A] mb-2">
              প্রোডাক্ট গ্যালারি
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#475569]">
              বড় করে দেখতে যেকোনো ছবির ওপর ক্লিক করুন
            </p>
            <div className="small-design-line" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                src: multipleDeviceImg,
                title: 'ডুয়াল কানেক্টিভিটি — ২টি স্মার্টফোনে একসাথে ২ জোড়া স্বাধীন কানেকশন',
                badge: 'ডুয়াল ফোন কানেকশন'
              },
              {
                src: heroEarbudsImg,
                title: 'দ্বিমুখী চার্জিং কেস — ওপর ও নিচ মিলিয়ে মোট ৪টি ইয়ারবাড',
                badge: '৪-ইন-১ চার্জিং কেস'
              },
              {
                src: j40EarbudsImg,
                title: 'স্মার্ট LED ব্যাটারি পার্সেন্টেজ ডিসপ্লে ও হাই-ফাই সাউন্ড',
                badge: 'স্মার্ট LED ডিসপ্লে'
              }
            ].map((item, index) => (
              <div
                key={index}
                onClick={() => setPreviewImage(item)}
                className="group relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-slate-50 border border-slate-200 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-square w-full rounded-xl sm:rounded-2xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center p-2 mb-2 sm:mb-3 relative">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-contain rounded-lg sm:rounded-xl transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg sm:rounded-xl">
                    <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/95 text-[#0284C7] font-bold text-[10px] sm:text-xs shadow-md flex items-center gap-1 sm:gap-1.5">
                      <LuEye size={13} /> বড় করে দেখুন
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5 px-0.5 sm:px-1">
                  <span className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                    {item.badge}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#0284C7] font-semibold shrink-0">
                    ভিউ 🔍
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ==================================================
          FEATURE SECTION (6 Features - Title Only / Badges)
          ================================================== */}
      <section id="features" className="py-10 md:py-14 border-t border-slate-200/80 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <span className="text-xs tracking-widest text-[#0284C7] uppercase font-bold block mb-3 sm:mb-3.5">
              প্রিমিয়াম ফিচারসমূহ
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              কেন J40 Earbuds?
            </h2>
            <div className="small-design-line" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-4">
            {/* Feature 01 */}
            <div className="p-3.5 sm:p-5 rounded-2xl light-card text-center flex flex-col items-center justify-center group hover:border-sky-300">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-sky-50 text-[#0284C7] flex items-center justify-center mb-2.5 sm:mb-3 border border-sky-100 group-hover:scale-110 transition-transform">
                <LuHeadphones size={22} className="sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#0F172A] leading-snug">
                দ্বিমুখী চার্জিং কেস
              </h3>
            </div>

            {/* Feature 02 */}
            <div className="p-3.5 sm:p-5 rounded-2xl light-card text-center flex flex-col items-center justify-center group hover:border-purple-300">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mb-2.5 sm:mb-3 border border-purple-100 group-hover:scale-110 transition-transform">
                <LuSparkles size={22} className="sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#0F172A] leading-snug">
                ডুয়াল কানেক্টিভিটি
              </h3>
            </div>

            {/* Feature 03 */}
            <div className="p-3.5 sm:p-5 rounded-2xl light-card text-center flex flex-col items-center justify-center group hover:border-indigo-300">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mb-2.5 sm:mb-3 border border-indigo-100 group-hover:scale-110 transition-transform">
                <LuBatteryCharging size={22} className="sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#0F172A] leading-snug">
                স্মার্ট LED ডিসপ্লে
              </h3>
            </div>

            {/* Feature 04 */}
            <div className="p-3.5 sm:p-5 rounded-2xl light-card text-center flex flex-col items-center justify-center group hover:border-emerald-300">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-2.5 sm:mb-3 border border-emerald-100 group-hover:scale-110 transition-transform">
                <LuBluetooth size={22} className="sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#0F172A] leading-snug">
                Bluetooth 5.4
              </h3>
            </div>

            {/* Feature 05 */}
            <div className="p-3.5 sm:p-5 rounded-2xl light-card text-center flex flex-col items-center justify-center group hover:border-amber-300">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 text-[#D97706] flex items-center justify-center mb-2.5 sm:mb-3 border border-amber-100 group-hover:scale-110 transition-transform">
                <LuActivity size={22} className="sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#0F172A] leading-snug">
                স্মার্ট টাচ কন্ট্রোল
              </h3>
            </div>

            {/* Feature 06 */}
            <div className="p-3.5 sm:p-5 rounded-2xl light-card text-center flex flex-col items-center justify-center group hover:border-cyan-300">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-cyan-50 text-[#0891B2] flex items-center justify-center mb-2.5 sm:mb-3 border border-cyan-100 group-hover:scale-110 transition-transform">
                <LuDroplets size={22} className="sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#0F172A] leading-snug">
                IPX5 ও ENC সুবিধা
              </h3>
            </div>
          </div>

        </div>
      </section>





      {/* ==================================================
          OFFER SECTION & USAGE STORY & DELIVERY PACKAGE
          ================================================== */}
      <section id="offer" className="py-10 md:py-14 bg-[#F8FAFC] border-t border-slate-200/80 scroll-mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Card Box */}
          <div className="p-6 sm:p-10 md:p-12 rounded-3xl light-card border-sky-200 shadow-xl relative overflow-hidden bg-white">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left Side: Offer Story + Design / Usage Details + CTA */}
              <div className="lg:col-span-7 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-300 text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-4 sm:mb-4.5">
                  <LuHeadphones size={14} />
                  <span>আপনার পছন্দ, আপনার স্টাইল</span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] mb-3 tracking-tight leading-snug">
                  এক কেসে ২ জোড়া—ব্যবহারের সীমাহীন স্বাধীনতা
                </h3>

                <p className="text-sm sm:text-base md:text-lg text-[#475569] max-w-xl mx-auto lg:mx-0 mb-4 leading-relaxed font-normal">
                  চাইলে দুজন আলাদা ফোনে চালান কিংবা একটানা আনলিমিটেড ব্যাকআপ উপভোগ করুন।
                </p>

                {/* Dual Connectivity Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-xs sm:text-sm text-[#0284C7] block mb-1">শেয়ারিং মোড (Dual Connect)</span>
                    <p className="text-xs text-[#475569] leading-relaxed">দুজন মানুষ আলাদা দুটি ফোনে ২ জোড়া ইয়ারবাড সম্পূর্ণ স্বাধীনভাবে কানেক্ট করে ব্যবহার করতে পারবেন।</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-xs sm:text-sm text-[#0284C7] block mb-1">নন-স্টপ ব্যাকআপ মোড</span>
                    <p className="text-xs text-[#475569] leading-relaxed">এক জোড়া ব্যবহারের সময় অন্য জোড়া কেসে চার্জে থাকবে—ফলে চার্জ ফুরিয়ে যাওয়ার কোনো চিন্তাই থাকছে না।</p>
                  </div>
                </div>

                {/* Action CTA */}
                <div>
                  <button
                    onClick={() => scrollToSection('order-form')}
                    className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#2563EB] text-white font-extrabold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <LuShoppingBag size={21} />
                    <span>এখনই অর্ডার করুন</span>
                  </button>
                  <p className="text-xs text-[#64748B] mt-2.5">
                    সারা বাংলাদেশে ক্যাশ অন ডেলিভারি
                  </p>
                </div>
              </div>

              {/* Right Side: Delivery Package List Box */}
              <div className="lg:col-span-5">
                <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 border-2 border-sky-200 shadow-md flex flex-col justify-between text-left">

                  {/* Header */}
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0284C7] flex items-center justify-center shrink-0">
                      <LuPackageCheck size={22} />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-[#0F172A]">
                        ডেলিভারিতে যা যা পাচ্ছেনঃ
                      </h4>
                      <p className="text-xs text-[#64748B]">অরিজিনাল কমপ্লিট বক্স প্যাকেজ</p>
                    </div>
                  </div>

                  {/* List Items */}
                  <ul className="space-y-3 mb-5">
                    <li className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <LuCircleCheck className="text-[#0284C7] shrink-0" size={19} />
                      <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                        J40 V5.4 ইয়ারবাডস (৪টি ইয়ারবাড + কেস)
                      </span>
                    </li>
                    <li className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <LuCircleCheck className="text-[#0284C7] shrink-0" size={19} />
                      <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                        Type-C ফাস্ট চার্জিং কেবল
                      </span>
                    </li>
                    <li className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <LuCircleCheck className="text-[#0284C7] shrink-0" size={19} />
                      <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                        অরিজিনাল অফিশিয়াল বক্স প্যাকেজিং
                      </span>
                    </li>
                    <li className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <LuCircleCheck className="text-[#0284C7] shrink-0" size={19} />
                      <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                        নিরাপদ বাবল র‍্যাপ ডেলিভারি
                      </span>
                    </li>
                  </ul>

                  {/* Note box */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs sm:text-sm text-emerald-800 font-bold flex items-center justify-center gap-2">
                    <LuShieldCheck size={17} className="text-emerald-600 shrink-0" />
                    <span>note: পণ্য হাতে পেয়ে চেক করে টাকা দিবেন</span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* ==================================================
          ORDER FORM SECTION
          ================================================== */}
      <section id="order-form" className="py-10 sm:py-16 md:py-24 border-t border-slate-200/80 bg-white scroll-mt-10 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center mb-6 sm:mb-10">
            <span className="text-[11px] sm:text-xs tracking-widest text-[#0284C7] uppercase font-bold block mb-2 sm:mb-3.5">
              সহজ ও দ্রুত অর্ডার
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] mb-1.5 sm:mb-2 tracking-tight">
              আপনার ইয়ারবাডস অর্ডার করুন
            </h2>
            <p className="text-xs sm:text-base text-[#475569] font-normal max-w-lg mx-auto">
              ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করবেন
            </p>
            <div className="small-design-line my-3 sm:my-4" />
          </div>

          <div className="p-3.5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 shadow-lg sm:shadow-xl">
            <form onSubmit={handleOrderSubmit} className="space-y-4 sm:space-y-6">

              {/* Name Field */}
              <div>
                <label htmlFor="form-input-name" className="block text-xs sm:text-sm font-bold text-[#0F172A] mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                  <LuUser className="text-[#0284C7]" size={16} />
                  <span>আপনার নাম</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-input-name"
                  type="text"
                  placeholder="আপনার পুরো নাম লিখুন"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 sm:py-3.5 rounded-xl bg-white border ${formErrors.name
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100'
                    } text-[#0F172A] placeholder-slate-400 outline-none transition-all text-sm sm:text-base font-bn`}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 font-medium mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="form-input-phone" className="block text-xs sm:text-sm font-bold text-[#0F172A] mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                  <LuPhone className="text-[#0284C7]" size={16} />
                  <span>মোবাইল নম্বর</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-input-phone"
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  className={`w-full px-3.5 py-2.5 sm:py-3.5 rounded-xl bg-white border ${formErrors.phone
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100'
                    } text-[#0F172A] placeholder-slate-400 outline-none transition-all text-sm sm:text-base font-en`}
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-500 font-medium mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Address Field */}
              <div>
                <label htmlFor="form-input-address" className="block text-xs sm:text-sm font-bold text-[#0F172A] mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                  <LuMapPin className="text-[#0284C7]" size={16} />
                  <span>সম্পূর্ণ ডেলিভারি ঠিকানা</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="form-input-address"
                  rows={2}
                  placeholder="বাসা নং, রোড নং, এলাকা/গ্রাম, থানা ও জেলা উল্লেখ করুন"
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  className={`w-full px-3.5 py-2.5 sm:py-3.5 rounded-xl bg-white border ${formErrors.address
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100'
                    } text-[#0F172A] placeholder-slate-400 outline-none transition-all text-sm sm:text-base resize-none font-bn`}
                />
                {formErrors.address && (
                  <p className="text-xs text-red-500 font-medium mt-1">{formErrors.address}</p>
                )}
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#0F172A] mb-2 flex items-center gap-1.5 sm:gap-2">
                  <LuShoppingBag className="text-[#0284C7]" size={16} />
                  <span>পরিমাণ নির্বাচন করুন</span>
                </label>
                <div className="flex items-center justify-between gap-3 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-slate-200 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setOrderForm({ ...orderForm, quantity: Math.max(1, orderForm.quantity - 1) })}
                      disabled={orderForm.quantity <= 1}
                      className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-white hover:bg-sky-100 text-[#0284C7] disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-2xs"
                      aria-label="পরিমাণ কমান"
                    >
                      <LuMinus size={16} />
                    </button>
                    <div className="w-10 sm:w-12 text-center">
                      <span className="font-num text-lg sm:text-xl font-extrabold text-[#0F172A]">
                        {orderForm.quantity.toLocaleString('bn-BD')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrderForm({ ...orderForm, quantity: orderForm.quantity + 1 })}
                      className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-white hover:bg-sky-100 text-[#0284C7] transition-all cursor-pointer active:scale-95 shadow-2xs"
                      aria-label="পরিমাণ বাড়ান"
                    >
                      <LuPlus size={16} />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] sm:text-xs text-[#64748B] font-medium">প্রোডাক্ট মূল্য</div>
                    <div className="font-num text-base sm:text-lg font-black text-[#0284C7]">
                      ৳ {subtotal.toLocaleString('bn-BD')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Order Bill Breakdown */}
              <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-[#475569]">
                  <span>ইয়ারবাডস মূল্য ({orderForm.quantity.toLocaleString('bn-BD')} টি)</span>
                  <div className="flex items-center gap-1.5 sm:gap-2 font-num">
                    <span className="text-[#0F172A] font-bold">৳ {subtotal.toLocaleString('bn-BD')}</span>
                    <span className="text-[10px] sm:text-xs text-[#94A3B8] line-through font-semibold">
                      ৳ {(orderForm.quantity * regularPrice).toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[#475569]">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-xs sm:text-sm">সম্পূর্ণ ফ্রি (৳ ০)</span>
                </div>

                <div className="flex justify-between text-sm sm:text-lg font-black text-[#0F172A] pt-2 sm:pt-2.5 border-t border-slate-200">
                  <span>সর্বমোট বিল</span>
                  <span className="font-num text-lg sm:text-2xl text-[#0284C7]">
                    ৳ {totalAmount.toLocaleString('bn-BD')}
                  </span>
                </div>

                <div className="text-[10px] sm:text-[11px] text-[#64748B] text-center pt-0.5 sm:pt-1">
                  পণ্য হাতে পেয়ে ডেলিভারিম্যানের কাছে সম্পূর্ণ টাকা পরিশোধ করবেন (ক্যাশ অন ডেলিভারি)
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 sm:gap-2.5 w-full py-3.5 sm:py-4 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#2563EB] text-white font-extrabold text-base sm:text-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>অর্ডার প্রক্রিয়াকরণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <LuShoppingBag size={20} className="shrink-0" />
                    <span className="flex items-center justify-center gap-1.5 sm:gap-2 text-center">
                      <span>অর্ডার কনফার্ম করুন</span>
                      <span className="font-num font-black text-sky-100">
                        ৳ {totalAmount.toLocaleString('bn-BD')}
                      </span>
                    </span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      </section>


      {/* ==================================================
          FAQ SECTION
          ================================================== */}
      <section id="faq" className="py-12 md:py-16 border-t border-slate-200/80 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-8 sm:mb-12">
            <span className="text-xs tracking-widest text-[#0284C7] uppercase font-bold block mb-3 sm:mb-3.5">
              সচরাচর প্রশ্নাবলী
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              সচরাচর জিজ্ঞাসিত প্রশ্নাবলী
            </h2>
            <div className="small-design-line" />
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl light-card overflow-hidden transition-colors hover:border-sky-300 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-base sm:text-lg text-[#0F172A]">
                    {item.q}
                  </span>
                  <LuChevronDown
                    className={`text-[#0284C7] shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''
                      }`}
                    size={20}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-4 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-base text-[#475569] leading-relaxed border-t border-slate-100 pt-3 sm:pt-4 font-normal">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ==================================================
          FINAL CTA SECTION
          ================================================== */}
      <section className="py-14 md:py-20 text-center relative overflow-hidden bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0F172A] leading-tight mb-4">
            এক কেসে ২ জোড়া ইয়ারবাডস— <br className="hidden sm:inline" />
            <span className="text-[#0284C7]">আপনার মিউজিক এক্সপেরিয়েন্স হোক আনলিমিটেড</span>
          </h2>
          <p className="text-base sm:text-lg text-[#475569] max-w-xl mx-auto mb-6 font-normal">
            J40 V5.4 ফোর-ইন-ওয়ান ওয়্যারলেস ইয়ারবাডস দিয়ে উপভোগ করুন প্রিমিয়াম সাউন্ড ও পাওয়ারফুল পারফরম্যান্স।
          </p>
          <div className="small-design-line" />
          <button
            onClick={() => scrollToSection('order-form')}
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#2563EB] text-white font-extrabold text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <LuShoppingBag size={22} />
            <span>এখনই অর্ডার করুন</span>
          </button>
        </div>
      </section>


      {/* ==================================================
          FOOTER
          ================================================== */}
      <footer className="py-12 border-t border-slate-200 text-xs text-[#64748B] bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-en text-base font-extrabold text-[#0F172A] tracking-wider mb-0.5">
                J40 EARBUDS
              </div>
              <p className="text-xs text-[#64748B] font-bn font-medium">ওয়্যারলেস ৪-ইন-১ ইয়ারবাডস</p>
            </div>

            <a
              href="https://wa.me/8801746867350?text=Hello%2C%20I%20want%20to%20know%20about%20J40%20Wireless%204-in-1%20Earbuds"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
            >
              <FaWhatsapp size={19} />
              <span className="text-sm font-bold font-en">+8801746867350</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 sm:gap-6 text-sm text-[#475569]">
              <button onClick={() => scrollToSection('benefits')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
                মূল সুবিধা
              </button>
              <button onClick={() => scrollToSection('gallery')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
                গ্যালারি
              </button>
              <button onClick={() => scrollToSection('features')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
                ফিচার্স
              </button>
              <button onClick={() => scrollToSection('offer')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
                স্পেশাল অফার
              </button>
              <button onClick={() => scrollToSection('order-form')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
                অর্ডার ফর্ম
              </button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-[#0284C7] transition-colors cursor-pointer">
                প্রশ্নোত্তর
              </button>
            </div>

            {/* Dedicated Footer Back to Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-50 hover:bg-[#0284C7] text-[#0284C7] hover:text-white border border-sky-200 hover:border-[#0284C7] transition-all font-bold text-xs sm:text-sm cursor-pointer shadow-xs hover:shadow-md group shrink-0"
              aria-label="পৃষ্ঠার উপরে ফিরে যান"
            >
              <LuArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
              <span>উপরে চলে যান</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#94A3B8] pt-4 border-t border-slate-200">
            <div>
              সরাসরি যোগাযোগ ও সহায়তা: <span className="font-en text-[#0F172A] font-semibold">+8801746867350</span>
            </div>
            <div className="font-num">
              © 2026 সকল স্বত্ব সংরক্ষিত।
            </div>
          </div>

        </div>
      </footer>


      {/* ==================================================
          MOBILE FLOATING PURCHASE BAR
          ================================================== */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-xl px-4 py-3 safe-bottom shadow-[0_-8px_25px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out ${showMobileFloatingBar
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 block">ডেলিভারি চার্জ ফ্রি</span>
            <span className="font-num text-xl font-black text-[#0284C7]">৳ ১,০৯০</span>
          </div>
          <button
            onClick={() => scrollToSection('order-form')}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#2563EB] text-white font-bold text-sm text-center shadow-md active:scale-[0.98] transition-transform cursor-pointer"
          >
            এখনই অর্ডার করুন
          </button>
        </div>
      </div>


      {/* ==================================================
          IMAGE LIGHTBOX MODAL (Click to enlarge)
          ================================================== */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 cursor-default"
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              aria-label="বন্ধ করুন"
            >
              <HiXMark size={22} />
            </button>

            {/* Enlarge Image */}
            <div className="w-full max-h-[68vh] sm:max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden bg-slate-50 p-2 sm:p-4">
              <img
                src={previewImage.src}
                alt={previewImage.title}
                className="max-w-full max-h-[62vh] sm:max-h-[70vh] object-contain rounded-xl shadow-xs"
              />
            </div>

            {/* Caption */}
            <div className="mt-3 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-[#0284C7] font-bold text-xs mb-1">
                {previewImage.badge}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-[#0F172A]">
                {previewImage.title}
              </h4>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
