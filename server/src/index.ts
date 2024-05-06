import { Bench, Task } from "tinybench"
import { IMT, IMTMerkleProof, LeanIMT, LeanIMTMerkleProof } from "@zk-kit/imt"
import { poseidon2 } from "poseidon-lite"

const generateTable = (task: Task) => {
    if (task && task.name && task.result) {
        return {
            Function: task.name,
            "ops/sec": task.result.error ? "NaN" : parseInt(task.result.hz.toString(), 10).toLocaleString(),
            "Average Time (ms)": task.result.error ? "NaN" : task.result.mean.toFixed(5),
            Margin: task.result.error ? "NaN" : `\xb1${task.result.rme.toFixed(2)}%`,
            Samples: task.result.error ? "NaN" : task.result.samples.length
        }
    }
}

async function main() {
    const bench = new Bench({ time: 0, iterations: 100 })

    const imtDepth = 16
    const imtZeroValue = 0
    const imtArity = 2
    let imt: IMT

    const leanIMTHash = (a: any, b: any) => poseidon2([a, b])
    let leanIMT: LeanIMT

    let imtProof: IMTMerkleProof
    let leanIMTProof: LeanIMTMerkleProof

    bench
        .add(
            "IMT - Insert",
            () => {
                imt.insert(1n)
            },
            {
                beforeAll: () => {
                    imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
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
        .add(
            "IMT - Update",
            () => {
                imt.update(0, 2n)
            },
            {
                beforeAll: () => {
                    imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
                    Array.from({ length: 10 }, (_, i) => imt.insert(BigInt(i)))
                }
            }
        )
        .add(
            "LeanIMT - Update",
            () => {
                leanIMT.update(0, 2n)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                    leanIMT.insertMany(Array.from({ length: 10 }, (_, i) => BigInt(i)))
                }
            }
        )
        .add(
            "IMT - insertMany",
            () => {
                Array.from({ length: 10 }, (_, i) => imt.insert(BigInt(i)))
            },
            {
                beforeAll: () => {
                    imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
                }
            }
        )
        .add(
            "LeanIMT - insertMany",
            () => {
                leanIMT.insertMany(Array.from({ length: 10 }, (_, i) => BigInt(i)))
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                }
            }
        )
        .add(
            "IMT - delete",
            () => {
                imt.delete(0)
            },
            {
                beforeAll: () => {
                    imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
                    Array.from({ length: 10 }, (_, i) => imt.insert(BigInt(i)))
                }
            }
        )
        .add(
            "LeanIMT - delete",
            () => {
                leanIMT.update(0, 0n)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                    leanIMT.insertMany(Array.from({ length: 10 }, (_, i) => BigInt(i)))
                }
            }
        )
        .add(
            "IMT - createProof",
            () => {
                imt.createProof(0)
            },
            {
                beforeAll: () => {
                    imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
                    Array.from({ length: 10 }, (_, i) => imt.insert(BigInt(i)))
                }
            }
        )
        .add(
            "LeanIMT - generateProof",
            () => {
                leanIMT.generateProof(0)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                    leanIMT.insertMany(Array.from({ length: 10 }, (_, i) => BigInt(i)))
                }
            }
        )
        .add(
            "IMT - verifyProof",
            () => {
                imt.verifyProof(imtProof)
            },
            {
                beforeAll: () => {
                    imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
                    Array.from({ length: 10 }, (_, i) => imt.insert(BigInt(i)))
                    imtProof = imt.createProof(0)
                }
            }
        )
        .add(
            "LeanIMT - verifyProof",
            () => {
                leanIMT.verifyProof(leanIMTProof)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                    leanIMT.insertMany(Array.from({ length: 10 }, (_, i) => BigInt(i)))
                    leanIMTProof = leanIMT.generateProof(0)
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

    // console.log(bench.results[0])
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

const bench = new Bench({ time: 100 })
