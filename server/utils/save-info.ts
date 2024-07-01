import { mkdirSync, writeFileSync } from "fs"

export function saveInfoJSON(data: any) {
    // Convert the JavaScript object to a JSON string
    const jsonData = JSON.stringify(data, null, 4)

    mkdirSync(`./data`, { recursive: true })

    // Specify the path and filename for the JSON file
    const filePath = "./data/data.json"

    writeFileSync(filePath, jsonData, "utf8")
}
