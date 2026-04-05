
export interface OptionsSingle {
    name: string
    value?: number
    default?: boolean
}

export interface OptionsGroupReceipt {
    name:string
    options: OptionsSingle[]
    required: boolean
}

export type OptionsReceipt = OptionsGroupReceipt | OptionsSingle


export interface ReceiptShape {
    name: string
    ingredients: OptionsReceipt[]
    value: number,
    size?: 300 | 500
}
