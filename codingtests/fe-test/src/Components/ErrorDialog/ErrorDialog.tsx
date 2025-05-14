import React, { useEffect } from "react";
import classes from "./ErrorDialog.module.css";

type ErrorDialogProps = {
  message: string;
  onClose: () => void;
  autoCloseDuration?: number;
};

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  message,
  onClose,
  autoCloseDuration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), autoCloseDuration);
    return () => clearTimeout(timer);
  }, [autoCloseDuration, onClose]);

  return (
    <div className={classes.overlay}>
      <div className={classes.content}>
        <h3 className={classes.title}>Error</h3>
        <p>{message}</p>
        <button className={classes.button} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default ErrorDialog;
