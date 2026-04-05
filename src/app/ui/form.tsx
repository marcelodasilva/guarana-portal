import { OptionsReceipt, ReceiptShape } from "@/types/receipt";

interface ReceiptFormProps {
    receipts: ReceiptShape[]
}

export default function ReceiptForm({receipts}: ReceiptFormProps) {
    return <>
    <h1>Faça seu Pedido!</h1>
    
    {receipts.map(r => <ReceiptFormItem receipt={r} />)}
    
    </>
}


interface ReceiptFormItemProps {
    receipt: ReceiptShape
}


function ReceiptFormItem({receipt}: ReceiptFormItemProps) {
    return <>
    <h1>{receipt.name} ({receipt.size} ML) {receipt.value.toString()}</h1>
    {receipt.ingredients.map(item => <ReceiptFormIngredient  ingredient={item}/>)}

    </>
}

interface ReceiptFormIngredientProps {
    ingredient: OptionsReceipt
}

function ReceiptFormIngredient({ingredient}:ReceiptFormIngredientProps) {
    return <>
    {ingredient.name}


    </>
}