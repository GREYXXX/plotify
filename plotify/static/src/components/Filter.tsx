/**
 A collection of form inputs which allow the user to filter the data displayed by the rest of the application
 */
import React from "react";
import Select from "react-select";
import {ValueType} from "react-select/src/types";


type Props = {
    attributes: Array<string>;
    selectedAttribute: string | null;
    onAttributeChange: (attribute: string | null) => void;
};

type Option = {
    value: string,
    label: string,
};

function attributeToOption(attribute: string) {
    return {
        value: attribute,
        label: attribute,
    }
}

export const Filter: React.FunctionComponent<Props> = (props) => {
    function handleSelectChange(selection: ValueType<Option>) {
        if (!selection) {
            props.onAttributeChange(null);
            return;
        }
        const selectedOption: Option = Array.isArray(selection) ? selection[0] : selection;  // Not multi-select
        props.onAttributeChange(selectedOption.value);
    }

    return (
        <div className="filter">
            <Select
                options={props.attributes.map(attributeToOption)}
                onChange={handleSelectChange}
                value={props.selectedAttribute ? attributeToOption(props.selectedAttribute) : null}
                isClearable
            />
        </div>
    )
};
