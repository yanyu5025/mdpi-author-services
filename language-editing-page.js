/**
 * English Language Editing service page — data-driven sections and interactions.
 */
(function () {
  const JOURNAL_LOGOS = [
    { name: "Sensors", src: "assets/journals/sensors.png" },
    { name: "International Journal of Molecular Sciences", src: "assets/journals/ijms.png" },
    { name: "Nutrients", src: "assets/journals/nutrients.png" },
    { name: "Molecules", src: "assets/journals/molecules.png" },
    { name: "Pharmaceuticals", src: "assets/journals/pharmaceuticals.png" },
    { name: "Cancers", src: "assets/journals/cancers.png" },
    { name: "Water", src: "assets/journals/water.png" },
    { name: "Energies", src: "assets/journals/energies.png" },
    { name: "Cells", src: "https://pub.mdpi-res.com/img/journals/cells-logo-sq.png?e0a28e0a1b4950d8" },
    { name: "Biomolecules", src: "https://pub.mdpi-res.com/img/journals/biomolecules-logo-sq.png?64e03e092044064d" },
    { name: "Materials", src: "https://pub.mdpi-res.com/img/journals/materials-logo-sq.png?383a60561d4dedb8" },
    { name: "Polymers", src: "https://pub.mdpi-res.com/img/journals/polymers-logo-sq.png?a28a61cc1cd88ebc" },
    { name: "Foods", src: "https://pub.mdpi-res.com/img/journals/foods-logo-sq.png?a8f99d50b4c10c98" },
    { name: "Sustainability", src: "https://pub.mdpi-res.com/img/journals/sustainability-logo-sq.png?3798e4e58c765aed" },
    { name: "Remote Sensing", src: "https://pub.mdpi-res.com/img/journals/remotesensing-logo-sq.png?1ace5a4b6c47121d" },
    { name: "Antioxidants", src: "https://pub.mdpi-res.com/img/journals/antioxidants-logo-sq.png?ad0f65bb56400c49" },
  ];

  const TESTIMONIALS_PER_GROUP = 4;
  const TESTIMONIAL_ROTATE_MS = 3000;
  const JOURNALS_PER_SLIDE = 8;

  const EDITORS = [
    {
      initials: "SL",
      name: "Sarah Lindstrom, PhD",
      qualification: "PhD in Biochemistry",
      subject: "Life Sciences",
      experience: "12 years",
      manuscripts: "2,400+",
      bio: "Specializes in molecular biology and clinical research manuscripts for high-impact SCI journals.",
    },
    {
      initials: "MC",
      name: "Michael Chen, PhD",
      qualification: "PhD in Materials Science",
      subject: "Engineering & Chemistry",
      experience: "9 years",
      manuscripts: "1,850+",
      bio: "Experienced with materials, nanotechnology, and interdisciplinary engineering submissions.",
    },
    {
      initials: "EP",
      name: "Emma Patel, MA",
      qualification: "MA in Applied Linguistics",
      subject: "Medicine & Public Health",
      experience: "11 years",
      manuscripts: "2,100+",
      bio: "Focuses on epidemiology, public health policy, and medical research communication.",
    },
    {
      initials: "JR",
      name: "James Rivera, PhD",
      qualification: "PhD in Environmental Science",
      subject: "Environmental & Earth Sciences",
      experience: "10 years",
      manuscripts: "1,600+",
      bio: "Edits sustainability, climate science, and environmental chemistry papers for global journals.",
    },
  ];

  const QUALIFICATIONS = [
    {
      title: "Top Journal Experience",
      icon: "journal",
      items: ["Reviewer for prestigious journals", "Editorial board experience"],
    },
    {
      title: "Verifiable Publication Record",
      icon: "publication",
      items: [
        "Published in peer-reviewed journals",
        "Demonstrated subject expertise",
      ],
    },
    {
      title: "Native English Speaker",
      icon: "native",
      items: ["Natural, fluent writing", "Strong scientific communication"],
    },
    {
      title: "PhD or Equivalent",
      icon: "phd",
      items: [
        "Advanced academic qualification",
        "Specialized domain expertise",
      ],
    },
  ];

  const TESTIMONIALS = [
    {
      quote:
        "The Academic tier improved clarity without changing my scientific meaning. Reviewers commented on how readable the revised manuscript was.",
      author: "Dr. Ana Müller",
      role: "Associate Professor, Cell Biology",
    },
    {
      quote:
        "Rapid turnaround saved my revision deadline. The certificate and tracked changes made resubmission straightforward.",
      author: "Prof. David Okonkwo",
      role: "Environmental Engineering Research Group",
    },
    {
      quote:
        "Our lab uses Standard and Rapid packages depending on timeline. Consistent quality across chemistry and materials manuscripts.",
      author: "Dr. Lin Wei",
      role: "Principal Investigator, Polymer Science",
    },
    {
      quote:
        "Editors preserved technical terminology while improving sentence flow. The editing certificate was accepted without question.",
      author: "Dr. Sofia Marchetti",
      role: "Research Fellow, Pharmacology",
    },
    {
      quote:
        "Standard editing met our budget for a first submission. Clear improvements to grammar and academic tone throughout.",
      author: "Prof. James O'Brien",
      role: "Department of Physics, University of Dublin",
    },
    {
      quote:
        "We submitted a multi-author clinical paper and received consistent style across all sections. Highly professional service.",
      author: "Dr. Priya Nair",
      role: "Clinical Research Coordinator",
    },
    {
      quote:
        "The specialist report in the Academic package helped us address reviewer language concerns before resubmission.",
      author: "Dr. Hans Weber",
      role: "Postdoctoral Researcher, Neuroscience",
    },
    {
      quote:
        "Figure and layout bundle discounts made it easy to prepare the full submission package in one quote.",
      author: "Dr. Mei Chen",
      role: "Materials Science Laboratory",
    },
    {
      quote:
        "Tracked changes were easy to review with co-authors. Every suggestion was justified and easy to accept or reject.",
      author: "Prof. Elena Vasquez",
      role: "Institute of Agricultural Sciences",
    },
    {
      quote:
        "English is not my first language, and the edited manuscript finally reads naturally while keeping my data interpretation intact.",
      author: "Dr. Kenji Tanaka",
      role: "Associate Professor, Robotics",
    },
    {
      quote:
        "Rapid service delivered within 24 hours for a conference revision. Quality matched our previous Standard orders.",
      author: "Dr. Amira Hassan",
      role: "Biomedical Engineering Group",
    },
    {
      quote:
        "Cover letter editing saved time during a tight resubmission window. Editors understood journal expectations well.",
      author: "Prof. Robert Klein",
      role: "Chair of Ecology and Conservation",
    },
    {
      quote:
        "Our department recommends MDPI Author Services for students preparing their first international journal submission.",
      author: "Dr. Laura Fernandez",
      role: "Graduate Program Director",
    },
    {
      quote:
        "Two-editor Academic review caught subtle terminology inconsistencies our team had missed for months.",
      author: "Dr. Thomas Berg",
      role: "Principal Investigator, Immunology",
    },
    {
      quote:
        "Re-editing within one year gave us confidence to iterate after peer review without paying full price again.",
      author: "Dr. Yuki Sato",
      role: "Environmental Chemistry Unit",
    },
    {
      quote:
        "Clear communication, transparent pricing, and a polished final manuscript. Exactly what we needed before submission.",
      author: "Prof. Catherine Doyle",
      role: "School of Public Health",
    },
  ];

  const PACKAGES = [
    {
      id: "standard",
      name: "Standard",
      turnaround: "1 day",
      fromPrice: "CHF 77",
      featured: false,
      ctaClass: "btn-outline",
    },
    {
      id: "rapid",
      name: "Rapid",
      turnaround: "1 day",
      fromPrice: "CHF 112",
      featured: true,
      banner: "Most Popular",
      ctaClass: "btn-outline",
    },
    {
      id: "academic",
      name: "Academic",
      turnaround: "5 days",
      fromPrice: "CHF 194",
      featured: false,
      ctaClass: "btn-outline",
    },
  ];

  const PACKAGE_FEATURES = [
    {
      label: "Grammar, terminology & clarity editing",
      standard: true,
      rapid: true,
      academic: true,
    },
    {
      label: "Editing certificate",
      standard: true,
      rapid: true,
      academic: true,
    },
    {
      label: "1-year free re-editing",
      standard: false,
      rapid: true,
      academic: true,
    },
    {
      label: "Cover & response letter editing",
      standard: false,
      rapid: true,
      academic: true,
    },
    {
      label: "Two dedicated editors",
      standard: false,
      rapid: true,
      academic: true,
    },
    {
      label: "Figure & Table Editing",
      standard: false,
      rapid: "10% off",
      academic: "50% off",
    },
    {
      label: "Layout Editing for MDPI journals",
      standard: false,
      rapid: "10% off",
      academic: "Free",
    },
    {
      label: "2 PhD specialist editors",
      standard: false,
      rapid: false,
      academic: true,
    },
  ];

  const TIER_CARD_FEATURES = {
    standard: [
      "Grammar, terminology & clarity editing",
      "Editing certificate",
      "5-day turnaround",
    ],
    rapid: [
      "Everything in Standard",
      "1-year free re-editing",
      "Cover & response letter editing",
      "Two dedicated editors",
      "10% off Figure & Table Editing",
      "10% off Layout Editing for MDPI journals",
      "1-day turnaround",
    ],
    academic: [
      "Everything in Rapid",
      "2 PhD specialist editors",
      "50% off Figure & Table Editing",
      "Free Layout Editing for MDPI journals",
      "5-day turnaround",
    ],
  };

  const ICONS = {
    journal:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 4h7l3 3v13H7V4Z"/><path d="M14 4v4h4M9 12h6M9 16h4"/></svg>',
    publication:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/></svg>',
    native:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>',
    phd:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="M6 11v4c0 2.2 2.7 4 6 4s6-1.8 6-4v-4"/></svg>',
  };

  let selectedTier = "rapid";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCell(value) {
    if (value === true) {
      return '<span class="pkg-check" aria-label="Included"><span class="pkg-check-icon" aria-hidden="true">✓</span></span>';
    }
    if (value === false || value == null) {
      return '<span class="pkg-unavailable" aria-hidden="true">—</span>';
    }
    const isFree = String(value).toLowerCase() === "free";
    const className = isFree ? "pkg-discount pkg-discount-free" : "pkg-discount";
    const aria = isFree ? ' aria-label="Free"' : "";
    return `<span class="${className}"${aria}>${escapeHtml(value)}</span>`;
  }

  function renderSelectButton(pkg, block = false) {
    const isSelected = selectedTier === pkg.id;
    const btnClass = isSelected ? "btn-primary" : pkg.ctaClass;
    const blockClass = block ? " btn-block" : "";
    return `<button type="button" class="btn ${btnClass} btn-sm pkg-select-btn${blockClass}" data-select-tier="${pkg.id}" aria-pressed="${isSelected ? "true" : "false"}">${isSelected ? "Selected" : "Select"}</button>`;
  }

  function quoteUrl(tier) {
    return `index.html?tier=${encodeURIComponent(tier)}#quote`;
  }

  function renderJournalCarousel(root) {
    const slides = [];
    for (let i = 0; i < JOURNAL_LOGOS.length; i += JOURNALS_PER_SLIDE) {
      slides.push(JOURNAL_LOGOS.slice(i, i + JOURNALS_PER_SLIDE));
    }

    root.innerHTML = `
      <div class="journal-carousel" data-journal-carousel aria-roledescription="carousel" aria-label="MDPI journal logos">
        <div class="journal-carousel-viewport">
          ${slides
            .map(
              (group, index) => `
            <div class="journal-carousel-slide${index === 0 ? " is-active" : ""}" data-slide="${index}" role="group" aria-roledescription="slide" aria-label="Journal logos ${index + 1} of ${slides.length}"${index === 0 ? "" : " hidden"}>
              <ul class="journal-carousel-grid">
                ${group
                  .map(
                    (logo) => `
                  <li class="language-journal-card">
                    <img src="${logo.src}" alt="" width="56" height="56" loading="lazy" />
                    <span class="language-journal-name">${escapeHtml(logo.name)}</span>
                  </li>`
                  )
                  .join("")}
              </ul>
            </div>`
            )
            .join("")}
        </div>
        ${
          slides.length > 1
            ? `<div class="journal-carousel-dots" role="tablist" aria-label="Choose journal slide">
          ${slides
            .map(
              (_, index) => `
            <button type="button" class="journal-carousel-dot${index === 0 ? " is-active" : ""}" role="tab" aria-selected="${index === 0 ? "true" : "false"}" aria-label="Slide ${index + 1}" data-slide="${index}"></button>`
            )
            .join("")}
        </div>`
            : ""
        }
      </div>`;

    initJournalCarousel(root.querySelector("[data-journal-carousel]"));
  }

  function initJournalCarousel(root) {
    if (!root) return;
    const slides = Array.from(root.querySelectorAll(".journal-carousel-slide"));
    const dots = Array.from(root.querySelectorAll(".journal-carousel-dot"));
    if (slides.length < 2) return;

    let active = 0;
    let timer = null;
    let paused = false;

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const on = i === active;
        slide.classList.toggle("is-active", on);
        slide.hidden = !on;
      });
      dots.forEach((dot, i) => {
        const on = i === active;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", on ? "true" : "false");
      });
    };

    const restart = () => {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => {
        if (!paused) show(active + 1);
      }, 6000);
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.slide) || 0);
        restart();
      });
    });

    root.addEventListener("mouseenter", () => {
      paused = true;
    });
    root.addEventListener("mouseleave", () => {
      paused = false;
    });
    root.addEventListener("focusin", () => {
      paused = true;
    });
    root.addEventListener("focusout", (event) => {
      if (!root.contains(event.relatedTarget)) paused = false;
    });

    show(0);
    restart();
  }

  function renderEditors(root) {
    root.innerHTML = `
      <div class="editor-grid">
        ${EDITORS.map(
          (editor) => `
          <article class="editor-card">
            <div class="editor-card-top">
              <div class="editor-avatar" aria-hidden="true">${escapeHtml(editor.initials)}</div>
              <div class="editor-card-title">
                <h3>${escapeHtml(editor.name)}</h3>
                <p class="editor-qualification">${escapeHtml(editor.qualification)}</p>
              </div>
            </div>
            <p class="editor-subject">${escapeHtml(editor.subject)}</p>
            <dl class="editor-meta">
              <div><dt>Experience</dt><dd>${escapeHtml(editor.experience)}</dd></div>
              <div><dt>Manuscripts edited</dt><dd>${escapeHtml(editor.manuscripts)}</dd></div>
            </dl>
            <p class="editor-bio">${escapeHtml(editor.bio)}</p>
          </article>`
        ).join("")}
      </div>`;
  }

  function renderQualifications(root) {
    root.innerHTML = `
      <div class="qualification-grid">
        ${QUALIFICATIONS.map(
          (item, index) => `
          <article class="qualification-card">
            <span class="qualification-step" aria-hidden="true">${index + 1}</span>
            <span class="service-icon qualification-icon" aria-hidden="true">${ICONS[item.icon] || ""}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <ul class="check-list">
              ${item.items.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
            </ul>
          </article>`
        ).join("")}
      </div>`;
  }

  function getTestimonialsPerGroup() {
    if (window.matchMedia("(max-width: 640px)").matches) return 1;
    if (window.matchMedia("(max-width: 1024px)").matches) return 2;
    return TESTIMONIALS_PER_GROUP;
  }

  function renderTestimonials(root) {
    if (root._testimonialTimer) {
      window.clearInterval(root._testimonialTimer);
      root._testimonialTimer = null;
    }

    const perGroup = getTestimonialsPerGroup();
    const groups = [];
    for (let i = 0; i < TESTIMONIALS.length; i += perGroup) {
      groups.push(TESTIMONIALS.slice(i, i + perGroup));
    }

    root.innerHTML = `
      <div class="testimonial-group-carousel" data-testimonial-group-carousel aria-roledescription="carousel" aria-label="Author testimonials">
        <div class="testimonial-group-track">
          ${groups
            .map(
              (group, groupIndex) => `
            <div class="testimonial-group${groupIndex === 0 ? " is-active" : ""}" data-group="${groupIndex}" role="group" aria-roledescription="slide" aria-label="Testimonials ${groupIndex + 1} of ${groups.length}"${groupIndex === 0 ? "" : " hidden"}>
              ${group
                .map(
                  (item) => `
                <article class="testimonial-card">
                  <p>${escapeHtml(item.quote)}</p>
                  <footer><strong>${escapeHtml(item.author)}</strong><span>${escapeHtml(item.role)}</span></footer>
                </article>`
                )
                .join("")}
            </div>`
            )
            .join("")}
        </div>
        <div class="testimonial-group-dots" role="tablist" aria-label="Choose testimonial group">
          ${groups
            .map(
              (_, index) => `
            <button type="button" class="testimonial-group-dot${index === 0 ? " is-active" : ""}" role="tab" aria-selected="${index === 0 ? "true" : "false"}" aria-label="Group ${index + 1}" data-group="${index}"></button>`
            )
            .join("")}
        </div>
      </div>`;

    initTestimonialGroupCarousel(root.querySelector("[data-testimonial-group-carousel]"));
    equalizeTestimonialHeights(root);
  }

  function renderPackageCompare(root) {
    const headerCells = PACKAGES.map((pkg) => {
      const classes = [
        "pkg-col-head",
        pkg.featured ? "pkg-col-featured" : "",
        selectedTier === pkg.id ? "is-selected" : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `
        <th scope="col" class="${classes}" data-tier-col="${pkg.id}">
          <div class="pkg-col-head-inner">
            ${pkg.banner ? `<span class="pkg-banner">${escapeHtml(pkg.banner)}</span>` : ""}
            <span class="pkg-name">${escapeHtml(pkg.name)}</span>
            <span class="pkg-price">${escapeHtml(pkg.fromPrice)}</span>
            <span class="pkg-turnaround">${escapeHtml(pkg.turnaround)} turnaround</span>
            ${renderSelectButton(pkg)}
          </div>
        </th>`;
    }).join("");

    const rows = PACKAGE_FEATURES.map(
      (feature) => `
      <tr>
        <th scope="row">${escapeHtml(feature.label)}</th>
        ${PACKAGES.map(
          (pkg) =>
            `<td data-tier-col="${pkg.id}">${renderCell(feature[pkg.id])}</td>`
        ).join("")}
      </tr>`
    ).join("");

    root.innerHTML = `
      <div class="package-compare-wrap" role="region" aria-label="Editing package comparison">
        <table class="package-compare-table">
          <caption class="visually-hidden">Compare Standard, Rapid, and Academic English language editing packages</caption>
          <thead>
            <tr>
              <th scope="col" class="pkg-feature-col">What's included</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="package-compare-cards" aria-label="Editing package comparison cards"></div>
      </div>
      <div class="package-compare-action">
        <div class="package-compare-action-copy">
          <p class="package-compare-action-eyebrow">Your selection</p>
          <p><strong id="selected-package-label">${escapeHtml(PACKAGES.find((p) => p.id === selectedTier).name)}</strong> · Continue to configure your quote on the homepage.</p>
        </div>
        <a href="${quoteUrl(selectedTier)}" class="btn btn-primary" id="order-selected-tier">Get a Quote — ${escapeHtml(PACKAGES.find((p) => p.id === selectedTier).name)}</a>
      </div>`;

    const cardsRoot = root.querySelector(".package-compare-cards");
    cardsRoot.innerHTML = PACKAGES.map((pkg) => {
      const featureLines = (TIER_CARD_FEATURES[pkg.id] || [])
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("");
      return `
        <article class="package-compare-card${pkg.featured ? " pkg-card-featured" : ""}${selectedTier === pkg.id ? " is-selected" : ""}" data-tier-card="${pkg.id}">
          <div class="pkg-card-top">
            <div class="pkg-card-title-row">
              ${pkg.banner ? `<span class="pkg-banner">${escapeHtml(pkg.banner)}</span>` : ""}
              <h3>${escapeHtml(pkg.name)}</h3>
            </div>
            <p class="pkg-card-price">${escapeHtml(pkg.fromPrice)}</p>
            <p class="pkg-card-meta">${escapeHtml(pkg.turnaround)} turnaround</p>
          </div>
          <ul class="check-list pkg-card-features">${featureLines}</ul>
          ${renderSelectButton(pkg, true)}
        </article>`;
    }).join("");

    root.querySelectorAll("[data-select-tier]").forEach((button) => {
      button.addEventListener("click", () => selectTier(button.dataset.selectTier, root));
    });
  }

  function selectTier(tier, root) {
    if (!PACKAGES.some((pkg) => pkg.id === tier)) return;
    selectedTier = tier;
    try {
      sessionStorage.setItem("mdpi-as-selected-tier", tier);
    } catch (_) {
      /* ignore storage errors */
    }

    root.querySelectorAll("[data-tier-col]").forEach((cell) => {
      cell.classList.toggle("is-selected", cell.dataset.tierCol === tier);
    });
    root.querySelectorAll("[data-tier-card]").forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.tierCard === tier);
    });

    root.querySelectorAll(".pkg-select-btn").forEach((button) => {
      const isActive = button.dataset.selectTier === tier;
      button.classList.toggle("btn-primary", isActive);
      button.classList.toggle("btn-outline", !isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.textContent = isActive ? "Selected" : "Select";
    });

    const pkg = PACKAGES.find((item) => item.id === tier);
    const label = root.querySelector("#selected-package-label");
    const orderLink = root.querySelector("#order-selected-tier");
    if (label) label.textContent = pkg.name;
    if (orderLink) {
      orderLink.textContent = `Get a Quote — ${pkg.name}`;
      orderLink.href = quoteUrl(tier);
    }
  }

  function initTestimonialGroupCarousel(root) {
    if (!root) return;
    const groups = Array.from(root.querySelectorAll(".testimonial-group"));
    const dots = Array.from(root.querySelectorAll(".testimonial-group-dot"));
    const equalizeHeights = () => equalizeTestimonialHeights(root);

    if (groups.length < 2) {
      equalizeHeights();
      return;
    }

    let active = 0;
    let paused = false;

    const show = (index) => {
      active = (index + groups.length) % groups.length;
      groups.forEach((group, i) => {
        const on = i === active;
        group.classList.toggle("is-active", on);
        group.hidden = !on;
      });
      dots.forEach((dot, i) => {
        const on = i === active;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", on ? "true" : "false");
      });
      window.requestAnimationFrame(equalizeHeights);
    };

    const restart = () => {
      if (root._testimonialTimer) window.clearInterval(root._testimonialTimer);
      root._testimonialTimer = window.setInterval(() => {
        if (!paused) show(active + 1);
      }, TESTIMONIAL_ROTATE_MS);
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.group) || 0);
        restart();
      });
    });

    root.addEventListener("mouseenter", () => {
      paused = true;
    });
    root.addEventListener("mouseleave", () => {
      paused = false;
    });
    root.addEventListener("focusin", () => {
      paused = true;
    });
    root.addEventListener("focusout", (event) => {
      if (!root.contains(event.relatedTarget)) paused = false;
    });

    window.addEventListener("resize", equalizeHeights);

    show(0);
    equalizeHeights();
    restart();
  }

  function equalizeTestimonialHeights(root) {
    if (!root) return;
    const cards = Array.from(root.querySelectorAll(".testimonial-card"));
    cards.forEach((card) => {
      card.style.minHeight = "";
    });
    const maxHeight = cards.reduce((max, card) => Math.max(max, card.offsetHeight), 0);
    if (maxHeight > 0) {
      cards.forEach((card) => {
        card.style.minHeight = `${maxHeight}px`;
      });
    }
    const track = root.querySelector(".testimonial-group-track");
    const activeGroup = root.querySelector(".testimonial-group.is-active");
    if (track && activeGroup) {
      track.style.minHeight = `${activeGroup.offsetHeight}px`;
    }
  }

  function init() {
    renderJournalCarousel(document.getElementById("journal-carousel-root"));
    renderEditors(document.getElementById("editor-grid-root"));
    renderQualifications(document.getElementById("qualification-grid-root"));
    const testimonialRoot = document.getElementById("testimonial-carousel-root");
    if (testimonialRoot) {
      renderTestimonials(testimonialRoot);
      let resizeTimer = null;
      window.addEventListener("resize", () => {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => renderTestimonials(testimonialRoot), 200);
      });
    }
    const compareRoot = document.getElementById("package-compare-root");
    if (compareRoot) {
      try {
        const stored = sessionStorage.getItem("mdpi-as-selected-tier");
        if (stored && PACKAGES.some((pkg) => pkg.id === stored)) {
          selectedTier = stored;
        }
      } catch (_) {
        /* ignore */
      }
      renderPackageCompare(compareRoot);
      selectTier(selectedTier, compareRoot);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
