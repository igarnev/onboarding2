import { Dispatch, SetStateAction } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

import { ModalProps } from "../../models/Modal";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordWrap: "break-word",
};

interface InfoModalProps {
  readonly modalProps: ModalProps;
  readonly setModalProps: Dispatch<
    SetStateAction<{ headerText: string; contentText: string }>
  >;
}

export default function InfoModal({
  modalProps,
  setModalProps,
}: InfoModalProps) {
  return (
    <div>
      {modalProps && (
        <Modal
          open={!!modalProps.headerText}
          onClose={() => setModalProps({ headerText: "", contentText: "" })}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              {modalProps.headerText || ""}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              {modalProps.contentText || ""}
            </Typography>
          </Box>
        </Modal>
      )}
    </div>
  );
}
