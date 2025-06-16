/**
 * Generate benchmarks for the insert function to show
 * the flow of the algorithm with a really large number of members.
 */
import { Bench, Task } from "tinybench"
import { LeanIMT } from "@zk-kit/lean-imt"
import { poseidon2 } from "poseidon-lite"

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

const getRandomInRange = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
    const samples = 1

    const bench = new Bench({ time: 0, iterations: samples })

    const leanIMTHash = (a: any, b: any) => poseidon2([a, b])
    let leanIMT: LeanIMT

    let index: number

    let members: bigint[]

    bench
        .add(
            "GenerateProof - 2^13",
            async () => {
                leanIMT = new LeanIMT(leanIMTHash, members)
                leanIMT.generateProof(index)
            },
            {
                beforeAll: () => {
                    members = Array.from({ length: 8192 }, (_, i) => BigInt(i + 1))
                },
                beforeEach: () => {
                    index = getRandomInRange(0, members.length - 1)
                }
            }
        )
        .add(
            "GenerateProof - 2^17",
            async () => {
                leanIMT = new LeanIMT(leanIMTHash, members)
                leanIMT.generateProof(index)
            },
            {
                beforeAll: () => {
                    members = Array.from({ length: 131072 }, (_, i) => BigInt(i + 1))
                },
                beforeEach: () => {
                    index = getRandomInRange(0, members.length - 1)
                }
            }
        )
        .add(
            "GenerateProof - 2^21",
            async () => {
                leanIMT = new LeanIMT(leanIMTHash, members)
                leanIMT.generateProof(index)
            },
            {
                beforeAll: () => {
                    members = Array.from({ length: 2097152 }, (_, i) => BigInt(i + 1))
                },
                beforeEach: () => {
                    index = getRandomInRange(0, members.length - 1)
                }
            }
        )
        .add(
            "GenerateProof - 2^25",
            async () => {
                leanIMT.generateProof(index)
            },
            {
                beforeAll: () => {
                    members = Array.from({ length: 33554432 }, (_, i) => BigInt(i + 1))
                    leanIMT = new LeanIMT(leanIMTHash, members)
                },
                beforeEach: () => {
                    index = getRandomInRange(0, members.length - 1)
                }
            }
        )

    // await bench.warmup();
    await bench.run()

    const table = bench.table((task) => generateTable(task))

    console.table(table)

    // console.log(bench.results)

    // const filePath = "./data/functions.json"

    // saveInfoJSON(createDataToSave(bench), filePath)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
