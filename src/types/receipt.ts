
export interface OptionsSingle {
    name: string
    value?: Number
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
    value: Number,
    size?: 300 | 500
}
