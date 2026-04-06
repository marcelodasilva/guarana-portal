import { receipts } from "@/lib/drinks";
import OrderForm from "./ui/form";

export default function Home() {
  return <OrderForm receipts={receipts} />;
}
