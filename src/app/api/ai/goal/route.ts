// Endpoint retirado: MetaUTP usa IA únicamente en el detalle de oportunidades.
export async function POST() {
  return Response.json(
    { error: "La guía conversacional general ya no está disponible." },
    { status: 410 }
  );
}
