export interface Company {
  id: string;
  name: string;
  industry: string;
  reason: string;
  status: 'Target' | 'Contacted' | 'Meeting' | 'Contracted';
  hrEmail: string;
}

export interface OutreachTemplate {
  id: string;
  title: string;
  type: 'Email' | 'Call';
  content: string;
}

export const TARGET_COMPANIES: Company[] = [
  { id: '1', name: 'Samsung Electronics', industry: 'Technology', reason: 'High demand for specialized AI/Semiconductor talent.', status: 'Target', hrEmail: 'hr.recruiting@samsung.com' },
  { id: '2', name: 'Naver', industry: 'IT/Platform', reason: 'Focuses on talent density and engineering excellence.', status: 'Target', hrEmail: 'recruit@navercorp.com' },
  { id: '3', name: 'Kakao', industry: 'IT/Platform', reason: 'Rapid expansion into new business verticals.', status: 'Target', hrEmail: 'kakao_recruit@kakaocorp.com' },
  { id: '4', name: 'Hyundai Motor Group', industry: 'Automotive', reason: 'Transitioning to SDV (Software Defined Vehicle) requires top-tier tech talent.', status: 'Target', hrEmail: 'hr_team@hyundai.com' },
  { id: '5', name: 'LG Energy Solution', industry: 'Energy/Battery', reason: 'Global expansion requires high-density leadership.', status: 'Target', hrEmail: 'hr.battery@lgensol.com' },
  { id: '6', name: 'Coupang', industry: 'E-commerce', reason: 'Operational excellence driven by high-density logistics talent.', status: 'Target', hrEmail: 'recruiting@coupang.com' },
  { id: '7', name: 'Toss (Viva Republica)', industry: 'Fintech', reason: 'Strong culture of "Talent Density" and high performance.', status: 'Target', hrEmail: 'talent@toss.im' },
  { id: '8', name: 'Krafton', industry: 'Gaming', reason: 'Global gaming market leadership requires creative top talent.', status: 'Target', hrEmail: 'hr@krafton.com' },
  { id: '9', name: 'SK Hynix', industry: 'Semiconductor', reason: 'Intense competition for global semiconductor experts.', status: 'Target', hrEmail: 'hynix.hr@sk.com' },
  { id: '10', name: 'Woowa Brothers (Baemin)', industry: 'Platform', reason: 'Unique organizational culture that values talent density.', status: 'Target', hrEmail: 'recruit@woowahan.com' },
];

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'email-1',
    title: 'Cold Email: Talent Density Strategy',
    type: 'Email',
    content: `[Subject] [Truston] 귀사의 인재 밀도(Talent Density)를 높이는 전략적 파트너십 제안

안녕하세요, [담당자 성함] HRBP님.
트러스톤(Truston)의 [본인 성함]입니다.

귀사가 추구하는 [기업명]의 성장에 있어 '인재 밀도'가 핵심적인 가치임을 잘 알고 있습니다. 
저희 트러스톤은 단순한 채용 대행을 넘어, 귀사의 조직 문화를 깊이 이해하고 
상위 1%의 핵심 인재만을 선별하여 제안드리는 'TD(Talent Density) 전략'을 보유하고 있습니다.

저희의 차별화된 요금 체계와 90일 채용 보증 서비스를 통해 
귀사의 채용 리스크를 최소화하고 조직의 밀도를 높이는 데 기여하고 싶습니다.

첨부드린 제안서와 요금표를 검토 부탁드리며, 
짧은 미팅을 통해 귀사의 현재 채용 고민을 나누고 싶습니다.

감사합니다.
트러스톤 드림`
  },
  {
    id: 'call-1',
    title: 'Cold Call Script: Initial Contact',
    type: 'Call',
    content: `(인사) 안녕하세요, [기업명] 인사팀 [담당자 성함]님 맞으신가요?
(자기소개) 저는 헤드헌팅 전문 기업 트러스톤의 [본인 성함]이라고 합니다.
(목적) 다름이 아니라, 최근 귀사에서 진행 중인 [특정 직무] 채용과 관련하여, 저희가 보유한 '인재 밀도 전략' 기반의 핵심 인재 리스트를 공유드리고자 연락드렸습니다.
(가치 제안) 저희는 단순 매칭이 아니라, 귀사의 조직 밀도를 높일 수 있는 상위 1% 검증된 인재만을 타겟팅합니다. 
(클로징) 혹시 관련해서 제안서와 요금표를 메일로 먼저 보내드려도 괜찮을까요? 확인 후 편하신 시간에 5분 정도만 유선으로 더 설명드리고 싶습니다.`
  }
];
