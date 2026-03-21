import React, { useState, useEffect, type ReactNode, useRef, type FormEvent } from 'react';
import { 
  Users, 
  Mail, 
  FileText, 
  LayoutDashboard, 
  Search, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Building2,
  Copy,
  Download,
  Printer,
  DollarSign,
  ShieldCheck,
  Menu,
  X,
  Home,
  LogOut,
  LogIn,
  Info,
  MessageSquare,
  Trash2,
  Edit2,
  ExternalLink,
  Languages,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { TARGET_COMPANIES, OUTREACH_TEMPLATES, type Company, type OutreachTemplate } from './constants';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  isAdmin as checkAdmin,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  type User
} from './firebase';
import * as XLSX from 'xlsx';

type Tab = 'dashboard' | 'companies' | 'outreach' | 'contract' | 'pricing' | 'about' | 'contact' | 'inquiries';
type Lang = 'ko' | 'en';

const translations = {
  ko: {
    about: "회사소개",
    pricing: "서비스 단가",
    contact: "문의하기",
    dashboard: "대시보드",
    companies: "타겟 기업",
    outreach: "아웃리치 템플릿",
    contract: "계약서 양식",
    inquiries: "고객 문의",
    login: "관리자 로그인",
    logout: "로그아웃",
    adminMenu: "관리자 메뉴",
    proTip: "전문가 팁",
    welcome: "반갑습니다, 트러스톤에 방문을 환영합니다!",
    search: "기업 또는 산업 검색...",
    add_target: "타겟 추가",
    about_title: "단 한 명을 뽑아도 제대로,",
    about_subtitle: "인재 밀도가 기업의 운명을 바꿉니다.",
    about_desc: "2026년 맞춤형 인재 솔루션, 트러스톤(TrusTone)이 함께합니다.",
    feature1_title: "고급인력 헤드헌팅",
    feature1_desc: "단순 매칭을 넘어선 '정밀 채용' 전략. AI 리터러시와 컬처 애드 역량을 정밀 검증합니다.",
    feature2_title: "현장노동 인력공급",
    feature2_desc: "건설·물류·제조 현장에 '검증된 숙련공'을 적기 배치합니다. 기업의 생산성을 높이는 팀핏 중심 인력 구성을 지원합니다.",
    diff_title: "트러스톤만의 차별화 포인트",
    diff1_title: "구직자 수수료 ZERO",
    diff1_desc: "노동자에게는 어떠한 비용도 받지 않는 공정 채용 원칙을 준수합니다.",
    diff2_title: "경험 검증 리포트",
    diff2_desc: "후보자의 실질적 성과와 평판을 데이터로 증명하는 Verified Experience.",
    diff3_title: "전문가 전담제",
    diff3_desc: "1인 기업 대표가 모든 프로젝트를 직접 책임지고 완수하는 고밀도 컨설팅.",
    footer_desc: "트러스톤은 사람과 기업의 신뢰(Trust)를 연결하는 톤(Tone)을 만듭니다.",
    footer_contact: "상담 문의: 010-7323-7001",
    contact_success: "문의가 접수되었습니다.",
    contact_success_desc: "빠른 시일 내에 담당자가 연락드리겠습니다. 감사합니다.",
    contact_new: "새 문의 작성하기",
    pricing_title: "합리적인 채용 솔루션",
    pricing_desc: "기업의 규모와 채용 난이도에 최적화된 유연한 단가 정책을 제안합니다.",
    address: "인천광역시 서구 염곡로 343-5, 1층 103호(신현동) 트러스톤 대표이사 : 문선심 (Mind Moon)",
    license: "유료직업소개사업등록번호 : 제 2026-3560286-14-5-00003 호",
    biz_num: "사업자등록번호 : 426-95-01866",
    copyright: "2026. TRUSTON All rights reserved.",
    tagline: "Talent Density Partners",
    proTipContent: "인재 밀도(TD) 전략을 강조할 때 고객사의 리텐션 비용 절감을 함께 언급하세요.",
    name: "성함",
    email: "이메일",
    phone: "연락처",
    iam: "저는...",
    client: "구인 회사 (Client)",
    jobSeeker: "구직자 (Job Seeker)",
    other: "기타 문의",
    message: "문의 내용",
    submit: "문의 제출하기",
    fee_schedule: "공식 수수료 안내",
    fee_effective: "2026년 4월 1일 시행 | 고용노동부 고시 준수",
    guarantee_title: "트러스톤 책임 보증",
    guarantee_desc: "입사 후 90일간 책임 보증 서비스를 제공합니다. 단순 인력 공급이 아닌 프로젝트 성공 확률을 높이는 파트너가 되겠습니다.",
    days: "Days",
    guarantee_period: "Full Guarantee Period",
    annual_salary: "of Annual Salary"
  },
  en: {
    about: "About",
    pricing: "Pricing",
    contact: "Contact",
    dashboard: "Dashboard",
    companies: "Target Companies",
    outreach: "Outreach Templates",
    contract: "Contract Forms",
    inquiries: "Inquiries",
    login: "Admin Login",
    logout: "Logout",
    adminMenu: "Admin Menu",
    proTip: "Pro Tip",
    welcome: "Welcome back, Truston Admin.",
    search: "Search companies or industries...",
    add_target: "Add Target",
    about_title: "Hire the Right One,",
    about_subtitle: "Talent Density Changes Destiny.",
    about_desc: "2026 Customized Talent Solutions, TrusTone is with you.",
    feature1_title: "Executive Search",
    feature1_desc: "Targeted Hiring strategy beyond simple matching. We verify AI literacy and Culture-add capabilities.",
    feature2_title: "Labor Supply",
    feature2_desc: "Timely placement of 'verified skilled workers' in construction, logistics, and manufacturing sites.",
    diff_title: "TrusTone's Differentiation",
    diff1_title: "ZERO Candidate Fee",
    diff1_desc: "We adhere to fair recruitment principles, charging no costs to workers.",
    diff2_title: "Experience Report",
    diff2_desc: "Verified Experience (VE) proving candidate's performance and reputation with data.",
    diff3_title: "Expert Dedicated",
    diff3_desc: "High-density consulting where the CEO directly manages and completes every project.",
    footer_desc: "TrusTone creates the Tone that connects the Trust between people and companies.",
    footer_contact: "Contact: +82 10-7323-7001",
    contact_success: "Inquiry Submitted.",
    contact_success_desc: "A representative will contact you shortly. Thank you.",
    contact_new: "Write New Inquiry",
    pricing_title: "Reasonable Solutions",
    pricing_desc: "We propose flexible pricing policies optimized for company size and hiring difficulty.",
    address: "103, 1F, 343-5, Yeomgok-ro, Seo-gu, Incheon, Korea | CEO: Sunshim Moon (Mind Moon)",
    license: "License: No. 2026-3560286-14-5-00003",
    biz_num: "Business Number: 426-95-01866",
    copyright: "2026. TRUSTON All rights reserved.",
    tagline: "Talent Density Partners",
    proTipContent: "When emphasizing Talent Density (TD) strategy, mention the reduction in client retention costs.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    iam: "I am a...",
    client: "Client Company",
    jobSeeker: "Job Seeker",
    other: "Other Inquiry",
    message: "Message",
    submit: "Submit Inquiry",
    fee_schedule: "Official Fee Schedule",
    fee_effective: "Effective April 1, 2026 | Compliance with Ministry of Employment and Labor",
    guarantee_title: "Truston Guarantee",
    guarantee_desc: "We provide a 90-day responsibility guarantee after joining. We will be a partner that increases project success probability.",
    days: "Days",
    guarantee_period: "Full Guarantee Period",
    annual_salary: "of Annual Salary"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [lang, setLang] = useState<Lang>('ko');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  // Real-time data states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(checkAdmin(user));
      setLoading(false);
      if (user && checkAdmin(user)) {
        setActiveTab('dashboard');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch data if admin
  useEffect(() => {
    if (!isAdmin) return;

    const unsubCompanies = onSnapshot(query(collection(db, 'targetCompanies'), orderBy('createdAt', 'desc')), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setCompanies(docs.length > 0 ? docs : TARGET_COMPANIES);
    });

    const unsubTemplates = onSnapshot(query(collection(db, 'outreachTemplates'), orderBy('createdAt', 'desc')), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setTemplates(docs.length > 0 ? docs : OUTREACH_TEMPLATES);
    });

    const unsubContracts = onSnapshot(query(collection(db, 'contractTemplates'), orderBy('createdAt', 'desc')), (snapshot) => {
      setContracts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });

    const unsubInquiries = onSnapshot(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')), (snapshot) => {
      setInquiries(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });

    return () => {
      unsubCompanies();
      unsubTemplates();
      unsubContracts();
      unsubInquiries();
    };
  }, [isAdmin]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('about');
  };

  const handleTabChange = (tab: Tab) => {
    if (!isAdmin && !['about', 'pricing', 'contact'].includes(tab)) {
      alert(lang === 'ko' ? "관리자만 접근 가능한 메뉴입니다. 로그인이 필요합니다." : "Admin access only. Login required.");
      return;
    }
    setActiveTab(tab);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'ko' ? 'en' : 'ko');
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => handleTabChange(isAdmin ? 'dashboard' : 'about')}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 relative">
            <img src="https://ais-dev-rra6jidrntm5d6xnbtohn3-607862644369.asia-east1.run.app/logo.jpg" alt="Truston Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <span className="font-bold tracking-tight">TRUSTON</span>
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleLang}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Languages size={18} />
            {lang === 'ko' ? 'EN' : 'KO'}
          </button>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <button 
                  onClick={() => handleTabChange(isAdmin ? 'dashboard' : 'about')}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 relative">
                    <img src="https://ais-dev-rra6jidrntm5d6xnbtohn3-607862644369.asia-east1.run.app/logo.jpg" alt="Truston Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">TRUSTON</h1>
                </button>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                <NavItem 
                  icon={<Info size={20} />} 
                  label={t.about} 
                  active={activeTab === 'about'} 
                  onClick={() => handleTabChange('about')} 
                />
                <NavItem 
                  icon={<DollarSign size={20} />} 
                  label={t.pricing} 
                  active={activeTab === 'pricing'} 
                  onClick={() => handleTabChange('pricing')} 
                />
                <NavItem 
                  icon={<MessageSquare size={20} />} 
                  label={t.contact} 
                  active={activeTab === 'contact'} 
                  onClick={() => handleTabChange('contact')} 
                />

                {isAdmin && (
                  <>
                    <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.adminMenu}</div>
                    <NavItem 
                      icon={<LayoutDashboard size={20} />} 
                      label={t.dashboard} 
                      active={activeTab === 'dashboard'} 
                      onClick={() => handleTabChange('dashboard')} 
                    />
                    <NavItem 
                      icon={<Building2 size={20} />} 
                      label={t.companies} 
                      active={activeTab === 'companies'} 
                      onClick={() => handleTabChange('companies')} 
                    />
                    <NavItem 
                      icon={<Mail size={20} />} 
                      label={t.outreach} 
                      active={activeTab === 'outreach'} 
                      onClick={() => handleTabChange('outreach')} 
                    />
                    <NavItem 
                      icon={<FileText size={20} />} 
                      label={t.contract} 
                      active={activeTab === 'contract'} 
                      onClick={() => handleTabChange('contract')} 
                    />
                  </>
                )}
              </nav>

              <div className="p-4 mt-auto">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-800 mb-1">{t.proTip}</p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    {t.proTipContent}
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => handleTabChange(isAdmin ? 'dashboard' : 'about')}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden border border-gray-100 relative">
                <img src="https://ais-dev-rra6jidrntm5d6xnbtohn3-607862644369.asia-east1.run.app/logo.jpg" alt="Truston Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">TRUSTON</h1>
            </button>
            <button 
              onClick={toggleLang}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
              title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
            >
              <Languages size={18} />
              {lang === 'ko' ? 'EN' : 'KO'}
            </button>
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t.tagline}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem 
            icon={<Info size={20} />} 
            label={t.about} 
            active={activeTab === 'about'} 
            onClick={() => handleTabChange('about')} 
          />
          <NavItem 
            icon={<DollarSign size={20} />} 
            label={t.pricing} 
            active={activeTab === 'pricing'} 
            onClick={() => handleTabChange('pricing')} 
          />
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label={t.contact} 
            active={activeTab === 'contact'} 
            onClick={() => handleTabChange('contact')} 
          />

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.adminMenu}</div>
              <NavItem 
                icon={<LayoutDashboard size={20} />} 
                label={t.dashboard} 
                active={activeTab === 'dashboard'} 
                onClick={() => handleTabChange('dashboard')} 
              />
              <NavItem 
                icon={<Building2 size={20} />} 
                label={t.companies} 
                active={activeTab === 'companies'} 
                onClick={() => handleTabChange('companies')} 
              />
              <NavItem 
                icon={<Mail size={20} />} 
                label={t.outreach} 
                active={activeTab === 'outreach'} 
                onClick={() => handleTabChange('outreach')} 
              />
              <NavItem 
                icon={<FileText size={20} />} 
                label={t.contract} 
                active={activeTab === 'contract'} 
                onClick={() => handleTabChange('contract')} 
              />
              <NavItem 
                icon={<MessageSquare size={20} />} 
                label={t.inquiries} 
                active={activeTab === 'inquiries'} 
                onClick={() => handleTabChange('inquiries')} 
              />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{user.displayName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
            >
              <LogIn size={18} />
              {t.login}
            </button>
          )}
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-800 mb-1">Pro Tip</p>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              인재 밀도(TD) 전략을 강조할 때 고객사의 리텐션 비용 절감을 함께 언급하세요.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen p-4 md:p-8 pt-20 lg:pt-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {activeTab !== 'dashboard' && (
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="lg:hidden p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  <Home size={18} />
                </button>
              )}
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 capitalize">{t[activeTab] || activeTab.replace('-', ' ')}</h2>
          </div>
          <p className="text-gray-500 text-xs md:text-sm">{t.welcome}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Search size={20} />
          </button>
          <button 
            onClick={() => handleTabChange('companies')}
            className="bg-emerald-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">{t.add_target}</span>
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${lang}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'about' && <AboutView t={t} />}
          {activeTab === 'contact' && <ContactView t={t} />}
          {activeTab === 'dashboard' && <DashboardView setActiveTab={handleTabChange} />}
          {activeTab === 'companies' && (
            <CompaniesView 
              companies={filteredCompanies} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              templates={templates}
              t={t}
            />
          )}
          {activeTab === 'outreach' && <OutreachView templates={templates} />}
          {activeTab === 'contract' && <ContractView contracts={contracts} />}
          {activeTab === 'pricing' && <PricingView t={t} />}
          {activeTab === 'inquiries' && <InquiriesView inquiries={inquiries} />}
        </motion.div>
      </AnimatePresence>
      <Footer t={t} />
    </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
        active 
          ? "bg-emerald-50 text-emerald-700" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <span className={cn("transition-colors", active ? "text-emerald-600" : "text-gray-400")}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function DashboardView({ setActiveTab }: { setActiveTab: (tab: Tab) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Target Companies" value="10" icon={<Building2 className="text-blue-600" />} trend="+2 this week" />
        <StatCard title="Outreach Sent" value="24" icon={<Mail className="text-emerald-600" />} trend="+12% from last month" />
        <StatCard title="Conversion Rate" value="15%" icon={<CheckCircle2 className="text-amber-600" />} trend="+2% from last month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <ActionButton 
              title="Send Proposal" 
              desc="Use TD Strategy templates" 
              icon={<Mail className="text-emerald-600" />} 
              onClick={() => setActiveTab('outreach')}
            />
            <ActionButton 
              title="Review Contract" 
              desc="Standard 90-day guarantee" 
              icon={<FileText className="text-blue-600" />} 
              onClick={() => setActiveTab('contract')}
            />
            <ActionButton 
              title="Pricing Table" 
              desc="Vertical fee structure" 
              icon={<DollarSign className="text-amber-600" />} 
              onClick={() => setActiveTab('pricing')}
            />
            <ActionButton 
              title="Add Target" 
              desc="New B2B opportunity" 
              icon={<Plus className="text-purple-600" />} 
              onClick={() => setActiveTab('companies')}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <ActivityItem icon={<CheckCircle2 size={16} />} title="Naver HRBP contacted" time="2 hours ago" />
            <ActivityItem icon={<Clock size={16} />} title="Proposal sent to Toss" time="5 hours ago" />
            <ActivityItem icon={<Users size={16} />} title="New candidate for Samsung" time="Yesterday" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">{trend}</span>
      </div>
      <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ActionButton({ title, desc, icon, onClick }: { title: string, desc: string, icon: ReactNode, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left group">
      <div className="mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h5 className="font-bold text-sm mb-1">{title}</h5>
      <p className="text-xs text-gray-500">{desc}</p>
    </button>
  );
}

function ActivityItem({ icon, title, time }: { icon: ReactNode, title: string, time: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

function CompaniesView({ companies, searchTerm, setSearchTerm, templates, t }: { companies: Company[], searchTerm: string, setSearchTerm: (s: string) => void, templates: OutreachTemplate[], t: any }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const exportToExcel = () => {
    const data = companies.filter(c => selectedIds.length === 0 || selectedIds.includes(c.id));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Target Companies");
    XLSX.writeFile(workbook, "Truston_Target_Companies.xlsx");
  };

  const sendBulkEmail = () => {
    const selected = companies.filter(c => selectedIds.includes(c.id));
    if (selected.length === 0) {
      alert(t.ko === 'ko' ? "이메일을 보낼 기업을 선택해주세요." : "Please select companies to email.");
      return;
    }
    
    const emails = selected.map(c => c.hrEmail).join(',');
    const template = templates.find(t => t.id === selectedTemplateId) || templates[0];
    if (!template) {
      alert(t.ko === 'ko' ? "사용 가능한 템플릿이 없습니다." : "No templates available.");
      return;
    }
    
    const lines = template.content.split('\n');
    const subjectLine = lines.find(l => l.startsWith('[Subject]')) || lines[0];
    const subject = encodeURIComponent(subjectLine.replace('[Subject] ', ''));
    const body = encodeURIComponent(lines.filter(l => !l.startsWith('[Subject]')).join('\n'));
    
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${emails}&su=${subject}&body=${body}&from=wise2moon@gmail.com`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={t.search} 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select 
            className="p-2 border rounded-lg text-xs bg-gray-50"
            value={selectedTemplateId}
            onChange={e => setSelectedTemplateId(e.target.value)}
          >
            {templates.filter(t => t.type === 'Email').map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <button 
            onClick={sendBulkEmail}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2"
          >
            <Mail size={16} />
            Email
          </button>
          <button 
            onClick={exportToExcel}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Excel
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  onChange={(e) => setSelectedIds(e.target.checked ? companies.map(c => c.id) : [])}
                  checked={selectedIds.length === companies.length && companies.length > 0}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">HR Email</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(company.id)}
                    onChange={() => toggleSelect(company.id)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      {company.name[0]}
                    </div>
                    <span className="font-bold text-gray-900">{company.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{company.industry}</td>
                <td className="px-6 py-4 text-sm text-emerald-600 font-medium">{company.hrEmail}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    company.status === 'Target' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {company.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-emerald-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OutreachView({ templates }: { templates: OutreachTemplate[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ title: '', type: 'Email', content: '' });

  const handleSave = async (id: string, content: string) => {
    const docRef = doc(db, 'outreachTemplates', id);
    await updateDoc(docRef, { content });
    setEditingId(null);
  };

  const handleAdd = async () => {
    await addDoc(collection(db, 'outreachTemplates'), {
      ...newTemplate,
      createdAt: Timestamp.now()
    });
    setNewTemplate({ title: '', type: 'Email', content: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, 'outreachTemplates', id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h4 className="font-bold mb-4 flex items-center gap-2"><Plus size={18} /> Add New Template</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Template Title" 
            className="p-2 border rounded-lg text-sm"
            value={newTemplate.title}
            onChange={e => setNewTemplate({...newTemplate, title: e.target.value})}
          />
          <select 
            className="p-2 border rounded-lg text-sm"
            value={newTemplate.type}
            onChange={e => setNewTemplate({...newTemplate, type: e.target.value as any})}
          >
            <option value="Email">Email</option>
            <option value="Call">Call</option>
          </select>
        </div>
        <textarea 
          placeholder="Content..." 
          className="w-full p-3 border rounded-lg text-sm h-32 mb-4"
          value={newTemplate.content}
          onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
        />
        <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add Template</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  template.type === 'Email' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                )}>
                  {template.type === 'Email' ? <Mail size={18} /> : <Users size={18} />}
                </div>
                <h4 className="font-bold text-gray-900">{template.title}</h4>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingId(template.id)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(template.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-6 flex-1">
              {editingId === template.id ? (
                <div className="space-y-4">
                  <textarea 
                    className="w-full p-3 border rounded-lg text-sm h-48"
                    defaultValue={template.content}
                    id={`edit-${template.id}`}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSave(template.id, (document.getElementById(`edit-${template.id}`) as HTMLTextAreaElement).value)}
                      className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                    >Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-200 px-3 py-1 rounded-lg text-xs font-bold">Cancel</button>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {template.content}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContractView({ contracts }: { contracts: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContract, setNewContract] = useState({ title: '', content: '' });

  const handleSave = async (id: string, content: string) => {
    const docRef = doc(db, 'contractTemplates', id);
    await updateDoc(docRef, { content });
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!newContract.title || !newContract.content) return;
    await addDoc(collection(db, 'contractTemplates'), {
      ...newContract,
      createdAt: Timestamp.now()
    });
    setNewContract({ title: '', content: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, 'contractTemplates', id));
    }
  };

  const printContract = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Truston Contract</title>
            <style>
              body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
              pre { white-space: pre-wrap; }
              .header { text-align: center; margin-bottom: 40px; }
              .logo { width: 100px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div style="width: 100px; height: 100px; margin: 0 auto 20px; overflow: hidden; border-radius: 20px; border: 1px solid #eee; position: relative; display: flex; align-items: center; justify-content: center; background: white;">
                <img src="https://ais-dev-rra6jidrntm5d6xnbtohn3-607862644369.asia-east1.run.app/logo_main.jpg" style="width: 90%; height: 90%; object-fit: contain;" />
              </div>
              <h1>Truston Recruitment Agreement</h1>
            </div>
            <pre>${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("계약서 내용이 클립보드에 복사되었습니다.");
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h4 className="font-bold mb-4 flex items-center gap-2"><Plus size={18} /> Add New Contract Template</h4>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Contract Title (e.g., Standard 90-day Guarantee)" 
            className="w-full p-2 border rounded-lg text-sm"
            value={newContract.title}
            onChange={e => setNewContract({...newContract, title: e.target.value})}
          />
          <textarea 
            placeholder="Contract Content..." 
            className="w-full p-3 border rounded-lg text-sm h-48 mb-4"
            value={newContract.content}
            onChange={e => setNewContract({...newContract, content: e.target.value})}
          />
          <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add Contract</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </div>
                <h4 className="font-bold text-gray-900">{contract.title}</h4>
              </div>
              <div className="flex gap-1">
                <button onClick={() => copyToClipboard(contract.content)} className="p-2 text-gray-400 hover:text-emerald-600" title="Copy"><Copy size={16} /></button>
                <button onClick={() => printContract(contract.content)} className="p-2 text-gray-400 hover:text-emerald-600" title="Print"><Printer size={16} /></button>
                <button onClick={() => setEditingId(contract.id)} className="p-2 text-gray-400 hover:text-blue-600" title="Edit"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(contract.id)} className="p-2 text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-6 flex-1">
              {editingId === contract.id ? (
                <div className="space-y-4">
                  <textarea 
                    className="w-full p-3 border rounded-lg text-sm h-96"
                    defaultValue={contract.content}
                    id={`edit-contract-${contract.id}`}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSave(contract.id, (document.getElementById(`edit-contract-${contract.id}`) as HTMLTextAreaElement).value)}
                      className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                    >Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-200 px-3 py-1 rounded-lg text-xs font-bold">Cancel</button>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
                  {contract.content}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutView({ t }: { t: any }) {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8">
      <section className="text-center space-y-6">
        <div className="inline-block bg-white rounded-3xl shadow-xl mb-4 overflow-hidden w-40 h-40 relative">
          <img src="https://ais-dev-rra6jidrntm5d6xnbtohn3-607862644369.asia-east1.run.app/logo_main.jpg" alt="Truston Emblem" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          {t.about_title}<br />
          <span className="text-emerald-600">{t.about_subtitle}</span>
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          {t.about_desc}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-bold">{t.feature1_title}</h3>
          <p className="text-gray-500 leading-relaxed">
            {t.feature1_desc}
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Building2 size={24} />
          </div>
          <h3 className="text-2xl font-bold">{t.feature2_title}</h3>
          <p className="text-gray-500 leading-relaxed">
            {t.feature2_desc}
          </p>
        </div>
      </div>

      <section className="bg-gray-900 text-white p-12 rounded-[3rem] space-y-12">
        <h3 className="text-3xl font-bold text-center">{t.diff_title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="text-4xl font-black text-emerald-400">[0원]</div>
            <h4 className="text-xl font-bold">{t.diff1_title}</h4>
            <p className="text-gray-400 text-sm">{t.diff1_desc}</p>
          </div>
          <div className="text-center space-y-4">
            <div className="text-4xl font-black text-blue-400">[VE]</div>
            <h4 className="text-xl font-bold">{t.diff2_title}</h4>
            <p className="text-gray-400 text-sm">{t.diff2_desc}</p>
          </div>
          <div className="text-center space-y-4">
            <div className="text-4xl font-black text-amber-400">[1:1]</div>
            <h4 className="text-xl font-bold">{t.diff3_title}</h4>
            <p className="text-gray-400 text-sm">{t.diff3_desc}</p>
          </div>
        </div>
      </section>

      <div className="text-center py-8 border-t border-gray-100">
        <p className="text-gray-400 text-sm">{t.footer_desc}</p>
        <p className="font-bold mt-2">{t.footer_contact}</p>
      </div>
    </div>
  );
}

function ContactView({ t }: { t: any }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'Client', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'inquiries'), {
      ...form,
      createdAt: Timestamp.now()
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold">{t.contact_success}</h3>
        <p className="text-gray-500">{t.contact_success_desc}</p>
        <button onClick={() => setSubmitted(false)} className="text-emerald-600 font-bold">{t.contact_new}</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl">
      <h3 className="text-2xl font-bold mb-8">{t.contact}</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">{t.name}</label>
            <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">{t.email}</label>
            <input required type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">{t.phone}</label>
            <input type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">{t.iam}</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="Client">{t.client}</option>
              <option value="Job Seeker">{t.jobSeeker}</option>
              <option value="Other">{t.other}</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">{t.message}</label>
          <textarea required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
        </div>
        <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
          {t.submit}
        </button>
      </form>
    </div>
  );
}

function InquiriesView({ inquiries }: { inquiries: any[] }) {
  const handleDelete = async (id: string) => {
    if (confirm("삭제하시겠습니까?")) {
      await deleteDoc(doc(db, 'inquiries', id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">Date</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">Type</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">Message</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inquiries.map((inq) => (
              <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-xs text-gray-500">{inq.createdAt?.toDate().toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-sm">{inq.name}</p>
                  <p className="text-xs text-gray-400">{inq.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold uppercase">{inq.type}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{inq.message}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(inq.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingView({ t }: { t: any }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const tiers = [
    {
      tier: "Professional Search",
      fee: "15 ~ 30%",
      desc: t.feature1_title,
      features: [t.guarantee_title, t.about_subtitle, "AI 역량 검증"]
    },
    {
      tier: "Field Labor",
      fee: "10 ~ 20%",
      desc: t.feature2_title,
      features: ["숙련공 적기 배치", "팀핏 중심 구성", "생산성 최적화"]
    },
    {
      tier: "Job Seeker",
      fee: "0원",
      desc: t.diff1_title,
      features: ["노동자 수수료 0%", "공정 채용 원칙", "경험 검증 리포트"]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-bold text-gray-900">{t.fee_schedule}</h3>
        <p className="text-gray-500">{t.fee_effective}</p>
      </div>

      <div className="relative py-4 overflow-hidden">
        <motion.div 
          className="flex md:hidden gap-6"
          animate={{ x: `calc(-${activeIndex * 100}% - ${activeIndex * 1.5}rem)` }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          style={{ width: '100%' }}
        >
          {tiers.map((item, idx) => (
            <div key={idx} className="min-w-full">
              <PriceCard 
                {...item}
                highlight={activeIndex === idx}
                t={t}
              />
            </div>
          ))}
        </motion.div>

        {/* Desktop View */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {tiers.map((item, idx) => (
            <motion.div
              key={idx}
              animate={{ 
                scale: activeIndex === idx ? 1.05 : 1,
                opacity: activeIndex === idx ? 1 : 0.7,
                y: activeIndex === idx ? -10 : 0
              }}
              transition={{ duration: 0.5 }}
            >
              <PriceCard 
                {...item}
                highlight={activeIndex === idx}
                t={t}
              />
            </motion.div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                activeIndex === i ? "bg-emerald-600 w-6" : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" />
            {t.guarantee_title}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-emerald-100 text-sm leading-relaxed">
                {t.guarantee_desc}
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <div className="text-center">
                <span className="text-5xl font-bold text-emerald-400">90</span>
                <span className="text-xl font-bold text-emerald-400 ml-1">{t.days}</span>
                <p className="text-[10px] uppercase tracking-widest text-emerald-300 mt-1">{t.guarantee_period}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-800 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
}

function PriceCard({ tier, fee, desc, features, highlight = false, t }: { tier: string, fee: string, desc: string, features: string[], highlight?: boolean, t: any }) {
  return (
    <div className={cn(
      "p-8 rounded-3xl border transition-all duration-300 flex flex-col",
      highlight 
        ? "bg-white border-emerald-500 shadow-xl scale-105 z-10" 
        : "bg-white border-gray-100 shadow-sm hover:shadow-md"
    )}>
      <div className="mb-6">
        <h5 className={cn("text-xs font-bold uppercase tracking-widest mb-2", highlight ? "text-emerald-600" : "text-gray-400")}>
          {tier}
        </h5>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900">{fee}</span>
          <span className="text-gray-500 text-sm font-medium">{t.annual_salary}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">{desc}</p>
      </div>

      <ul className="space-y-4 flex-1 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
            <Check className="text-emerald-500 mt-0.5 shrink-0" size={16} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer({ t }: { t: any }) {
  return (
    <footer className="mt-20 border-t border-gray-100 bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 relative">
              <img src="https://ais-dev-rra6jidrntm5d6xnbtohn3-607862644369.asia-east1.run.app/logo.jpg" alt="Truston Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="font-bold tracking-tight">TRUSTON</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-md">
            {t.address}
          </p>
        </div>
        <div className="space-y-4 md:text-right">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">{t.license}</p>
            <p className="text-xs text-gray-400">{t.biz_num}</p>
            <p className="text-xs text-gray-400">Email : wise2moon@gmail.com</p>
          </div>
          <p className="text-xs font-bold text-gray-900">{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
