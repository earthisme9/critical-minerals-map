// ============ 국가명(영문 Natural Earth 표준) -> 한글 표기 ============
const COUNTRY_KR = {
  "Chile":"칠레", "Dem. Rep. Congo":"콩고민주공화국(DRC)", "Peru":"페루", "China":"중국",
  "Russia":"러시아", "United States of America":"미국", "Indonesia":"인도네시아",
  "Philippines":"필리핀", "New Caledonia":"뉴칼레도니아", "Canada":"캐나다", "Brazil":"브라질",
  "Madagascar":"마다가스카르", "Mozambique":"모잠비크", "Tanzania":"탄자니아", "Australia":"호주",
  "Myanmar":"미얀마", "Laos":"라오스", "South Africa":"남아프리카공화국", "Gabon":"가봉",
  "Ghana":"가나", "Malaysia":"말레이시아", "France":"프랑스", "Vietnam":"베트남",
  "Finland":"핀란드", "Japan":"일본", "Norway":"노르웨이", "Germany":"독일",
  "Argentina":"아르헨티나", "South Korea":"대한민국", "India":"인도", "Zambia":"잠비아",
  "Zimbabwe":"짐바브웨"
};

// ============ 핵심광물 데이터셋 ============
// 출처: IEA Global Critical Minerals Outlook 2026 (채굴·정련 공급 전망, kt) + 자체 리서치(사용처/기업/가격/병목 해석)
const MINERALS = {
  cu: {
    id: "cu", name: "구리", symbol: "Cu", color: "#C1653B",
    newsQuery: ["구리 가격", "구리 공급망", "구리 정련", "copper price", "copper supply"],
    usage: ["전력망·전력화", "이차전지·EV 배터리", "반도체", "전자제품·전선/케이블"],
    company: "Codelco · Jiangxi Copper",
    price: "$9,946.9/t (1,414만원/t)",
    demand2025: "27.8 Mt", marketValue2025: "$276B (392.3조원)",
    cagr: "1.55%", demand2040: "35.0 Mt", marketValue2040: "$348.0B (494.6조원)",
    fulfillment2035: "75%",
    insight: "시장 규모가 8개 광물 중 압도적 1위. 수요 성장률 자체는 낮지만 절대 증가폭이 가장 크다. 광산 품위 저하와 긴 개발 기간 때문에 공급 확대 속도가 가장 느린 광물이기도 하다.",
    mining: [
      {country:"Chile", kt:5485, share:23.6, company:"Codelco"},
      {country:"Dem. Rep. Congo", kt:3338, share:14.4, company:"TFM·KFM"},
      {country:"Peru", kt:2726, share:11.7, company:"Antamina"},
      {country:"China", kt:1838, share:7.9},
      {country:"Russia", kt:1145, share:4.9},
      {country:"United States of America", kt:1101, share:4.7}
    ],
    refining: [
      {country:"China", kt:13069, share:46.8, company:"Jiangxi Copper"},
      {country:"Dem. Rep. Congo", kt:2659, share:9.5, company:"TFM·KFM"},
      {country:"Chile", kt:1741, share:6.2, company:"Codelco"},
      {country:"Japan", kt:1431, share:5.1},
      {country:"Russia", kt:990, share:3.5},
      {country:"South Korea", kt:680, share:2.4, source:"industry", company:"LS MnM"},
      {country:"India", kt:646, share:2.3}
    ],
    refiningNote: "† 한국(LS MnM 온산제련소, 연산 68만 톤 — 세계 2위 단일 전해동 제련소)은 IEA 표의 상위 6개국에는 없지만, 설비 능력 기준으로 추정한 별도 수치입니다. 원료 정광은 전량 칠레·페루·인도네시아 등에서 수입합니다."
  },
  li: {
    id: "li", name: "리튬", symbol: "Li", color: "#A6436B",
    newsQuery: ["리튬 가격", "리튬 공급망", "리튬 정련", "lithium price", "lithium supply"],
    usage: ["이차전지·EV 배터리"],
    company: "Greenbushes(PLS·IGO 등) · Ganfeng",
    price: "$9,000/t-Li₂CO₃ — 1,279만원/t",
    demand2025: "275 kt", marketValue2025: "$13.2B (18.8조원)",
    cagr: "8.48%", demand2040: "932 kt-Li (≈4.96 Mt-LCE)", marketValue2040: "$44.6B (63.4조원)",
    fulfillment2035: "68%",
    insight: "시장 규모는 구리보다 작지만 수요 성장률이 8개 광물 중 최상위권. 채굴은 호주·중국·칠레로 비교적 분산돼 있으나, 정련은 중국 한 나라에 4분의 3 가까이 집중돼 있어 병목이 미드스트림에 있다. 한국(POSCO)은 호주산 스포듀민을 들여와 광양에서 수산화리튬을 정련하는 설비(연산 최대 4.3만 톤, 2030년 10만 톤+ 목표)를 2025년 가동 중이지만 아직 램프업 단계라 정확한 2025년 생산량이 확인되지 않아 아래 순위표엔 포함하지 않았다.",
    mining: [
      {country:"Australia", kt:104, share:34.4, company:"Greenbushes 중심(PLS·IGO 등 자국 톱티어도 존재)"},
      {country:"China", kt:69.9, share:23.1, company:"CATL · Zijin"},
      {country:"Chile", kt:52.1, share:17.3, company:"SQM (Cauchari-Olaroz, 자본 중심)"},
      {country:"Zimbabwe", kt:27.7, share:9.2},
      {country:"Argentina", kt:18.7, share:6.2},
      {country:"Canada", kt:6.65, share:2.2}
    ],
    refining: [
      {country:"China", kt:235, share:73.7, company:"Ganfeng"},
      {country:"Chile", kt:52.1, share:16.3, company:"SQM"},
      {country:"Argentina", kt:15.7, share:4.9},
      {country:"Australia", kt:6.35, share:2.0},
      {country:"Germany", kt:2.98, share:0.9},
      {country:"United States of America", kt:1.38, share:0.4}
    ]
  },
  ni: {
    id: "ni", name: "니켈", symbol: "Ni", color: "#7FA65A",
    newsQuery: ["니켈 가격", "니켈 공급망", "nickel price", "nickel supply"],
    usage: ["이차전지·EV 배터리"],
    company: "PT Vale Indonesia · Tsingshan",
    price: "$15,161.33/t (2,155만원/t)",
    demand2025: "3.53 Mt", marketValue2025: "$54B (76.8조원)",
    cagr: "3.40%", demand2040: "5.83 Mt", marketValue2040: "$88.4B (125.7조원)",
    fulfillment2035: "92%",
    insight: "공급충족률이 92%로 물량 자체는 비교적 넉넉하다. 문제는 절대적 부족이 아니라 인도네시아 한 나라가 채굴·정련 모두에서 압도적 비중을 차지하는 지리적 집중 리스크다.",
    mining: [
      {country:"Indonesia", kt:2637, share:62.7, company:"PT Vale Indonesia(중국 자본 중심 기업도 많음)"},
      {country:"Philippines", kt:482, share:11.5, company:"Nickel Asia"},
      {country:"Russia", kt:192, share:4.6, company:"Nornickel"},
      {country:"China", kt:147, share:3.5},
      {country:"New Caledonia", kt:138, share:3.3},
      {country:"Canada", kt:138, share:3.3}
    ],
    refining: [
      {country:"Indonesia", kt:1681, share:45.1, company:"Tsingshan"},
      {country:"China", kt:1160, share:31.1, company:"Tsingshan"},
      {country:"Canada", kt:125, share:3.4, company:"Sherritt"},
      {country:"Russia", kt:123, share:3.3},
      {country:"Japan", kt:108, share:2.9},
      {country:"Norway", kt:100, share:2.7}
    ]
  },
  mn: {
    id: "mn", name: "망간", symbol: "Mn", color: "#8B4FA1",
    newsQuery: ["망간 가격", "페로망간", "manganese price"],
    usage: ["철강(페로망간·실리코망간, 수요의 85~90%)", "이차전지(고순도 황산망간 HPMSM)"],
    company: "Nchwaning·Gloria(Eramet) · Bosai Minerals",
    price: "$452/t-Mn (64.2만원/t-Mn)",
    demand2025: "약 20 Mt-Mn", marketValue2025: "$9B (12.8조원)",
    cagr: "0%", demand2040: "약 20 Mt-Mn (철강 수요 연동, 정체)", marketValue2040: "$9B (12.8조원)",
    fulfillment2035: "—",
    insight: "망간은 수요의 85~90%가 철강용 페로망간·실리코망간에서 나오는 벌크 합금 원료로, 구리·리튬·니켈처럼 IEA가 에너지전환 관점에서 장기 수급을 정밀 추적하는 6개 광물에는 포함되지 않는다. 전체 시장 규모($9B)는 CAGR 0%로 정체돼 있다. 다만 이 중 배터리용 고순도 황산망간(HPMSM)만 따로 떼어보면 얘기가 완전히 달라진다 — 시장 자체는 아주 작지만(2025년 약 $0.24B, 313kt) 수요 CAGR이 8개 광물 중 가장 높은 16.2%이고, 2035년 발표된 프로젝트 파이프라인은 수요의 약 20%가 부족할 전망(전년도 55% 부족 전망에서 개선)이며 정련이 중국에 60%(전체 합금 기준. HPMSM만 보면 95%+) 집중된 병목이 있다.",
    mining: [
      {country:"South Africa", kt:null, share:38, company:"Nchwaning·Gloria"},
      {country:"Gabon", kt:null, share:25, company:"Moanda(Eramet 계열사가 운영)"},
      {country:"Ghana", kt:null, share:10, company:"Ghana Manganese Company(자국 지분 10%)"}
    ],
    refining: [
      {country:"China", kt:null, share:60, company:"Bosai Minerals"},
      {country:"India", kt:null, share:19, company:"Tata Steel FAMD"},
      {country:"Malaysia", kt:null, share:3, company:"OM Materials Sarawak(주로 외국계)"}
    ],
    miningNote: "채굴 상위 3개국(자체 리서치 '시장' 탭 기준) — HPMSM만 놓고 보면 상위 6개국 구도가 달라질 수 있습니다.",
    refiningNote: "정련(제련)은 철강용 페로실리코망간 합금 생산 기준 — 배터리급 HPMSM만 보면 중국 비중이 95%+로 훨씬 더 집중돼 있습니다.",
  },
  co: {
    id: "co", name: "코발트", symbol: "Co", color: "#3B6FA5",
    newsQuery: ["코발트 가격", "코발트 공급망", "cobalt price", "cobalt supply"],
    usage: ["이차전지·EV 배터리", "전자제품"],
    company: "TFM·KFM · Huayou Cobalt",
    price: "$35,432/t (5,036만원/t)",
    demand2025: "259 kt", marketValue2025: "$9B (12.8조원)",
    cagr: "1.90%", demand2040: "343 kt", marketValue2040: "$12.2B (17.3조원)",
    fulfillment2035: "74%",
    insight: "콩고민주공화국(DRC) 한 나라가 채굴의 3분의 2를 차지하는 8개 광물 중 가장 극단적인 단일국 집중 사례. DRC의 자원 정책 변화(수출 쿼터 등) 자체가 곧바로 글로벌 공급 갭으로 이어지는 구조다.",
    mining: [
      {country:"Dem. Rep. Congo", kt:210, share:65.6, company:"TFM·KFM"},
      {country:"Indonesia", kt:48.3, share:15.1, company:"Huayue"},
      {country:"Russia", kt:7.69, share:2.4, company:"Nornickel"},
      {country:"China", kt:7.38, share:2.3},
      {country:"Zambia", kt:4.33, share:1.4},
      {country:"Australia", kt:4.15, share:1.3}
    ],
    refining: [
      {country:"China", kt:180, share:75.6, company:"Huayou Cobalt"},
      {country:"Finland", kt:20.3, share:8.5, company:"Terrafame"},
      {country:"Canada", kt:6.4, share:2.7},
      {country:"Indonesia", kt:6.17, share:2.6},
      {country:"Japan", kt:5.83, share:2.4, company:"Sumitomo Metal Mining"},
      {country:"Norway", kt:2.8, share:1.2}
    ]
  },
  graphite: {
    id: "graphite", name: "흑연", symbol: "Graphite", color: "#9AA0A6",
    newsQuery: ["흑연 가격", "흑연 공급망", "graphite price", "battery anode"],
    usage: ["배터리 음극재"],
    company: "Jixi Aoyu · BTR",
    price: "$3,500/t (전지급 기준, 497.5만원/t)",
    demand2025: "5.78 Mt", marketValue2025: "$20.2B (28.7조원)",
    cagr: "4.40%", demand2040: "10.95 Mt", marketValue2040: "$38.3B (54.4조원)",
    fulfillment2035: "96%",
    insight: "천연 흑연 채굴은 중국이 80%를 차지하지만, 전지급(battery-grade) 정련 단계로 가면 중국 비중이 94%까지 더 올라간다. 총량 부족보다 고순도 정련 공정의 병목·독점이 핵심 리스크다.",
    mining: [
      {country:"China", kt:1432, share:80.4, company:"Jixi Aoyu"},
      {country:"Madagascar", kt:69.7, share:3.9, company:"Molo(영국·중국계 기업도 있음)"},
      {country:"Mozambique", kt:66.6, share:3.7, company:"Balama(Syrah Resources)"},
      {country:"Brazil", kt:64.1, share:3.6},
      {country:"Tanzania", kt:61.8, share:3.5},
      {country:"Russia", kt:28.2, share:1.6}
    ],
    refining: [
      {country:"China", kt:2139, share:94.4, company:"BTR"},
      {country:"Japan", kt:68.5, share:3.0, company:"JFE Chemical"},
      {country:"Indonesia", kt:32, share:1.4, company:"PT Indonesia BTR New Energy Material"},
      {country:"United States of America", kt:13.1, share:0.6},
      {country:"South Korea", kt:5.2, share:0.2},
      {country:"Germany", kt:4.8, share:0.2}
    ]
  },
  ree: {
    id: "ree", name: "영구자석용 희토류", symbol: "REE", color: "#2F9E8F",
    newsQuery: ["희토류 가격", "영구자석 공급망", "rare earth magnet", "neodymium price"],
    usage: ["모터(영구자석)", "촉매", "반도체"],
    company: "China Northern Rare Earth · MP Materials",
    price: "Nd $73,000/t · Pr $74,000/t · Dy $239,000/t · Tb $1.01M/t",
    demand2025: "93 kt", marketValue2025: "$9.7B (13.8조원)",
    cagr: "2.80%", demand2040: "140 kt", marketValue2040: "$14.6B (20.8조원)",
    fulfillment2035: "100%+",
    insight: "물량 자체는 2035년 이후에도 여유가 있을 전망이지만, 채굴·정련 모두 중국 비중이 60~85%에 달해 '양은 충분해도 중국 없이는 공급망이 성립하지 않는' 구조적 리스크가 8개 광물 중 가장 뚜렷하다. 미얀마 채굴분은 현지 무장세력 자본이 연관돼 있어 지정학적 리스크가 한 겹 더 있다.",
    mining: [
      {country:"China", kt:47.2, share:58.6, company:"China Northern Rare Earth"},
      {country:"Myanmar", kt:13.1, share:16.3, company:"현지 front·무장세력 자본"},
      {country:"United States of America", kt:7.4, share:9.2, company:"MP Materials"},
      {country:"Australia", kt:4.09, share:5.1},
      {country:"Laos", kt:3.75, share:4.7}
    ],
    refining: [
      {country:"China", kt:74.9, share:83.9, company:"China Northern Rare Earth"},
      {country:"United States of America", kt:4.7, share:5.3, company:"MP Materials"},
      {country:"Malaysia", kt:4.59, share:5.1, company:"Lynas Malaysia(본사: 미국)"},
      {country:"France", kt:0.991, share:1.1},
      {country:"Vietnam", kt:0.98, share:1.1}
    ]
  },
  lree: {
    id: "lree", name: "촉매·연마용 경희토류", symbol: "LREE", color: "#D6A23C",
    newsQuery: ["경희토류", "세륨 란타넘", "light rare earth", "cerium lanthanum"],
    usage: ["촉매(정유·자동차 배기)", "연마·광학 유리"],
    company: "China Northern Rare Earth · MP Materials",
    price: "Ce $1,710/t · La $1,000/t",
    demand2025: "106.97 kt", marketValue2025: "$159.5M (2,267억원)",
    cagr: "3.66%", demand2040: "181.8 kt", marketValue2040: "$277.0M (3,937억원)",
    fulfillment2035: "100%+",
    insight: "영구자석용 희토류(Nd·Pr·Dy·Tb)와 달리 세륨·란타넘 등 경희토류는 시장 규모가 훨씬 작다. 채굴은 중국·미국·호주가 나눠 갖고 있지만 정련·분리 단계는 여전히 중국이 지배적이다.",
    mining: [
      {country:"China", kt:null, share:69.2, company:"China Northern Rare Earth"},
      {country:"United States of America", kt:null, share:13.1, company:"MP Materials"},
      {country:"Australia", kt:null, share:7.4, company:"Lynas Rare Earths"}
    ],
    refining: [
      {country:"China", kt:null, share:87.5, company:"China Northern Rare Earth"},
      {country:"Malaysia", kt:null, share:3, company:"Lynas Malaysia(본사: 미국)"},
      {country:"United States of America", kt:null, share:2, company:"MP Materials"}
    ]
  }
};

const MINERAL_ORDER = ["cu","li","ni","mn","co","graphite","ree","lree"];

// ============ 산업별 핵심광물 매핑 (지수님 분류 기준 10개 산업) ============
// sourceTag: "quant" = IEA 정량 수요 데이터(업로드 데이터셋 '3.1/4.6 시트')로 직접 확인
//            "qual"  = IEA 보고서 본문에서 해당 산업이 명시적으로 언급됨(수치 X)
//            "general" = IEA/자체 리서치 원자료에 없어 일반적인 소재 용도 지식으로 구성
// 출처: IEA Global Critical Minerals Outlook 2026(부문별 수요), IEA Rare Earth Elements(2026) executive summary,
//       IEA Global EV Outlook 2026 - Electric vehicle batteries
const INDUSTRIES = {
  ev_ess: {
    id: "ev_ess", name: "EV·ESS / 이차전지", icon: "battery",
    minerals: ["li","ni","mn","co","graphite","cu"],
    sourceTag: "quant",
    note: "IEA 데이터셋 기준 2025년 EV+ESS(그리드 배터리 저장) 수요는 리튬 203kt·니켈 467kt·코발트 90kt·흑연 1,462kt·구리 931kt로, 8개 핵심광물 중 배터리 5종(Li·Ni·Mn·Co·Graphite) 수요를 사실상 전량 차지합니다. LFP 배터리는 코발트를 쓰지 않는 반면 NMC 계열은 니켈·코발트 비중이 높아, 채택되는 배터리 화학에 따라 광물별 노출도가 크게 갈립니다(IEA Global EV Outlook 2026)."
  },
  grid: {
    id: "grid", name: "전력망·전기화", icon: "pylon",
    minerals: ["cu"],
    sourceTag: "quant",
    note: "전력망(Electricity networks)은 2025년 구리 수요 4,544kt로 전체 구리 수요(8,003kt)의 57%를 차지하는, 단일 부문으로는 최대 구리 수요처입니다. 전력화가 진행될수록 구리 병목이 가장 먼저 감지될 가능성이 높은 산업입니다."
  },
  magnet_wind: {
    id: "magnet_wind", name: "영구자석 / EV모터·풍력", icon: "magnet",
    minerals: ["ree"],
    sourceTag: "quant",
    note: "2025년 네오디뮴 수요(16.2kt) 중 EV 구동모터가 8.44kt, 풍력 터빈이 7.73kt로 거의 절반씩을 차지합니다. IEA는 영구자석이 EV·풍력 외에도 산업용 모터, AI 데이터센터, 의료·항공우주·방산 기기까지 광범위하게 쓰인다고 밝히고 있습니다(IEA Rare Earth Elements, 2026)."
  },
  solar: {
    id: "solar", name: "태양광", icon: "solar",
    minerals: ["cu"],
    sourceTag: "quant",
    note: "태양광은 2025년 구리 수요 1,970kt로 EV(794kt)보다도 큰 개별 수요처입니다. 다만 태양광 셀의 핵심 소재는 실리콘(1,691kt)·은(10.1kt) 등으로, 이 사이트가 다루는 8개 핵심광물에는 포함되지 않아 구리 비중만 반영돼 있다는 점에 유의해주세요."
  },
  semi: {
    id: "semi", name: "반도체", icon: "chip",
    minerals: ["cu","ree"],
    sourceTag: "qual",
    note: "IEA는 희토류 수출통제 관련 리스크를 다루며 반도체를 공급망 충격에 취약한 핵심 산업으로 명시적으로 언급합니다(IEA Rare Earth Elements, 2026). 배선·방열의 구리 비중은 별도 정량화되어 있지 않으며, 반도체의 실제 핵심 소재인 실리콘·갈륨·게르마늄 등은 이 데이터셋 범위 밖입니다."
  },
  datacenter: {
    id: "datacenter", name: "AI 서버·스토리지 / 데이터센터", icon: "server",
    minerals: ["ree","cu","li","ni","co","mn","graphite"],
    sourceTag: "qual",
    note: "IEA는 영구자석의 응용처로 'AI 데이터센터'를 명시하며(하드디스크 구동모터 등), 별도로 미국 등에서 데이터센터·전력망 백업용 그리드 배터리 저장 수요가 늘고 있다고 밝힙니다(IEA Rare Earth Elements 2026; IEA Global EV Outlook 2026). 즉 데이터센터는 희토류(모터)와 이차전지 5종(백업 ESS) 양쪽에 걸쳐 있는 산업입니다."
  },
  robotics: {
    id: "robotics", name: "로보틱스", icon: "robot",
    minerals: ["ree","li","ni","co","mn","graphite"],
    sourceTag: "qual",
    note: "IEA는 2030년 이후 희토류 수요 성장에서 자동화·로보틱스·디지털 기술의 비중이 커진다고 명시하며, 영구자석이 정밀 모션 제어·소형화에 필수적이라고 설명합니다(IEA Rare Earth Elements, 2026). 구동용 배터리(Li·Ni·Co·Mn·Graphite)는 일반적인 로봇 설계 지식을 근거로 함께 표시했습니다."
  },
  telecom: {
    id: "telecom", name: "통신 / 5G·6G", icon: "signal",
    minerals: ["cu","ree"],
    sourceTag: "general",
    note: "기지국·케이블 배선(구리), 필터·안테나 부품(희토류)은 일반적으로 알려진 소재 용도입니다. IEA 원자료(Critical Minerals Outlook, Rare Earth Elements)에는 통신·5G·6G가 별도 산업 카테고리로 집계돼 있지 않습니다."
  },
  aerospace: {
    id: "aerospace", name: "항공우주·방산", icon: "rocket",
    minerals: ["ni","co","ree"],
    sourceTag: "qual",
    note: "IEA는 영구자석의 응용처로 항공우주·방산을 명시하며, 수출통제 시나리오에서 방산이 경제적 손실 위험이 큰 부문 중 하나로 꼽힙니다(IEA Rare Earth Elements, 2026). 니켈·코발트의 제트엔진용 초내열합금 활용은 일반적인 소재 지식에 근거합니다."
  },
  hydrogen: {
    id: "hydrogen", name: "수소", icon: "hydrogen",
    minerals: ["ni","co"],
    sourceTag: "quant",
    note: "IEA 데이터셋 기준 2025년 수소기술 광물 수요는 니켈 2.3kt·코발트 0.01kt로 8개 핵심광물 중에서는 절대 규모가 가장 작지만, High Demand 시나리오에서는 2035년 니켈 수요가 32kt까지 약 14배 성장할 것으로 전망됩니다. 다만 수전해(전해조) 촉매의 실제 핵심 병목은 이리듐(Iridium)인데, 2025년 수요는 0.0005kt 수준으로 극히 희소하며 이 사이트의 8개 광물에는 포함되어 있지 않습니다."
  }
};
const INDUSTRY_ORDER = ["ev_ess","grid","magnet_wind","solar","semi","datacenter","robotics","telecom","aerospace","hydrogen"];
