import React from 'react';
import { default as ExtractModal } from "./ExtractClusterModal";

const ChooseFileModalComponent = (props) => {
    return (
        <ExtractModal {...props}>
                {props.children}
        </ExtractModal>
    );
}

export default ChooseFileModalComponent;