import ReceiptForm from "./ui/form";

export default async function Home() {
  const response = await fetch("http://localhost:3000/api")
  const data = await response.json()
  return <ReceiptForm receipts={data.receipts}  />
}