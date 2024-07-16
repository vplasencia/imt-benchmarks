/**
 * Generate benchmarks for the insert function to show
 * the flow of the algorithm with a really large number of members.
 */
import { Bench, Task } from "tinybench"
import { IMT, IMTMerkleProof, LeanIMT, LeanIMTMerkleProof } from "@zk-kit/imt"
import { poseidon2 } from "poseidon-lite"
import { saveInfoJSON } from "../utils/save-info"

const createDataToSave = (bench: Bench) => {
    const result = bench.tasks.map((task, i) => {
        if (task === undefined || task.result === undefined) return "NaN"

        let text = ""

        if (task.name.includes("LeanIMT")) {
            const imtAvgExecTime = bench.tasks[i - 1].result?.mean

            const leanIMTAvgExecTime = bench.tasks[i]!.result?.mean

            if (imtAvgExecTime === undefined || leanIMTAvgExecTime === undefined) return "NaN"

            if (imtAvgExecTime > leanIMTAvgExecTime) {
                text = `${(imtAvgExecTime / leanIMTAvgExecTime).toFixed(2)} x faster`
            } else {
                text = `${(leanIMTAvgExecTime / imtAvgExecTime).toFixed(2)} x slower`
            }
        }

        return {
            Function: task.name,
            "ops/sec": task.result.error ? "NaN" : parseInt(task.result.hz.toString(), 10),
            "Average Time (ms)": task.result.error ? "NaN" : task.result.mean.toFixed(5),
            Samples: task.result.error ? "NaN" : task.result.samples.length,
            "Relative to IMT": text,
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
    const samples = 100

    const bench = new Bench({ time: 0, iterations: samples })

    let imtDepth: number
    const imtZeroValue = 0
    const imtArity = 2
    let imt: IMT

    const leanIMTHash = (a: any, b: any) => poseidon2([a, b])
    let leanIMT: LeanIMT

    let index: number
    let proof: IMTMerkleProof | LeanIMTMerkleProof

    // Members to insert in when running the inserMany function
    let members: bigint[]

    bench
        .add(
            "IMT - Insert",
            async () => {
                imt.insert(1n)
            },
            {
                beforeAll: () => {
                    imtDepth = 1
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
            async () => {
                leanIMT.insert(1n)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                }
            }
        )
        .add(
            "IMT - InsertMany",
            async () => {
                for (let i = 0; i < members.length; i += 1) {
                    imt.insert(members[i])
                }
            },
            {
                beforeAll: () => {
                    imtDepth = 1
                    imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity)
                    members = []
                },
                beforeEach: () => {
                    members.push(BigInt(1n))
                    const size = imt.leaves.length

                    // If adding a new leaf does not fit the current tree depth,
                    // a new tree will be created with the current depth + 1
                    if (Math.log2(size + members.length) > imtDepth) {
                        imtDepth += 1
                        imt = new IMT(poseidon2, imtDepth, imtZeroValue, imtArity, imt.leaves)
                    }
                }
            }
        )
        .add(
            "LeanIMT - InsertMany",
            async () => {
                leanIMT.insertMany(members)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                    members = []
                },
                beforeEach: () => {
                    members.push(BigInt(1n))
                }
            }
        )
        .add(
            "IMT - Update",
            async () => {
                imt.update(index, 2n)
            },
            {
                beforeAll: () => {
                    imtDepth = 1
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
                    imt.insert(1n)
                    index = Math.floor(imt.leaves.length / 2)
                }
            }
        )
        .add(
            "LeanIMT - Update",
            async () => {
                leanIMT.update(index, 2n)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                },
                beforeEach: () => {
                    leanIMT.insert(1n)
                    index = Math.floor(leanIMT.size / 2)
                }
            }
        )
        .add(
            "IMT - Remove",
            async () => {
                imt.delete(index)
            },
            {
                beforeAll: () => {
                    imtDepth = 1
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
                    imt.insert(1n)
                    index = Math.floor(imt.leaves.length / 2)
                }
            }
        )
        .add(
            "LeanIMT - Remove",
            async () => {
                leanIMT.update(index, 0n)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                },
                beforeEach: () => {
                    leanIMT.insert(1n)
                    index = Math.floor(leanIMT.size / 2)
                }
            }
        )
        .add(
            "IMT - GenerateProof",
            async () => {
                imt.createProof(index)
            },
            {
                beforeAll: () => {
                    imtDepth = 1
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
                    imt.insert(1n)
                    index = Math.floor(imt.leaves.length / 2)
                }
            }
        )
        .add(
            "LeanIMT - GenerateProof",
            async () => {
                leanIMT.generateProof(index)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                },
                beforeEach: () => {
                    leanIMT.insert(1n)
                    index = Math.floor(leanIMT.size / 2)
                }
            }
        )
        .add(
            "IMT - VerifyProof",
            async () => {
                imt.verifyProof(proof as IMTMerkleProof)
            },
            {
                beforeAll: () => {
                    imtDepth = 1
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
                    imt.insert(1n)
                    index = Math.floor(imt.leaves.length / 2)
                    proof = imt.createProof(index)
                }
            }
        )
        .add(
            "LeanIMT - VerifyProof",
            async () => {
                leanIMT.verifyProof(proof as LeanIMTMerkleProof)
            },
            {
                beforeAll: () => {
                    leanIMT = new LeanIMT(leanIMTHash)
                },
                beforeEach: () => {
                    leanIMT.insert(1n)
                    index = Math.floor(leanIMT.size / 2)
                    proof = leanIMT.generateProof(index)
                }
            }
        )

    // await bench.warmup();
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

            if (imtAvgExecTime === undefined || leanIMTAvgExecTime === undefined) return

            if (imtAvgExecTime > leanIMTAvgExecTime) {
                rowInfo["Relative to IMT"] = `${(imtAvgExecTime / leanIMTAvgExecTime).toFixed(2)} x faster`
            } else {
                rowInfo["Relative to IMT"] = `${(leanIMTAvgExecTime / imtAvgExecTime).toFixed(2)} x slower`
            }
        }
    })

    console.table(table)

    // console.log(bench.results)

    const filePath = "./data/functions.json"

    saveInfoJSON(createDataToSave(bench), filePath)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
