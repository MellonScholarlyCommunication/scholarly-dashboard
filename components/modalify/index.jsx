/* eslint-disable react/jsx-props-no-spreading */
import { Button } from "@material-ui/core";
import { Container } from "@mui/material";
import { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("body");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

function ModalComponent(props) {
  const { passedProps, Component, placeholder } = props;
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

  return modalIsOpen ? (
    <Modal
      isOpen={modalIsOpen}
      onAfterOpen={afterOpenModal}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Popup"
    >
      <Container style={{ width: "50vw" }}>
        <Component {...passedProps} />
      </Container>
    </Modal>
  ) : (
    <Button onClick={openModal}>{placeholder || "View"}</Button>
  );
}

function Modalify(Component, props, placeholder) {
  return (
    <ModalComponent
      Component={Component}
      placeholder={placeholder}
      passedProps={props}
      style={{ zIndex: 1000000 }}
      id="test"
    />
  );
}

export default Modalify;
