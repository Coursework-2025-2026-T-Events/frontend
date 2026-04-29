#let template(cfg: none, body) = {
  assert(cfg != none)
  assert(cfg.project != none)
  assert(cfg.document != none)
  assert(cfg.students != none)

  let un(n) = "_" * n

  let storage_table = {
    set text(size: 10pt)
    place(
      bottom + left,
      dx: 5mm,
      dy: -10mm,
      rotate(
        -90deg,
        reflow: true,
        table(
          columns: (25mm, 35mm, 25mm, 25mm, 35mm),
          rows: (5mm, 7mm),
          align: center,
          [Инв. № подл.],
          [Подп. и дата],
          [Взам. инв. №],
          [Инв. № дубл.],
          [Подп. и дата],
        ),
      ),
    )
  }

  let approval_page = {
    let top_banner = [
      #set par(spacing: 0.65em)

      #text(weight: "bold", cfg.university_name)

      #cfg.faculty_name

      #cfg.edu_program_name
    ]

    let approve_table = grid(
      columns: (1fr, 1fr),
      inset: (x: 10mm, y: 3mm),
      align: center,

      [
        СОГЛАСОВАНО

        #cfg.agreed_by.position
      ],
      [
        УТВЕРЖДЕНО

        #cfg.approved_by.position
      ],

      [
        #un(13) #cfg.agreed_by.name

        "#un(3)" #un(13) #cfg.year г.
      ],
      [
        #un(13) #cfg.approved_by.name

        "#un(3)" #un(13) #cfg.year г.
      ],
    )

    let center_banner = [
      #set text(size: 14pt, weight: "bold")
      #set par(spacing: 2em)

      #par(spacing: 0.65em, cfg.project.name)

      #cfg.document.title

      ЛИСТ УТВЕРЖДЕНИЯ

      #cfg.project.approval_code
    ]

    let student_info = align(right)[
      #set par(spacing: 1em)

      Исполнитель:

      #cfg.students.map(student => [
        Студент группы #student.group

        #un(13) / #student.name /

        "#un(3)" #un(15) #cfg.year г.
      ]).join[#linebreak() #linebreak()]
    ]

    page(
      header: none,
      footer: none,
      margin: (left: 20mm, right: 10mm, top: 25mm, bottom: 15mm),
      foreground: storage_table,
    )[
      #set align(center)

      #grid(
        columns: (1fr),
        row-gutter: 1fr,
        top_banner,
        approve_table,
        center_banner,
        student_info,
        text(weight: "bold", [Москва #cfg.year]),
      )
    ]

    counter(page).update(1)
  }

  let title_page = {
    page(
      header: none,
      footer: none,
      margin: (left: 20mm, right: 10mm, top: 25mm, bottom: 15mm),
      foreground: storage_table,
    )[
      #set align(center)

      #grid(
        columns: (1fr),
        row-gutter: 1fr,
        [
          #set align(left)
          #set par(spacing: 2em)

          УТВЕРЖДЕН

          #cfg.project.approval_code
        ],
        [
          #set text(size: 14pt, weight: "bold")
          #set par(spacing: 2em)

          #par(spacing: 0.65em, cfg.project.name)

          #cfg.document.title

          #cfg.project.code

          Листов #context { counter(page).final().at(0) }
        ],
        text(weight: "bold", [Москва #cfg.year]),
      )
    ]
  }

  let outline_block = {
    pagebreak(weak: true)
    align(center, text(weight: "bold", [СОДЕРЖАНИЕ]))
    outline(title: none, indent: 5mm)
  }

  let changes_page = {
    page(
      header: none,
      footer: none,
      margin: (left: 20mm, right: 10mm, top: 25mm, bottom: 15mm),
    )[
      #set align(center)
      #set text(size: 12pt)

      #text(weight: "bold", size: 14pt, [ЛИСТ РЕГИСТРАЦИИ ИЗМЕНЕНИЙ])

      #v(10mm)

      #table(
        columns: (10mm, 15mm, 15mm, 15mm, 15mm, 20mm, 20mm, auto, auto, auto),
        rows: (auto, auto, auto) + (9.5mm,) * 18,
        align: center + horizon,
        table.cell(colspan: 10)[Лист регистрации изменений],
        table.cell(colspan: 5)[Номера листов (страниц)],
        table.cell(rowspan: 2)[Всего листов (страниц в докум.)],
        table.cell(rowspan: 2)[№ документа],
        table.cell(rowspan: 2)[Входящий № сопроводительного докум. и дата],
        table.cell(rowspan: 2)[Подп.],
        table.cell(rowspan: 2)[Дата],
        rotate(-90deg, reflow: true)[Изм.],
        rotate(-90deg, reflow: true)[Измененных],
        rotate(-90deg, reflow: true)[Замененных],
        rotate(-90deg, reflow: true)[Новых],
        rotate(-90deg, reflow: true)[Аннулированных],
      )
    ]
  }

  let normal_pages = {
    let page_number_only_header = cfg.at("page_number_only_header", default: false)

    set page(
      margin: (top: 25mm, left: 20mm, right: 10mm, bottom: 47mm),
      header: [
        #set align(center)
        #set text(weight: "bold")
        #context counter(page).display()
        #if not page_number_only_header [
          #cfg.project.code
        ]
      ],
      footer: [
        #table(
          columns: (2fr, 1fr, 1fr, 1fr, 1fr),
          align: center,
          rows: 7mm,
          [], [], [], [], [],
          [Изм.], [Лист], [№ докум.], [Подп.], [Дата],
          cfg.project.code, [], [], [], [],
          [Инв. № подл.], [Подп. и дата], [Взам. инв. №], [Инв. № дубл.], [Подп. и дата],
        )
      ],
    )

    set par(first-line-indent: 2em, justify: true, leading: 1em)
    set list(indent: 2em, spacing: 0.65em, marker: "-")
    set enum(indent: 2em, spacing: 0.65em)
    set heading(numbering: "1.")

    show heading.where(level: 1): h => {
      set align(center)
      set text(weight: "bold", size: 12pt)
      pagebreak(weak: true)
      if h.numbering != none [
        #counter(heading).display(h.numbering) #h.body
      ] else [
        #h.body
      ]
    }

    show heading.where(level: 2): h => {
      set text(weight: "bold", size: 12pt)
      block(inset: (left: 1em))[#counter(heading).display() #h.body]
    }

    show heading.where(level: 3): h => {
      set text(weight: "bold", size: 12pt)
      block(inset: (left: 3em))[#counter(heading).display() #h.body]
    }

    pagebreak(weak: true)
    align(center, text(weight: "bold", size: 12pt, [АННОТАЦИЯ]))
    cfg.annotation
    outline_block
    body
  }

  set text(lang: "ru", size: 12pt, font: "Times New Roman")

  approval_page
  title_page
  normal_pages
  changes_page
}
