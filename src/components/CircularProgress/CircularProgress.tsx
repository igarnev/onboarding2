import { CircularProgress } from "@mui/material";

import "./CircucalProgress.scss";

export const CircularProgressComponent = () => {
  return (
    <div className="loading-overlay">
      <CircularProgress
        sx={{
          position: "absolute",
          top: "30%",
          left: "40%",
          transform: "translate(-50%, -50%)",
          color: "#78f6e1",
        }}
        size={200}
        thickness={4}
      />
    </div>
  );
};
