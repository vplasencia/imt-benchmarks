/**
 * Generate benchmarks for the insert function to show
 * the flow of the algorithm with a really large number of members.
 */
import { Bench, Task } from "tinybench"
import { IMT, LeanIMT } from "@zk-kit/imt"
import { poseidon2 } from "poseidon-lite"
import { saveInfoJSON } from "../utils/save-info"

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
    const samples = 131090

    const bench = new Bench({ time: 0, iterations: samples })

    let imtDepth = 0
    const imtZeroValue = 0
    const imtArity = 2
    let imt: IMT

    const leanIMTHash = (a: any, b: any) => poseidon2([a, b])
    let leanIMT: LeanIMT

    bench
        .add(
            "IMT - Insert",
            () => {
                imt.insert(1n)
            },
            {
                beforeAll: () => {
                    imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
                },
                beforeEach: () => {
                    const size = imt.leaves.length

                    // If adding a new leaf does not fit the current tree depth,
                    // a new tree will be created with the current depth + 1
                    if (Math.log2(size + 1) > imtDepth) {
                        imtDepth += 1
                        imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity, imt.leaves)
                    }
                }
            }
        )
        .add(
            "LeanIMT - Insert",
            () => {
                leanIMT.insert(1n)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                }
            }
        )

    await bench.warmup()
    await bench.run()

    const table = bench.table((task) => generateTable(task))

    // Add column to show how many times the LeanIMT is faster than the IMT.
    // Formula: IMT average execution time divided by LeanIMT average execution time.
    // Using LeanIMT ops/sec divided by IMT ops/sec would work too.
    table.map((rowInfo, i) => {
        if (rowInfo && !(rowInfo["Function"] as string).includes("LeanIMT")) {
            rowInfo["Relative to IMT"] = ""
        } else if (rowInfo) {
            const imtAvgExecTime = bench.tasks[i - 1].result?.mean

            const leanIMTAvgExecTime = bench.tasks[i]!.result?.mean

            if (imtAvgExecTime && leanIMTAvgExecTime) {
                rowInfo["Relative to IMT"] = `${(imtAvgExecTime / leanIMTAvgExecTime).toFixed(2)} x faster`
            } else return "NaN"
        }
    })

    console.table(table)

    // console.log(bench.results)

    saveInfoJSON(bench.results)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
