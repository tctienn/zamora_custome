export type Menu = {
    code: string
    name: string
    type: string
    icon: string
    parentCode?: string
    application?: string
    urlPublic?: string
    urlApplication?: string
    description?: string

    children?: Menu[]
}