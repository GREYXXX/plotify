/**
 Main component for the webapp
 */
import React, {useState, useEffect} from "react";
import {Filter} from "./Filter";
import {Chart} from "./Chart";


type Props = {

};

export const App: React.FunctionComponent<Props> = (props) => {
    const [studentAttributes, setStudentAttributes] = useState<Array<string>>([]);
    const [selectedAttribute, setSelectedAttribute] = useState<null | string>(null);

    async function loadAttributes() {
        const response = await fetch("/api/attributes");
        const data: {attributes: Array<{name: string}>} = await response.json();
        setStudentAttributes(data.attributes.map((a) => a.name));
    }
    useEffect(() => {
        loadAttributes();
    }, []);

    return (
        <div className="app">
            <h1>Plotify</h1>
            <p>A working app should allow the select box to filter the chart.</p>
            <Filter attributes={studentAttributes} selectedAttribute={selectedAttribute} onAttributeChange={setSelectedAttribute}/>
            <Chart filterAttribute={selectedAttribute}/>
        </div>
    )
};
