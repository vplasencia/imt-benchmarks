"use client"

import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

import { Bench, Task } from "tinybench"

import { useEffect, useState } from "react"

import { IMT, LeanIMT } from "@zk-kit/imt"
import { poseidon2 } from "poseidon-lite"
import { ApexOptions } from "apexcharts"

const tableFunc = (task: Task) => {
    if (task && task.name && task.result) {
        return {
            Function: task.name,
            "ops/sec": task.result.error ? "NaN" : parseInt(task.result.hz.toString(), 10).toLocaleString(),
            "Average Time (ms)": task.result.error ? "NaN" : task.result.mean,
            Margin: task.result.error ? "NaN" : `\xb1${task.result.rme.toFixed(2)}%`,
            Samples: task.result.error ? "NaN" : task.result.samples.length
        }
    }
}

export type ChartProps = {
    options: ApexOptions
    series: ApexAxisChartSeries
}

export default function Home() {
    const [insertConfig, setInsertConfig] = useState({
        options: {
            chart: {
                id: "basic-bar"
            },
            xaxis: {
                categories: [1, 2, 3]
            }
        },
        series: [
            {
                name: "series-1",
                data: [1, 2, 3]
            }
        ]
    })
    // const config = {
    //     options: {
    //         chart: {
    //             id: "basic-bar"
    //         },
    //         xaxis: {
    //             categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
    //         }
    //     },
    //     series: [
    //         {
    //             name: "series-1",
    //             data: [30, 40, 45, 50, 49, 60, 70, 91]
    //         }
    //     ]
    // }
    useEffect(() => {
        const func = async () => {
            const bench = new Bench({ time: 0, iterations: 200 })
            const imtDepth = 16
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

            // console.log(bench.results[0])

            const config = {
                options: {
                    chart: {
                        id: "basic-bar"
                    },
                    xaxis: {
                        categories: Array.from({ length: 200 }, (_, i) => i + 1),
                        title: {
                            text: "Members"
                        },
                        labels: {
                            show: true,
                            rotate: 0,
                            rotateAlways: true,
                            hideOverlappingLabels: true,
                            trim: false
                        },
                        tickAmount: 5
                    },
                    yaxis: [
                        {
                            title: {
                                text: "Time (ms)"
                            },
                            labels: {
                                formatter: function (val: number) {
                                    return val.toFixed(2)
                                }
                            }
                        }
                    ]
                },
                series: [
                    {
                        name: "IMT",
                        data: bench.results[0] ? bench.results[0].samples : []
                    },
                    {
                        name: "LeanIMT",
                        data: bench.results[1] ? bench.results[1].samples : []
                    }
                ]
            }

            setInsertConfig(config)
        }
        func()
    }, [])
    return (
        <div className="app">
            <div className="row">
                <div className="mixed-chart">
                    <Chart
                        options={insertConfig.options}
                        series={insertConfig.series}
                        type="line"
                        width="800"
                        height="500"
                    />
                </div>
            </div>
        </div>
    )
}
