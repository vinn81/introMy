// 화면 효과: 스크롤하면 카드가 부드럽게 나타나고, 상단 바가 진해지고, 카드 위에서 포인터를 따라 은은한 빛이 움직입니다.
// 움직임 줄이기 설정이면 나타나기·빛 효과는 건너뜁니다. 콘텐츠와 기능(script.js)에는 손대지 않습니다.
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 상단 바: 조금 내려가면 바탕을 진하게
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (reduceMotion) return;

  // 나타나기 (style.css의 reveal-ready 목록과 같은 대상)
  const revealTargets = document.querySelectorAll(
    ".work, .lab, .stack, .glance, .frame, .band-photo, .aleph-course-card, .aleph-note-card, .evidence-card, .doc-card, .private-lock-card, .scope-card"
  );
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("reveal-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px 15% 0px", threshold: 0 });
    revealTargets.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${(i % 4) * 50}ms`);
      observer.observe(el);
    });

    // 메뉴·앵커로 바로 이동하면 그 구역은 애니메이션 없이 즉시 보여 줌
    const showSection = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const section = id && document.getElementById(id);
      if (!section) return;
      const scope = section.closest("section") || section;
      revealTargets.forEach((el) => {
        if (scope.contains(el)) {
          el.style.setProperty("--reveal-delay", "0ms");
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      });
    };
    showSection();
    window.addEventListener("hashchange", showSection);
    window.addEventListener("beforeprint", () => {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
    });
  }

  // 카드 스포트라이트: 포인터 위치를 --mx/--my로 넘김 (마우스·펜만, 터치는 제외)
  const spotlight = ".glance, .hero-current, .work, .lab, .stack, .frame, .aleph-note-card, .evidence-card, .doc-card, .private-lock-card, .private-content, .scope-card";
  let last = null;
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const card = event.target.closest(spotlight);
    if (last && last !== card) {
      last.style.removeProperty("--mx");
      last.style.removeProperty("--my");
    }
    last = card;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, { passive: true });
})();
