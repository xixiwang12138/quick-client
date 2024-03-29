import React, {useEffect, useRef, useState} from 'react';
import * as echarts from 'echarts';
import {api} from "../../../../api";
import {BaseStoreNode, ClusterDetail, SlotSet} from "../../../../api/consoleApi";
import {Button, Grid, SyncIcon} from "mds";


const buildLabel = (set: SlotSet, nodes: BaseStoreNode[]) => {
    const formatters = ['{title|{b}}{abg|}', '{weatherHead|存储节点列表}', '{hr|}'];
    for (const storeNodeID of set.storeNodes) {
        const i = nodes.findIndex(v => {
            return v.id === storeNodeID
        })
        if (i >= 0) {
            formatters.push(`{value|${nodes[i].endpoint}}`)
        }

    }

    return {
        formatter: formatters.join('\n'),
        backgroundColor: '#eee',
        borderColor: '#777',
        borderWidth: 1,
        borderRadius: 4,
        width: 200,
        rich: {
            title: {
                color: '#eee',
                align: 'center'
            },
            abg: {
                backgroundColor: '#333',
                width: '100%',
                align: 'right',
                height: 25,
                borderRadius: [4, 4, 0, 0]
            },
            weatherHead: {
                color: '#333',
                height: 40,
                width: '100',
                align: 'center'
            },
            hr: {
                borderColor: '#777',
                width: '100%',
                borderWidth: 0.5,
                height: 0
            },
            value: {
                width: '100',
                height: 30,
                align: 'center'
            },
        }
    }
}


const CoordinateAxis = () => {
    const chartRef = useRef(null);
    const [detail, setDetail] = useState<ClusterDetail>({
        sets: [],
        nodes: [],
    });
    const [hasInit, setInit] = useState<boolean>(true);

    useEffect(() => {
        api.admin.hasInit().then(res => {
            setInit(res.data.hasInit)
        })
    }, []);

    useEffect(() => {
        if (hasInit) {
            api.admin.adminDetail().then(res => {
                if (!res.data.sets) {
                    setDetail({
                        sets: [],
                        nodes: []
                    })
                    return
                }
                setDetail(res.data)
            }).finally(() => {
            })
        }
    }, [hasInit]);

    useEffect(() => {
        if (detail.sets.length <= 0) {
            return
        }
        // 初始化 ECharts 实例
        const myChart = echarts.init(chartRef.current);

        // 绘制图表
        const option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    name: '哈希槽分布图',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    padAngle: 5,
                    itemStyle: {
                        borderRadius: 10
                    },
                    label: {
                        show: false,
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 40,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: detail.sets.map(set => {
                        return {
                            name: `${set.from}-${set.to}`,
                            value: set.to - set.from,
                            label: buildLabel(set, detail.nodes)
                        }
                    }),
                }
            ]
        };
        myChart.setOption(option);

        // 在组件卸载时销毁 ECharts 实例
        return () => {
            myChart.dispose();
        };
    }, [detail, chartRef]);

    if (detail.sets.length > 0) {
        return (<div ref={chartRef} style={{width: '100%', height: '500px'}}/>)
    }
    return <Grid container>
        <Grid>
            当前集群尚未初始化，请切换到Info查看集群中的存储节点信息，确认后，点击「Init Cluster」初始化
        </Grid>
        <Grid item>
            <Button
                id={"sync"}
                type="button"
                variant="callAction"
                onClick={() => {
                    api.admin.init().then(res => {
                        setInit(true)
                    })
                }}
                icon={<SyncIcon/>}
                label={"Init Cluster"}
            />
        </Grid>
    </Grid>
};
export default CoordinateAxis;