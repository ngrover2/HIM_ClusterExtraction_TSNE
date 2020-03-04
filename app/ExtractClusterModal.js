import React from 'react';
import { Button, Modal } from 'semantic-ui-react';

const ExtractModal = (props) => {

        return (
            <Modal trigger={props.triggerElement} open={props.open}>
                <Modal.Header 
                    style={props.headerStyle ? props.headerStyle : {}}
                >
                    {props.headerText}
                    {props.headerExtra && props.headerExtra}
                </Modal.Header>
                <Modal.Content scrolling={true}>
                    {   
                        props.children
                    }
                </Modal.Content>
                    <Modal.Actions>
                        {props.showActionButton &&
                            <Button.Group>
                                <Button
                                    size='big'
                                    onClick={props.onCloseButtonClick}
                                    toggle={true}
                                >
                                    {props.closeButtonValue}
                                </Button>
                                <Button.Or />
                                <Button
                                    size='big'
                                    onClick={props.onActionButtonClick}
                                    toggle={true}
                                    positive
                                >
                                    {props.actionButtonValue}
                                </Button>
                            </Button.Group>
                        }
                    </Modal.Actions>
            </Modal>
        );
}


export default ExtractModal;