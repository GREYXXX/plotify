import React, {useState, useEffect} from 'react';
import {Chart as GoogleChart} from "react-google-charts";
import {GoogleChartWrapperChartType} from "react-google-charts/dist/types";


type Props = {
    filterAttribute: string | null;
};

type PlotData = {
    data: Array<any>;
    options: any;
    chartType: GoogleChartWrapperChartType;
}

export const Chart: React.FunctionComponent<Props> = (props) => {
    const [chartData, setChartData] = useState<undefined | PlotData>();

    async function loadChartData() {
        const formData = new FormData();
        if (props.filterAttribute) {
            formData.append("attribute", props.filterAttribute);
        }

        const response = await fetch("/api/chart", {
            method: "POST",
            body: formData,
        });
        const data: PlotData = await response.json();
        setChartData(data);
    }
    useEffect(() => {
        loadChartData();
    }, [props.filterAttribute]);


    if (chartData == undefined) return <p>Loading</p>;

    return <GoogleChart
        width="100%"
        height={900}
        {...chartData}
    />;
};
