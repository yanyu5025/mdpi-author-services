#!/usr/bin/env python3
from pathlib import Path
import json
import html as H

ROOT = Path(__file__).resolve().parent
FAQ = ROOT / "faq"
FAQ.mkdir(exist_ok=True)

TOPICS = [
    {
        "id": "language-editing",
        "slug": "language-editing.html",
        "tab": "Language Editing",
        "title": "Language Editing FAQs",
        "description": "Answers about Standard, Rapid, and Academic English editing, formats, word count, and free re-editing.",
        "home_anchor": "../index.html#services",
        "items": [
            (
                "Which English language editing service should I choose?",
                "Choose <strong>Rapid</strong> for the fastest service. It includes all features of Standard and your paper is given top priority. Choose <strong>Academic</strong> for the most comprehensive service: all Rapid features plus subject-specific review by a PhD-qualified editor and a Technical Review Report. Rapid and Academic also include free English re-editing for up to 1 year.",
            ),
            (
                "What is included in the Standard service?",
                "We extensively edit and improve the language so it meets the high standard required for high-impact journals—grammar, spelling, punctuation, and awkward or ambiguous sentences. Your voice and wording are kept where possible. Discipline-specific terminology is not guaranteed; choose Academic for a PhD editor in your field. Completed in 5 days.",
            ),
            (
                "What is included in the Rapid service?",
                "The same high-quality editing as Standard, completed within 1 day of payment. Includes free re-editing for up to 1 year, one-time complimentary editing of a cover letter and reviewer response letter, and a 10% discount on Figure and Table Editing.",
            ),
            (
                "What is included in the Academic service?",
                "All Rapid features, plus subject-specific editing and a Technical Review Report from a PhD-qualified editor. Includes Figure and Table Editing, and Layout Editing for MDPI journals. Completed in 5 days.",
            ),
            (
                "What is included in free re-editing?",
                "Included with Rapid and Academic for up to 365 days after service completion. Completed within 2 business days of confirmed receipt. Free if the latest version is no more than 20% longer than the original; otherwise a 60% discount applies on a new Rapid submission. Limited to language revisions (not subject-specific checks or reviewer-driven content revisions). Email authorservices@mdpi.com with manuscript ID (english-xxxxx).",
            ),
            (
                "What level of proofreading can I expect?",
                "We provide extensive expert-level proofreading—grammar, spelling, and punctuation—so your work is clear and publication-ready. Contact authorservices@mdpi.com for a free sample.",
            ),
            (
                "Which paper formats are accepted? Can you edit LaTeX?",
                "Microsoft Word and LaTeX are accepted. For LaTeX, submit a ZIP with everything needed to compile to PDF (figures, .bib, .sty), a single .tex file that compiles with pdfTeX (e.g. TeXstudio) without errors. Contact authorservices@mdpi.com if you need help preparing the file.",
            ),
            (
                "How do I check the word count?",
                "Only words that will be edited count. Author names, affiliations, and References are excluded. Remove sections that do not need editing. Table text is counted automatically—remove long tables that do not need editing before submission. For Academic or Layout Editing, keep complete manuscripts including affiliations, figures, tables, and references as required.",
            ),
            (
                "What is the maximum paper length allowed?",
                "There is no maximum length; however, please let us know if your paper is longer than 15,000 words because expected editing times may be longer.",
            ),
        ],
    },
    {
        "id": "figure-table-editing",
        "slug": "figure-table-editing.html",
        "tab": "Figures & Tables",
        "title": "Figure &amp; Table Editing FAQs",
        "description": "What’s included in figure and table editing, pricing, turnaround, and free re-editing.",
        "home_anchor": "../index.html#additional-services",
        "items": [
            (
                "What is included in the Figure and Table Editing service?",
                "We enhance your charts, graphs, and illustrations by revising colors, size, resolution, borders, fonts, and file type so your research is clearly communicated. Completed in 1 business day from payment. Choose Rapid for 10% off, or Academic to have Figure and Table Editing included.",
            ),
            (
                "Is free re-editing available for figures?",
                "Figure Editing includes one round of free re-editing within 30 days after original service completion.",
            ),
            (
                "How is the price calculated?",
                "Pricing is based on the total number of figures and tables submitted for editing (CHF 50 per figure or table in this prototype).",
            ),
        ],
    },
    {
        "id": "graphical-abstract",
        "slug": "graphical-abstract.html",
        "tab": "Graphical Abstract",
        "title": "Graphical Abstract FAQs",
        "description": "Custom graphical abstracts, delivery time, materials, and formats.",
        "home_anchor": "../index.html#additional-services",
        "items": [
            (
                "What is included in the Graphical Abstract service?",
                "Our designers create a custom graphical abstract that clearly shows the main idea of your research and meets journal requirements. After submission, you will receive instructions on the materials needed. The first draft is delivered within five working days after payment and material submission, with revision support included.",
            ),
            (
                "How much does Graphical Abstract cost?",
                "Graphical Abstract is offered at a fixed price per submission (CHF 200 in this prototype), independent of paper length.",
            ),
            (
                "Can I request specific styles or formats?",
                "Yes. Tell us any journal requirements or preferences when you submit. Multiple formats (e.g. jpg, png, tiff, pdf) can be provided to suit your needs.",
            ),
        ],
    },
    {
        "id": "layout-editing",
        "slug": "layout-editing.html",
        "tab": "Layout Editing",
        "title": "Layout Editing FAQs",
        "description": "MDPI house-style layout editing, inclusions, and Academic bundle benefits.",
        "home_anchor": "../index.html#additional-services",
        "items": [
            (
                "What is included in the Layout Editing service?",
                "We reformat your manuscript for an MDPI journal of your choice, check house-style structure, reformat references, look for missing information in references and main text, and improve presentation (font, equations, spacing). This does not include language editing, but can be combined with English editing. Completed in 1 day.",
            ),
            (
                "Is Layout Editing included with Academic?",
                "Yes. Layout Editing for MDPI journal submissions is included with the Academic language editing service.",
            ),
            (
                "Is free re-editing available for layout?",
                "Layout Editing includes one round of free re-editing within 30 days after original service completion.",
            ),
        ],
    },
    {
        "id": "video-production",
        "slug": "video-production.html",
        "tab": "Video Production",
        "title": "Video Production FAQs",
        "description": "Video Abstract, Short Take, Scholar Profile, and Scholar Interview options, pricing, and delivery.",
        "home_anchor": "../video-production.html",
        "items": [
            (
                "What video types do you offer?",
                "Video Abstract, Short Take, Scholar Profile, and Scholar Interview—designed to increase the visibility and accessibility of your research.",
            ),
            (
                "How long does video production take?",
                "The final video is delivered within 15 working days of payment, excluding correspondence or revision delays.",
            ),
            (
                "How much do video services cost?",
                "Prices are per submission: Video Abstract CHF 600, Short Take CHF 500, Scholar Profile CHF 500, and Scholar Interview CHF 400 (prototype rates matching the live site examples).",
            ),
        ],
    },
    {
        "id": "general",
        "slug": "general.html",
        "tab": "General",
        "title": "General FAQs",
        "description": "Discounts, eligibility, uploads, payment, tracking, and quality guarantee.",
        "home_anchor": "../index.html#quote",
        "items": [
            (
                "What discounts are available?",
                "IOAP-affiliated authors receive 15% off all Author Services when using an eligible institutional email. Reviewer vouchers (CHF 50 / CHF 100, with minimum spends) can be used on language editing and may be combined with IOAP. Contact authorservicesbilling@mdpi.com for voucher help.",
            ),
            (
                "Can I use Author Services for non-MDPI submissions?",
                "Yes. You do not need to submit to an MDPI journal. We can edit books, theses/dissertations, proposals, reports, and biographies. Contact authorservices@mdpi.com for a tailored quote.",
            ),
            (
                "How do I upload my manuscript?",
                "Complete revisions and accept tracked changes so the file is final. Check the word count, then use Get a Quote to enter details and submit. Editing begins after submission and payment, so upload the correct final file.",
            ),
            (
                "How much do your services cost?",
                "Use Get a Quote on the Author Services page. Language editing depends on word count; Layout Editing and Graphical Abstract are fixed-price; Figure and Table Editing depends on the number of items; Video Production is priced by video type.",
            ),
            (
                "Which payment methods are available?",
                "Pay in CHF, EUR, USD, or GBP by credit card, bank transfer, or PayPal. Credit card is fastest. PayPal includes a 5% fee. Bank transfers may take several days before editing starts. Email proof of payment to authorservicesbilling@mdpi.com to help us start sooner.",
            ),
            (
                "Can I track my submission?",
                "Log in to SuSy with the same email used for submission to check progress.",
            ),
            (
                "What are your quality guarantee and refund policies?",
                "If you are not satisfied, you may request one free re-edit. We are not responsible for content added after service completion. Services are optional and do not guarantee acceptance. Refunds are only available if poor English is shown to be the main reason for rejection. Withdrawals still require payment for work completed to date.",
            ),
            (
                "Who do I contact if I have questions or feedback?",
                "Contact the Author Services help desk at authorservices@mdpi.com.",
            ),
        ],
    },
]


def faq_items_html(items, open_first=False):
    parts = []
    for i, (q, a) in enumerate(items):
        op = " open" if open_first and i == 0 else ""
        parts.append(
            f"""              <details class="faq-item"{op}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>"""
        )
    return "\n".join(parts)


def faq_nav(active=None):
    links = []
    for t in TOPICS:
        cls = ' class="is-active"' if active == t["id"] else ""
        links.append(f'<a href="{t["slug"]}"{cls}>{t["tab"]}</a>')
    return "\n            ".join(links)


def back_bar():
    """Always return to the main Author Services page (not browser history)."""
    return """    <div class="faq-back-bar">
      <div class="container faq-back-bar-inner">
        <a class="faq-back-link" href="../index.html" id="faq-back-home">
          <span class="faq-back-arrow" aria-hidden="true">←</span>
          Back to Author Services
        </a>
      </div>
    </div>"""


def header():
    return f"""    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header faq-site-header">
      <div class="container header-inner">
        <a href="../index.html" class="logo" title="Back to Author Services">
          <img
            class="logo-img"
            src="../assets/mdpi-authors-services-logo.svg"
            alt="MDPI Author Services"
            width="125"
            height="32"
          />
        </a>
        <a href="../index.html#quote" class="btn btn-primary btn-sm">Get a Quote</a>
      </div>
    </header>
{back_bar()}"""


def footer():
    return """    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <img
            class="logo-img"
            src="../assets/mdpi-authors-services-logo.svg"
            alt="MDPI Author Services"
            width="125"
            height="32"
          />
        </div>
        <p class="footer-note">Prototype — not affiliated with production MDPI systems.</p>
        <div class="footer-links">
          <a href="mailto:authorservices@mdpi.com">authorservices@mdpi.com</a>
          <a href="language-editing.html">FAQs</a>
          <a href="https://www.mdpi.com/authors/services" target="_blank" rel="noopener">Live site</a>
        </div>
      </div>
    </footer>"""


def plain(a):
    return a.replace("<strong>", "").replace("</strong>", "")


def json_ld(topic):
    entity = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": plain(a)},
            }
            for q, a in topic["items"]
        ],
    }
    return json.dumps(entity, ensure_ascii=False, indent=2)


def topic_page(topic):
    others = "\n".join(
        f'              <li><a href="{t["slug"]}">{t["tab"]}</a></li>'
        for t in TOPICS
        if t["id"] != topic["id"]
    )
    title_plain = topic["title"].replace("&amp;", "&")
    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title_plain} | MDPI Author Services</title>
    <meta name="description" content="{H.escape(topic["description"])}" />
    <link rel="canonical" href="{topic["slug"]}" />
    <link rel="stylesheet" href="../fonts.css?v=20260716b" />
    <link rel="stylesheet" href="../styles.css?v=20260716b" />
    <link rel="stylesheet" href="../ux-enhance.css?v=20260716b" />
    <script type="application/ld+json">
{json_ld(topic)}
    </script>
  </head>
  <body class="faq-page subpage-chrome">
{header()}
    <main id="main">
      <section class="section faq-page-section">
        <div class="container">
          <nav class="faq-topic-nav" aria-label="FAQ topics">
            {faq_nav(topic["id"])}
          </nav>
          <div class="faq-page-layout">
            <div class="faq-page-main">
              <p class="eyebrow">FAQs / {topic["tab"]}</p>
              <h1>{topic["title"]}</h1>
              <p class="faq-page-lead">{topic["description"]}</p>
              <div class="faq-list faq-list-page">
{faq_items_html(topic["items"], open_first=True)}
              </div>
            </div>
            <aside class="faq-page-aside">
              <div class="faq-aside-card">
                <h2>Related</h2>
                <p><a href="{topic["home_anchor"]}">{"Open Video Production page" if topic["id"] == "video-production" else "View this service"}</a></p>
                <p><a href="../index.html#quote">Get a Quote</a></p>
                <p><a href="../index.html">← Author Services</a></p>
              </div>
              <div class="faq-aside-card">
                <h2>Other FAQ pages</h2>
                <ul class="faq-aside-list">
{others}
                </ul>
              </div>
              <div class="faq-aside-card faq-contact-card">
                <h2>Still need help?</h2>
                <p>If you cannot find the answer in our FAQs, please contact the Author Services team.</p>
                <a class="btn btn-outline btn-sm" href="mailto:authorservices@mdpi.com">
                  Email us
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
{footer()}
    <script src="../app.js?v=20260715i"></script>
  </body>
</html>
"""


def main():
    for t in TOPICS:
        (FAQ / t["slug"]).write_text(topic_page(t))
        print("wrote", t["slug"])


if __name__ == "__main__":
    main()
