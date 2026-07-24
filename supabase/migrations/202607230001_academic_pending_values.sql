alter table public.profiles
  alter column cumulative_gpa drop not null,
  alter column cumulative_gpa drop default,
  alter column approved_credits drop not null,
  alter column approved_credits drop default;

alter table public.courses
  alter column grade drop not null;

-- Las versiones anteriores del OCR guardaban 0 cuando la ficha no incluía nota.
-- Solo se corrigen filas OCR preexistentes; una nota manual igual a 0 sigue siendo válida.
update public.courses
set grade = null,
    updated_at = now()
where source = 'ocr'
  and grade = 0;

comment on column public.courses.grade is
  'Nota confirmada de 0 a 20. NULL significa pendiente de lectura o confirmación del estudiante.';

comment on column public.profiles.cumulative_gpa is
  'Promedio acumulado oficial. NULL significa que el estudiante todavía no lo confirmó.';

comment on column public.profiles.approved_credits is
  'Créditos aprobados acumulados. NULL significa que el estudiante todavía no los confirmó.';
