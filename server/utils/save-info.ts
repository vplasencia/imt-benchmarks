import { mkdirSync, writeFileSync } from "fs"

export function saveInfoJSON(data: any, filePath: string) {
    // Convert the JavaScript object to a JSON string
    const jsonData = JSON.stringify(data, null, 4)

    mkdirSync(`./data`, { recursive: true })

    writeFileSync(filePath, jsonData, "utf8")
}
