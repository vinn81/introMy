/* 답 흔들림 점검기 · 한·영 학습 용어 사전: 질문과 답의 언어가 다를 때 같은 뜻의 낱말을 맞대기 위한 것
 * detect.js가 쓰는 부품. index.html에서 clues.js 다음, relevance.js 앞에 읽는다.
 *
 * 직접 입력한 한국어 질문에 영어 답(또는 반대)을 넣으면 낱말이 서로 달라 관련성을 잴 수 없다.
 * 그래서 수학·과학·논리·컴퓨터·경제·사회 분야에서 자주 쓰는 낱말을 짝지어 두고,
 * 양쪽 글에 나온 사전 낱말을 같은 id(영어 낱말의 앞부분)로 바꿔 x:<id> 단서로 맞댄다.
 * DNA·GDP 같은 대문자 약어는 두 언어에서 그대로 쓰이므로 a:<약어> 단서로 맞댄다.
 * 같은 언어끼리의 관련성·비교에는 쓰지 않는다(기존 판정과 측정 결과를 바꾸지 않기 위해). */
(function (P2) {
  "use strict";

  var plainMath = P2.plainMath,
    features = P2.features;

  // "한국어 낱말(앞부분)=영어 낱말 앞부분[,영어 낱말 앞부분…]"을 ;로 이어 쓴다. 첫 영어 낱말이 id
  var GLOSSARY_SRC =
    "광합성=photosynth;빛=light;세기=intens;산소=oxygen;이산화탄소=carbon dioxide,co2;발생=produc,releas,generat;물=water;에너지=energy;" +
    "온도=temperat;압력=pressur;부피=volume;질량=mass;무게=weight;속도=speed,velocit;가속도=accelerat;힘=force;" +
    "운동=motion,kinetic;위치=position,potential;높이=height;거리=distanc;시간=time;전압=voltag;전류=current;저항=resist;" +
    "회로=circuit;직렬=series;병렬=parallel;전력=power;자기장=magnetic;전기=electric;파동=wave;주파수=frequen;" +
    "파장=wavelen;굴절=refract;반사=reflect;렌즈=lens;중력=gravit;마찰=friction;관성=inertia;운동량=momentum;" +
    "일=work;열=heat;엔트로피=entropy;원자=atom;분자=molecul;이온=ion;전자=electron;양성자=proton;" +
    "중성자=neutron;원소=element;화합물=compound;반응=reaction,react;반응물=reactant;생성물=product;촉매=catalys;산=acid;" +
    "염기=base;중화=neutraliz;농도=concentrat;용액=solution;용매=solvent;용질=solute;몰=mol;평형=equilibr;" +
    "산화=oxidat;환원=reduct;결합=bond;세포=cell;유전자=gene;유전=heredit,genetic,inherit;염색체=chromosom;단백질=protein;" +
    "효소=enzyme;세균=bacteri;바이러스=virus;항생제=antibiot;내성=resist;진화=evolut;자연선택=natural select;돌연변이=mutat;" +
    "변이=variat,mutat;생태계=ecosystem;먹이=food;광합=photosynth;호흡=respirat;혈액=blood;심장=heart;뇌=brain;" +
    "신경=nerv,neuron;호르몬=hormon;면역=immun;질병=disease;감염=infect;백신=vaccin;기억력=memory;기억=memory;" +
    "수면=sleep;집중=focus,concentrat,attent;카페인=caffein;실험=experiment;가설=hypothes;변수=variabl;독립변수=independent;종속변수=dependent;" +
    "통제=control;대조군=control;표본=sample;평균=mean,average;중앙값=median;분산=varianc;표준편차=standard deviat;확률=probabil;" +
    "통계=statist;상관=correlat;인과=causa,caus;원인=cause;결과=result,outcome,effect;영향=effect,affect,impact,influenc;증가=increas,rise,grow;감소=decreas,declin,reduc,fall;" +
    "변화=change;차이=differen;비교=compar;관계=relation;비율=ratio,proportion,rate;비례=proportion;함수=function;방정식=equation;" +
    "연립방정식=system of equat,simultaneous;부등식=inequal;해=solution,solv;근=root;미분=derivat,differentiat;적분=integra;극한=limit;수열=sequenc;" +
    "급수=series;합=sum;곱=product;나머지=remainder;약수=divisor,factor;배수=multipl;소수=prime,decimal;정수=integer;" +
    "실수=real;허수=imaginar;복소수=complex;분수=fraction;제곱=square;제곱근=square root;지수=exponent;로그=logarithm,log;" +
    "삼각형=triangl;사각형=quadrilat,rectangl;원=circle;반지름=radius;지름=diamet;넓이=area;둘레=perimet,circumfer;각=angle;" +
    "직선=line;기울기=slope,gradient;좌표=coordinat;벡터=vector;행렬=matrix;집합=set;원소=element;명제=proposit,statement;" +
    "논증=argument;전제=premis;결론=conclus;타당=valid;참=true;거짓=false;필요조건=necessary;충분조건=sufficient;" +
    "역=convers;대우=contrapos;모순=contradict;증명=proof,prove;귀납=induct;연역=deduct;오류=error,fallac,mistake;계산=calculat,comput;" +
    "정답=answer,correct;알고리즘=algorithm;자료구조=data structur;배열=array;정렬=sort;탐색=search;재귀=recurs;시간복잡도=time complex;" +
    "복잡도=complex;프로그램=program;코드=code;변수=variabl;반복문=loop;조건문=condition;데이터=data;데이터베이스=database;" +
    "네트워크=network;인터넷=internet;컴퓨터=comput;메모리=memory;저장=storag,stor;보안=secur;암호=encrypt,password,cipher;인공지능=artificial intellig,ai;" +
    "학습=learn,train;모델=model;신경망=neural network;경제=econom;수요=demand;공급=supply;가격=price;시장=market;" +
    "인플레이션=inflat;금리=interest rate;세금=tax;소득=income;비용=cost;이익=profit;기업=compan,firm;정부=government;" +
    "정책=polic;법=law;헌법=constitut;민주주의=democra;선거=election;역사=histor;전쟁=war;혁명=revolut;" +
    "조선=joseon;왕=king;국가=nation,country,state;사회=societ,social;문화=cultur;인구=populat;환경=environment;기후=climat;" +
    "지구=earth;온난화=warming;오염=pollut;태양=sun,solar;달=moon;행성=planet;별=star;우주=universe,space;" +
    "지진=earthquak;화산=volcan;암석=rock;대기=atmospher;구름=cloud;비=rain;바다=ocean,sea;강=river;" +
    "호수=lake;질산염=nitrat;조류=algae,algal;번성=bloom;아이스크림=ice cream,ice-cream;익사=drown;여름=summer;학생=student;" +
    "문제=problem;시험=test,exam;점수=score;언어=language;번역=translat;문장=sentenc;단어=word;문법=grammar;" +
    "소설=novel;시=poem,poet;과학자=scientist;연구=research,study;논문=paper;설계=design;무작위=random;위약=placebo;" +
    "맹검=blind;편향=bias;측정=measur;관찰=observ;조사=survey;설문=survey;참가자=participant;집단=group;" +
    "효과=effect;재현=replicat;조작=manipul,fabricat;가능=possib;불가능=impossib;최솟값=minimum;최댓값=maximum;최소=minimum;" +
    "최대=maximum;크기=size,magnitud;개수=number,count;방법=method;원리=principl;이유=reason,why;설명=explain;정의=defin;" +
    "예시=exampl;장점=advantag;단점=disadvantag;사과=apple;물체=object;낙하=fall;자유낙하=free fall;속력=speed;" +
    "위치에너지=potential energ;운동에너지=kinetic energ;보존=conserv;저항기=resistor;옴=ohm;기체=gas;액체=liquid;고체=solid;" +
    "상태=state;끓는점=boiling;녹는점=melting;어는점=freezing;바닷물=seawat;해수면=sea level;섭씨=celsius;수도=capital;" +
    "퀵정렬=quicksort;퀵=quick;병합정렬=merge sort,mergesort;뉴턴=newton;법칙=law;기저=base;복제=replicat;주기=cycle,period;" +
    "단계=phase,stage,step;항생=antibiot;주요=main,major,primary;내각=interior angle;외각=exterior angle;도시=city;프랑스=france;한국=korea;" +
    "미국=united states,america;범인=guilty,culprit;진술=statement;거짓말=lie,liar,knave;기사=knight;사람=person,people;서버=server;웹사이트=website;" +
    "접속=access,connect;다운=down;논리=logic;형식=form;파충류=reptil;온혈=warm-blood,warm blood;뱀=snake;유령=ghost;" +
    "존재=exist;감시카메라=surveillance,camera,cctv;카메라=camera;범죄=crime;설치=install;정사각형=square;직사각형=rectangl;도형=shape,figure;" +
    "사용자=user;수정=revis,correct,modif;포유류=mammal;알=egg;오리너구리=platypus;추론=reason,infer;배열=arrang,permutat;일렬=row,line;" +
    "이웃=adjacent,next to;상염색체=autosom;열성=recessiv;우성=dominant;형질=trait;부모=parent;자녀=child,offspring;보인자=carrier;" +
    "조건부확률=conditional probab;조건부=conditional;표현형=phenotyp;유전자형=genotyp;지지=support;절대=absolut;과학적=scientif;곱셈=multipl;" +
    "교환법칙=commutat;일반적=general;동치=equivalen;수평=horizont;알짜힘=net force;작용=act;평가=evaluat;판단=determin,judg,decid;" +
    "연봉=salary;주식=stock;투자=invest;은행=bank;이자=interest;환율=exchange rate;수출=export;수입=import;" +
    "무역=trade;실업=unemploy;성장=growth;생산=produc;소비=consum;저축=saving;대출=loan;부채=debt;" +
    "예산=budget;식물=plant;동물=animal;뿌리=root;잎=leaf,leaves;꽃=flower;씨앗=seed;포도당=glucose;" +
    "엽록체=chloroplast;미토콘드리아=mitochondri;핵=nucleus,nuclear;막=membran;삼투=osmos;확산=diffus;전기분해=electrolys;연소=combust;" +
    "금속=metal;부식=corros;자석=magnet;전자기=electromagnet;빛의 속도=speed of light;상대성=relativ;양자=quantum;확률변수=random variabl;" +
    "기댓값=expect;분포=distribut;정규분포=normal distribut;가설검정=hypothesis test;유의=signific;신뢰구간=confidence interval;회귀=regress;표본추출=sampling;" +
    "모집단=populat;설문조사=survey;응답=respons,answer;질문=question;규칙=rule;패턴=pattern;순서=order,sequenc;경우=case;" +
    "조건=condition;만족=satisf;성립=hold;유일=uniqu;결정=determin;분류=classif,categor;구하=find,determin;계산하=calculat,comput;" +
    "설명하=explain;증명하=prove;비교하=compar;평가하=evaluat;";

  var GLOSSARY = (function () {
    var ko = [], en = {};
    GLOSSARY_SRC.split(";").filter(Boolean).forEach(function (pair) {
      var kv = pair.split("="), vs = kv[1].split(",");
      ko.push({ k: kv[0], id: vs[0] });
      vs.forEach(function (v) { if (!en[v]) en[v] = vs[0]; });
    });
    // 긴 낱말부터 맞대야 '연립방정식'이 '방정식'보다, '자연선택'이 '선택'보다 먼저 걸린다
    ko.sort(function (a, b) { return b.k.length - a.k.length; });
    var enList = Object.keys(en).sort(function (a, b) { return b.length - a.length; }).map(function (v) {
      // 3글자 이하(co2, sun, law)는 낱말 전체가 같을 때만, 그보다 길면 낱말 앞부분이 같을 때(photosynth → photosynthesis)
      var esc = v.replace(/[-]/g, "\\-");
      return { v: v, id: en[v], re: new RegExp("\\b" + esc + (v.length <= 3 ? "\\b" : "")) };
    });
    return { ko: ko, en: enList, size: ko.length };
  })();

  // 글에 나온 사전 낱말을 언어와 무관한 id로 바꾼다: { id: 글에 나온 원래 낱말 }
  function glossaryConcepts(text) {
    var t = plainMath(text).toLowerCase(), out = {};
    (t.match(/[가-힣]+/g) || []).forEach(function (w) {
      for (var i = 0; i < GLOSSARY.ko.length; i++) {
        var g = GLOSSARY.ko[i];
        // 사전 낱말이 맨 앞에 오거나(광합성에서), 세 글자 이상 사전 낱말이 합성어 안에 있을 때(퀵정렬의 '정렬'은 두 글자라 제외)
        if (w.indexOf(g.k) === 0 || (g.k.length >= 3 && w.indexOf(g.k) > 0)) {
          if (!out[g.id]) out[g.id] = w;
          break;
        }
      }
    });
    GLOSSARY.en.forEach(function (g) {
      if (out[g.id]) return;
      var m = g.re.exec(t);
      if (m) out[g.id] = (t.slice(m.index).match(/^[a-z][a-z -]*?(?=[^a-z]|$)/) || [g.v])[0];
    });
    return out;
  }

  // 언어가 다른 질문·답을 맞댈 때 쓰는 단서: 기존 단서 + 사전 용어(x:) + 대문자 약어(a:)
  function crossFeatures(text) {
    var f = features(text), out = {};
    Object.keys(f).forEach(function (k) { out[k] = f[k]; });
    (String(text).match(/\b[A-Z][A-Z0-9]{1,5}\b/g) || []).forEach(function (a) { if (!/^\d/.test(a)) out["a:" + a.toLowerCase()] = a; });
    var gc = glossaryConcepts(text);
    Object.keys(gc).forEach(function (id) { out["x:" + id] = gc[id]; });
    return out;
  }

  P2.GLOSSARY = GLOSSARY;
  P2.glossaryConcepts = glossaryConcepts;
  P2.crossFeatures = crossFeatures;
})((typeof window !== "undefined" ? window : globalThis).P2Lib = (typeof window !== "undefined" ? window : globalThis).P2Lib || {});
