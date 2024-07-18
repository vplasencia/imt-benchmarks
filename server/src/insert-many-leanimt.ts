/**
 * Generate benchmarks for the insert many function to show
 * the flow of the algorithm with a really large number of members.
 */
import { Bench, Task } from "tinybench"
import { LeanIMT } from "@zk-kit/imt"
import { poseidon2 } from "poseidon-lite"
import { saveInfoJSON } from "../utils/save-info"

const createDataToSave = (bench: Bench) => {
    const result = bench.tasks.map((task, i) => {
        if (task === undefined || task.result === undefined) return "NaN"

        let text = ""

        if (task.name.includes("LeanIMT - insertMany")) {
            const leanIMTLoopAvgExecTime = bench.tasks[i - 1].result?.mean

            const leanIMTAvgExecTime = bench.tasks[i]!.result?.mean

            if (leanIMTLoopAvgExecTime === undefined || leanIMTAvgExecTime === undefined) return

            if (leanIMTLoopAvgExecTime > leanIMTAvgExecTime) {
                text = `${(leanIMTLoopAvgExecTime / leanIMTAvgExecTime).toFixed(2)} x faster`
            } else {
                text = `${(leanIMTAvgExecTime / leanIMTLoopAvgExecTime).toFixed(2)} x slower`
            }
        }

        return {
            Function: task.name,
            "ops/sec": task.result.error ? "NaN" : parseInt(task.result.hz.toString(), 10).toLocaleString(),
            "Average Time (ms)": task.result.error ? "NaN" : task.result.mean.toFixed(5),
            Samples: task.result.error ? "NaN" : task.result.samples.length,
            "Relative to Insert": text,
            ...task.result
        }
    })

    return result
}

const generateTable = (task: Task) => {
    if (task && task.name && task.result) {
        return {
            Function: task.name,
            "ops/sec": task.result.error ? "NaN" : parseInt(task.result.hz.toString(), 10).toLocaleString(),
            "Average Time (ms)": task.result.error ? "NaN" : task.result.mean.toFixed(5),
            Samples: task.result.error ? "NaN" : task.result.samples.length
        }
    }
}

async function main() {
    // const samples = 131090

    const samples = 100

    const bench = new Bench({ time: 0, iterations: samples })

    const leanIMTHash1 = (a: any, b: any) => poseidon2([a, b])

    const leanIMTHash2 = (a: any, b: any) => poseidon2([a, b])

    let leanIMT1: LeanIMT

    let leanIMT2: LeanIMT

    let members1: bigint[]

    let members2: bigint[]

    let count1 = 0

    let count2 = 0

    bench
        .add(
            "LeanIMT - insert in Loop",
            async () => {
                for (let i = 0; i < count1; i++) {
                    leanIMT1.insert(members1[i])
                }
            },
            {
                beforeEach: () => {
                    leanIMT1 = new LeanIMT(leanIMTHash1)
                    count1 += 1
                    members1 = Array.from({ length: count1 }, (_, i) => BigInt(i))
                }
            }
        )
        .add(
            "LeanIMT - insertMany",
            async () => {
                leanIMT2.insertMany(members2)
            },
            {
                beforeEach: () => {
                    leanIMT2 = new LeanIMT(leanIMTHash2)
                    count2 += 1
                    members2 = Array.from({ length: count2 }, (_, i) => BigInt(i))
                }
            }
        )

    // await bench.warmup()
    await bench.run()

    const table = bench.table((task) => generateTable(task))

    // Add column to show how many times the LeanIMT InsertMany function is faster than the LeanIMT Insert function.
    // Formula: IMT average execution time divided by LeanIMT average execution time.
    // Using LeanIMT ops/sec divided by IMT ops/sec would work too.
    table.map((rowInfo, i) => {
        const columnName = "Relative to Insert"
        if (rowInfo && !(rowInfo["Function"] as string).includes("LeanIMT - insertMany")) {
            rowInfo[columnName] = ""
        } else if (rowInfo) {
            const leanIMTLoopAvgExecTime = bench.tasks[i - 1].result?.mean

            const leanIMTAvgExecTime = bench.tasks[i]!.result?.mean

            if (leanIMTLoopAvgExecTime === undefined || leanIMTAvgExecTime === undefined) return

            if (leanIMTLoopAvgExecTime > leanIMTAvgExecTime) {
                rowInfo[columnName] = `${(leanIMTLoopAvgExecTime / leanIMTAvgExecTime).toFixed(2)} x faster`
            } else {
                rowInfo[columnName] = `${(leanIMTAvgExecTime / leanIMTLoopAvgExecTime).toFixed(2)} x slower`
            }
        }
    })

    console.table(table)

    // console.log(bench.results)

    const filePath = "./data/insert-many-leanimt.json"

    saveInfoJSON(createDataToSave(bench), filePath)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
