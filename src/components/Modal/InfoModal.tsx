import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
};

interface InfoModalProps {
  readonly isOpen: boolean;
  readonly headerText: string;
  readonly contentText: string;
}

export default function InfoModal({
  isOpen,
  headerText,
  contentText,
}: InfoModalProps) {
  const [open, setOpen] = useState(isOpen);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {headerText}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {contentText}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
