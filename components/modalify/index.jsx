import { Button, Grid } from '@material-ui/core';
import {useState} from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

Modal.setAppElement('body');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

function ModalComponent (props) {
  const Component = props.Component
  const childProps = props.passedProps
  const placeholder = props.placeholder
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
  }

  return ( 
    modalIsOpen 
    ?  <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Popup"
      >
        <Component {...childProps} />
      </Modal> 
    : <Button onClick={openModal}>{placeholder || "View"}</Button>
  )
}

function Modalify(Component, props, placeholder) {
  return (<ModalComponent Component={Component} placeholder={placeholder} passedProps={props}></ModalComponent>)
}


export default Modalify