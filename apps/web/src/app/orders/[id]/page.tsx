export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container py-24 text-center">
      <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
      <p className="text-muted-foreground">Order ID: {id}</p>
      <p className="mt-4">Order details will appear here soon.</p>
    </div>
  );
}
