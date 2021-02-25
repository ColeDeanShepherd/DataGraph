import React from "react";

export interface IBlurConfirmInputProps {
  value: string;
  onChange: (newValue: string) => void;
}

export interface IBlurConfirmInputState {
  unconfirmedValue: string;
}

export class BlurConfirmInput extends React.Component<IBlurConfirmInputProps, IBlurConfirmInputState> {
  public constructor(props: IBlurConfirmInputProps) {
    super(props);
    
    this.state = {
      unconfirmedValue: props.value
    };
  }

  public componentDidUpdate(
    prevProps: IBlurConfirmInputProps,
    prevState: IBlurConfirmInputState
  ) {
    if (this.props.value !== prevProps.value) {
      this.setState({ unconfirmedValue: this.props.value });
    }
  }

  public render(): JSX.Element {
    const { onChange } = this.props;
    const { unconfirmedValue } = this.state;

    const confirmValue = () => {
      if (this.state.unconfirmedValue !== this.props.value) {
        onChange(this.state.unconfirmedValue);
        this.setState({ unconfirmedValue: this.props.value });
      }
    };

    const discardValue = () => {
      this.setState({ unconfirmedValue: this.props.value });
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Enter":
          confirmValue();
          break;
        case "Escape":
          discardValue();
          break;
      }
    };

    return (
      <input
        className="form-control"
        type="text"
        value={unconfirmedValue}
        onChange={e => this.setState({ unconfirmedValue: e.target.value })}
        onBlur={e => confirmValue()}
        onKeyDown={onKeyDown} />
    );
  }
}