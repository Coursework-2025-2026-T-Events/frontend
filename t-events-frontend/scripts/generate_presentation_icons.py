from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "presentation_icons"

INK = "#202124"
YELLOW = "#FFDD2D"
SAND = "#FFF3B8"
MIST = "#F6F7F8"
LINE = "#333438"
MUTED = "#70737A"
WHITE = "#FFFFFF"
NAVY = "#102D69"


ITEMS: list[tuple[str, str, str]] = [
    ("01-title", "1. Титульный слайд", "title"),
    ("01-01-implemented", "1.1 Что было реализовано", "frontend"),
    ("02-domain", "2. Описание предметной области", "domain"),
    ("02-01-domain-feature", "2.1 Особенность предметной области", "users"),
    ("02-02-frontend-role", "2.2 Роль frontend-части", "bridge"),
    ("03-terms", "3. Основные термины", "glossary"),
    ("03-01-event", "3.1 Мероприятие", "event"),
    ("03-02-direction", "3.2 Направление", "direction"),
    ("03-03-game-session", "3.3 Игровая сессия", "session"),
    ("03-04-progress", "3.4 Прогресс", "progress"),
    ("03-05-reward", "3.5 Награда", "reward"),
    ("03-06-qr-redeem", "3.6 QR-код и redeem-код", "qr"),
    ("03-07-role", "3.7 Роль пользователя", "role"),
    ("04-relevance", "4. Актуальность работы", "relevance"),
    ("04-01-manual-problems", "4.1 Проблемы ручного подхода", "warning"),
    ("04-02-frontend-value", "4.2 Значимость frontend-части", "value"),
    ("05-goal-tasks", "5. Цель и задачи работы", "target"),
    ("05-01-goal", "5.1 Цель", "goal"),
    ("05-02-tasks", "5.2 Задачи", "checklist"),
    ("06-requirements", "6. Требования к программному продукту", "requirements"),
    ("06-01-functional", "6.1 Функциональные требования", "functional"),
    ("06-02-technical", "6.2 Технические требования", "technical"),
    ("07-analysis", "7. Анализ существующих решений", "analysis"),
    ("07-01-education-platforms", "7.1 Образовательные платформы", "education"),
    ("07-02-bot-solutions", "7.2 Bot-решения", "bot"),
    ("07-03-conclusion", "7.3 Вывод", "conclusion"),
    ("08-solution", "8. Описание разработанного решения", "solution"),
    ("08-01-participant", "8.1 Контур участника", "participant"),
    ("08-02-stander", "8.2 Контур стендиста", "stander"),
    ("08-03-admin", "8.3 Контур администратора", "admin"),
    ("08-04-frontend-integration", "8.4 Общая роль frontend-части", "integration"),
    ("09-tools", "9. Выбор средств реализации", "tools"),
    ("09-01-nextjs", "9.1 Next.js App Router", "next"),
    ("09-02-react", "9.2 React", "react"),
    ("09-03-typescript", "9.3 TypeScript", "typescript"),
    ("09-04-react-query", "9.4 TanStack React Query", "query"),
    ("09-05-zustand", "9.5 Zustand", "store"),
    ("09-06-zod", "9.6 zod", "zod"),
    ("09-07-qr-libraries", "9.7 qrcode.react и ZXing Browser", "scanner"),
    ("10-architecture", "10. Архитектура программы", "architecture"),
    ("10-01-app-layer", "10.1 Слой src/app", "app"),
    ("10-02-features-layer", "10.2 Слой src/features", "features"),
    ("10-03-components-layer", "10.3 Слой src/components", "components"),
    ("10-04-lib-layer", "10.4 Слой src/lib", "library"),
    ("10-05-architecture-decision", "10.5 Архитектурное решение", "decision"),
    ("11-interfaces", "11. Интерфейсы и снимки экранов", "screens"),
    ("11-01-participant-ui", "11.1 Интерфейсы участника", "participant"),
    ("11-02-stander-ui", "11.2 Интерфейсы стендиста", "stander"),
    ("11-03-admin-ui", "11.3 Интерфейсы администратора", "admin"),
    ("11-04-ui-states", "11.4 UI-состояния", "states"),
    ("12-check-plan", "12. Планирование проверки работы", "test-plan"),
    ("12-01-scenarios", "12.1 Проверяемые сценарии", "scenarios"),
    ("12-02-api-contracts", "12.2 Проверка API-контрактов", "contracts"),
    ("13-check-results", "13. Результаты проверки", "test-results"),
    ("13-01-user-scenarios", "13.1 Проверенные пользовательские сценарии", "user-check"),
    ("13-02-service-scenarios", "13.2 Проверенные служебные сценарии", "service-check"),
    ("13-03-error-resilience", "13.3 Устойчивость к ошибкам данных", "resilience"),
    ("14-demo", "14. Демонстрация работы приложения", "demo"),
    ("14-01-participant-demo", "14.1 Сценарий участника", "participant"),
    ("14-02-stander-demo", "14.2 Сценарий стендиста", "stander"),
    ("14-03-admin-demo", "14.3 Сценарий администратора", "admin"),
    ("15-results", "15. Основные результаты и выводы", "results"),
    ("15-01-main-results", "15.1 Основные результаты", "checklist"),
    ("15-02-practical-value", "15.2 Практическая значимость", "value"),
    ("16-future", "16. Направления дальнейшей работы", "future"),
    ("16-01-functionality", "16.1 Расширение функциональности", "expand"),
    ("16-02-quality", "16.2 Повышение качества frontend-части", "quality"),
    ("17-sources", "17. Список использованных источников", "sources"),
    ("17-01-tech-docs", "17.1 Технологическая документация", "docs"),
    ("17-02-quality-recommendations", "17.2 Рекомендации по качеству интерфейса", "quality-docs"),
    ("18-final-formulation", "Финальная формулировка", "summary"),
]


def svg_shell(title: str, inner: str) -> str:
    return f"""<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title">
  <title id="title">{escape(title)}</title>
  <rect x="6" y="6" width="52" height="52" rx="8" fill="{MIST}"/>
  <rect x="10" y="10" width="44" height="44" rx="8" fill="{WHITE}"/>
  <circle cx="48" cy="16" r="7" fill="{YELLOW}"/>
  {inner}
</svg>
"""


def escape(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def path(d: str, fill: str = "none", stroke: str = LINE, width: float = 3, extra: str = "") -> str:
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'


def line(x1: int, y1: int, x2: int, y2: int, stroke: str = LINE, width: float = 3) -> str:
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round"/>'


def circle(cx: int, cy: int, r: int, fill: str = "none", stroke: str = LINE, width: float = 3) -> str:
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def rect(x: int, y: int, w: int, h: int, rx: int = 4, fill: str = "none", stroke: str = LINE, width: float = 3) -> str:
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def text_icon(value: str, x: int = 32, y: int = 38, size: int = 18) -> str:
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="{size}" font-weight="700" fill="{INK}">{escape(value)}</text>'


def motif(kind: str) -> str:
    common_doc = rect(19, 16, 26, 34) + line(25, 25, 39, 25) + line(25, 33, 39, 33) + line(25, 41, 34, 41)
    motifs = {
        "title": rect(17, 19, 30, 26) + line(23, 28, 41, 28) + line(23, 36, 35, 36),
        "frontend": rect(16, 18, 32, 24) + line(16, 26, 48, 26) + path("M25 49H39") + path("M32 42V49"),
        "domain": path("M18 42V24L32 16L46 24V42") + line(24, 42, 24, 30) + line(40, 42, 40, 30) + line(24, 30, 40, 30),
        "users": circle(25, 25, 6) + circle(40, 28, 5) + path("M16 47C18 39 32 39 34 47") + path("M33 47C35 41 47 41 49 47"),
        "bridge": path("M14 42C20 30 44 30 50 42") + line(18, 42, 46, 42) + line(22, 37, 22, 45) + line(32, 34, 32, 45) + line(42, 37, 42, 45),
        "glossary": common_doc + circle(44, 44, 6, YELLOW, LINE, 2),
        "event": rect(17, 18, 30, 29) + line(17, 27, 47, 27) + line(24, 15, 24, 21) + line(40, 15, 40, 21) + circle(32, 37, 4, YELLOW, LINE, 2),
        "direction": path("M16 32H46") + path("M37 22L47 32L37 42") + circle(21, 32, 4, YELLOW, LINE, 2),
        "session": rect(16, 18, 32, 28) + path("M28 28L38 32L28 36Z", YELLOW, LINE, 2),
        "progress": line(17, 46, 47, 46) + rect(20, 34, 5, 12, 2, YELLOW, LINE, 2) + rect(30, 27, 5, 19, 2, SAND, LINE, 2) + rect(40, 20, 5, 26, 2, WHITE, LINE, 2),
        "reward": path("M24 18H40V30C40 37 32 43 32 43C32 43 24 37 24 30V18Z", SAND, LINE, 3) + path("M27 50H37") + path("M32 43V50") + path("M28 27L31 30L37 24"),
        "qr": rect(18, 18, 10, 10, 1) + rect(36, 18, 10, 10, 1) + rect(18, 36, 10, 10, 1) + path("M36 36H42V42H46") + line(34, 46, 46, 46) + line(46, 34, 46, 38),
        "role": circle(32, 24, 7) + path("M20 48C22 38 42 38 44 48") + path("M47 19L50 22L55 15", "none", YELLOW, 3),
        "relevance": circle(32, 32, 16, SAND, LINE, 3) + line(32, 22, 32, 34) + circle(32, 41, 1, LINE, LINE, 2),
        "warning": path("M32 16L50 48H14L32 16Z", SAND, LINE, 3) + line(32, 27, 32, 37) + circle(32, 43, 1, LINE, LINE, 2),
        "value": path("M16 34L27 45L49 21") + circle(44, 24, 7, YELLOW, LINE, 2),
        "target": circle(32, 32, 18) + circle(32, 32, 10) + circle(32, 32, 3, YELLOW, LINE, 2),
        "goal": circle(32, 32, 16) + path("M32 32L44 22") + circle(44, 22, 4, YELLOW, LINE, 2),
        "checklist": common_doc + path("M24 26L27 29L33 23") + path("M24 36L27 39L33 33"),
        "requirements": rect(18, 17, 28, 34) + line(24, 27, 40, 27) + line(24, 35, 40, 35) + path("M22 43H30"),
        "functional": path("M18 32H46") + path("M32 18V46") + circle(32, 32, 5, YELLOW, LINE, 2),
        "technical": circle(32, 32, 6, YELLOW, LINE, 2) + path("M32 16V22M32 42V48M16 32H22M42 32H48M21 21L25 25M39 39L43 43M43 21L39 25M25 39L21 43"),
        "analysis": circle(28, 28, 12) + line(37, 37, 48, 48) + line(23, 28, 33, 28),
        "education": rect(17, 24, 30, 18) + path("M16 24L32 16L48 24L32 32L16 24Z", SAND, LINE, 3) + line(32, 32, 32, 42),
        "bot": rect(18, 23, 28, 21) + line(32, 17, 32, 23) + circle(26, 33, 2, LINE, LINE, 2) + circle(38, 33, 2, LINE, LINE, 2) + line(27, 40, 37, 40),
        "conclusion": path("M17 35L27 45L48 21") + line(18, 20, 43, 20) + line(18, 27, 36, 27),
        "solution": path("M20 32C20 24 25 18 32 18C39 18 44 24 44 32C44 38 40 41 36 44H28C24 41 20 38 20 32Z", SAND, LINE, 3) + line(28, 50, 36, 50),
        "participant": circle(32, 23, 7) + path("M21 47C23 37 41 37 43 47") + path("M43 18L48 23L55 14", "none", YELLOW, 3),
        "stander": rect(20, 20, 24, 30) + line(25, 27, 39, 27) + path("M25 38L30 43L41 32", "none", YELLOW, 3),
        "admin": circle(32, 30, 6, YELLOW, LINE, 2) + path("M32 16V22M32 38V48M18 30H24M40 30H46M22 20L26 24M38 36L43 41M42 20L38 24M26 36L22 40"),
        "integration": path("M18 28H30V18H46V34H34V46H18V28Z") + line(30, 28, 34, 34),
        "tools": path("M20 44L34 30") + path("M36 18L46 28L42 32L32 22L36 18Z", SAND, LINE, 3) + path("M18 48L24 42"),
        "next": text_icon("N", 32, 40, 24) + circle(32, 32, 17),
        "react": circle(32, 32, 3, YELLOW, LINE, 2) + path("M15 32C21 22 43 22 49 32C43 42 21 42 15 32Z") + path("M23 18C35 20 43 38 41 48") + path("M41 18C29 20 21 38 23 48"),
        "typescript": rect(17, 17, 30, 30, 4, SAND, LINE, 3) + text_icon("TS", 32, 39, 14),
        "query": path("M18 42C24 34 40 34 46 42") + path("M18 28C24 20 40 20 46 28") + line(32, 24, 32, 46) + circle(32, 32, 4, YELLOW, LINE, 2),
        "store": rect(18, 18, 28, 9) + rect(18, 28, 28, 9) + rect(18, 38, 28, 9) + circle(42, 22, 1, LINE, LINE, 2),
        "zod": text_icon("Z", 32, 40, 24) + path("M19 18H45L38 32L45 46H19L26 32L19 18Z"),
        "scanner": rect(18, 18, 12, 12) + rect(34, 34, 12, 12) + path("M44 18H50V24M20 50H14V44M14 20V14H20M50 44V50H44") + circle(32, 32, 4, YELLOW, LINE, 2),
        "architecture": rect(26, 15, 12, 10, 2, SAND, LINE, 2) + rect(15, 39, 12, 10, 2) + rect(37, 39, 12, 10, 2) + line(32, 25, 32, 34) + line(21, 39, 32, 34) + line(43, 39, 32, 34),
        "app": rect(18, 17, 28, 34) + line(18, 25, 46, 25) + circle(32, 45, 2, YELLOW, LINE, 2),
        "features": rect(16, 18, 14, 14, 3, SAND, LINE, 2) + rect(34, 18, 14, 14, 3) + rect(16, 36, 14, 14, 3) + rect(34, 36, 14, 14, 3, YELLOW, LINE, 2),
        "components": rect(18, 20, 12, 12) + rect(34, 20, 12, 12, 3, SAND, LINE, 2) + rect(26, 36, 12, 12, 3, YELLOW, LINE, 2),
        "library": common_doc + path("M20 50H46") + path("M18 20H22V50H18Z", SAND, LINE, 2),
        "decision": path("M18 20H46V36H34L28 44V36H18V20Z", SAND, LINE, 3) + path("M26 28L30 32L38 24"),
        "screens": rect(15, 20, 34, 24) + line(15, 28, 49, 28) + rect(22, 34, 10, 5, 1, YELLOW, LINE, 2),
        "states": circle(22, 32, 5, SAND, LINE, 2) + circle(32, 32, 5, YELLOW, LINE, 2) + circle(42, 32, 5, WHITE, LINE, 2) + line(22, 42, 42, 42),
        "test-plan": rect(18, 18, 28, 34) + path("M24 27L28 31L36 23") + line(24, 39, 40, 39),
        "scenarios": path("M18 24H30V18H46V30H34V42H18V24Z") + path("M42 42L48 48") + circle(48, 48, 3, YELLOW, LINE, 2),
        "contracts": rect(18, 17, 28, 34) + path("M24 28H40M24 36H40") + path("M25 45L30 49L40 39", "none", YELLOW, 3),
        "test-results": path("M18 34L28 44L48 22") + rect(18, 18, 28, 34),
        "user-check": circle(28, 24, 6) + path("M18 45C20 37 36 37 38 45") + path("M38 44L43 49L51 38", "none", YELLOW, 3),
        "service-check": path("M22 44L42 24") + circle(22, 44, 5, SAND, LINE, 2) + circle(42, 24, 5, YELLOW, LINE, 2) + path("M38 44L43 49L51 38"),
        "resilience": path("M32 16L47 23V32C47 42 32 50 32 50C32 50 17 42 17 32V23L32 16Z", SAND, LINE, 3) + path("M25 32L30 37L40 27"),
        "demo": path("M20 20H44V44H20V20Z") + path("M29 28L39 32L29 36Z", YELLOW, LINE, 2),
        "results": path("M18 34L28 44L48 22") + circle(44, 24, 7, YELLOW, LINE, 2),
        "future": path("M18 42C28 25 41 20 48 18") + path("M42 16L49 18L47 25") + circle(24, 40, 4, YELLOW, LINE, 2),
        "expand": path("M32 18V46M18 32H46") + circle(32, 32, 16),
        "quality": path("M32 16L37 26L48 28L40 36L42 48L32 42L22 48L24 36L16 28L27 26L32 16Z", SAND, LINE, 3),
        "sources": common_doc + path("M22 20L32 16L42 20") + line(25, 30, 39, 30),
        "docs": rect(17, 18, 22, 30) + rect(25, 14, 22, 30, 4, SAND, LINE, 2) + line(30, 25, 42, 25) + line(30, 33, 38, 33),
        "quality-docs": common_doc + path("M28 21L32 17L36 21") + path("M26 45L31 49L41 39", "none", YELLOW, 3),
        "summary": path("M18 32L27 41L46 22") + line(18, 48, 46, 48) + circle(44, 24, 6, YELLOW, LINE, 2),
    }
    return motifs.get(kind, common_doc)


def build_index() -> str:
    rows = [
        "| Файл | Пункт |",
        "| --- | --- |",
    ]
    for filename, title, _kind in ITEMS:
        rows.append(f"| `{filename}.svg` | {title} |")
    return "# Иконки для презентации T-Events\n\n" + "\n".join(rows) + "\n"


def build_contact_sheet() -> str:
    cols = 6
    cell_w = 156
    cell_h = 120
    width = cols * cell_w
    rows = (len(ITEMS) + cols - 1) // cols
    height = rows * cell_h
    body = []
    for index, (filename, title, _kind) in enumerate(ITEMS):
        col = index % cols
        row = index // cols
        x = col * cell_w
        y = row * cell_h
        body.append(f'<g transform="translate({x},{y})">')
        body.append(f'<image href="{filename}.svg" x="46" y="8" width="64" height="64"/>')
        body.append(
            f'<text x="78" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="{INK}">{escape(title[:34])}</text>'
        )
        body.append("</g>")
    return f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">\n<rect width="100%" height="100%" fill="{WHITE}"/>\n' + "\n".join(body) + "\n</svg>\n"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, title, kind in ITEMS:
        (OUT_DIR / f"{filename}.svg").write_text(svg_shell(title, motif(kind)), encoding="utf-8")
    (OUT_DIR / "README.md").write_text(build_index(), encoding="utf-8")
    (OUT_DIR / "contact-sheet.svg").write_text(build_contact_sheet(), encoding="utf-8")
    print(f"generated {len(ITEMS)} icons in {OUT_DIR}")


if __name__ == "__main__":
    main()
