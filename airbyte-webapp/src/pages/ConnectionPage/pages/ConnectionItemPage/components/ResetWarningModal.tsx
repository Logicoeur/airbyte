import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Button, LabeledSwitch } from "components";
import { ModalBody, ModalFooter } from "components/ui/Modal";

import { ConnectionStateType } from "core/request/AirbyteClient";

interface ResetWarningModalProps {
  onClose: (withReset: boolean) => void;
  onCancel: () => void;
  stateType: ConnectionStateType;
}

export const ResetWarningModal: React.FC<ResetWarningModalProps> = ({ onCancel, onClose, stateType }) => {
  const { formatMessage } = useIntl();
  const [withReset, setWithReset] = useState(true);
  const requireFullReset = stateType === ConnectionStateType.legacy;

  return (
    <>
      <ModalBody>
        {/* 
          TODO: This should use proper text stylings once we have them available.
          See https://github.com/airbytehq/airbyte/issues/14478
        */}
        <FormattedMessage id={requireFullReset ? "connection.streamFullResetHint" : "connection.streamResetHint"} />
        <p>
          <LabeledSwitch
            checked={withReset}
            onChange={(ev) => setWithReset(ev.target.checked)}
            label={formatMessage({
              id: requireFullReset ? "connection.saveWithFullReset" : "connection.saveWithReset",
            })}
            checkbox
            data-testid="resetModal-reset-checkbox"
          />
        </p>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onCancel} secondary data-testid="resetModal-cancel">
          <FormattedMessage id="form.cancel" />
        </Button>
        <Button onClick={() => onClose(withReset)} data-testid="resetModal-save">
          <FormattedMessage id="connection.save" />
        </Button>
      </ModalFooter>
    </>
  );
};
