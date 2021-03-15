import { Card, CardContent, createStyles, TextField, WithStyles, withStyles } from '@material-ui/core';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import DoubleArrowRoundedIcon from '@material-ui/icons/DoubleArrowRounded';
import React from 'react';
import './App.scss';

const styles = (theme: any) =>
  createStyles({
    root: {
      minWidth: '75%',
      minHeight: 500,
    },
    content: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '16px !important',
    },
    fieldLeft: { marginRight: 16 },
    fieldMiddle: { margin: '0 16px 0 16px' },
    fieldRight: { marginLeft: 16 },
    textarea: {
      overflowWrap: 'normal',
      whiteSpace: 'pre',
    },
  });

interface IProps extends WithStyles<typeof styles> {}

interface IState {
  baseData: string;
  baseDataError: boolean;
  incrementalData: string;
  incrementalDataError: boolean;
  resultData: string;
}

declare type TranslationObject = { [key: string]: string | number | object | null | Array<string | number | object | null> };

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = { baseData: '', baseDataError: false, incrementalData: '', incrementalDataError: false, resultData: '' };

    this.baseDataChange = this.baseDataChange.bind(this);
    this.incrementalDataChange = this.incrementalDataChange.bind(this);
  }

  mergeJSON(base: TranslationObject, incremental: TranslationObject, result: TranslationObject) {
    const keys = [...Object.keys(base), ...Object.keys(incremental)].filter((v, i, a) => a.indexOf(v) === i);

    for (const key of keys) {
      const baseExists = base?.hasOwnProperty(key);
      const incrementalExists = incremental?.hasOwnProperty(key);

      if (incrementalExists) {
        const incrementalType = typeof incremental[key];

        if (['number', 'string'].includes(incrementalType)) {
          result[key] = incremental[key];
        } else if (Array.isArray(incremental[key])) {
          const baseValue = baseExists && Array.isArray(base[key]) ? base[key] as  [] : [];
          result[key] = [...(incremental[key] as []), ...baseValue].filter((v, i, a) => a.indexOf(v) === i);
        } else if (incrementalType === 'object') {
          result[key] = {};
          this.mergeJSON(base[key] as TranslationObject, incremental[key] as TranslationObject, result[key] as TranslationObject);
        } else {
          result[key] = null;
        }
      } else if (baseExists) {
        result[key] = base[key];
      } else {
        result[key] = null;
      }
    }
  }

  updateState(newState: IState): void {
    let anyErrors = false;
    let baseDataJson: TranslationObject = {};
    let incrementalDataJson: TranslationObject = {};

    try {
      baseDataJson = JSON.parse(newState.baseData);
      newState.baseDataError = false;
    } catch (error) {
      newState.baseDataError = true;
      anyErrors = true;
    }

    try {
      incrementalDataJson = JSON.parse(newState.incrementalData);
      newState.incrementalDataError = false;
    } catch (error) {
      newState.incrementalDataError = true;
      anyErrors = true;
    }

    if (anyErrors) {
      newState.resultData = '';
      this.setState(newState);
      return;
    }

    const result: TranslationObject = {};
    this.mergeJSON(baseDataJson, incrementalDataJson, result);

    newState.resultData = JSON.stringify(result, null, 2);
    this.setState(newState);
  }

  baseDataChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newState: IState = { ...this.state, baseData: event.target.value, incrementalData: this.state.incrementalData };
    this.updateState(newState);
  }

  incrementalDataChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newState: IState = { ...this.state, baseData: this.state.baseData, incrementalData: event.target.value };
    this.updateState(newState);
  }

  render(): JSX.Element {
    const { classes } = this.props;

    return (
      <div className="app">
        <h1 className="header">JSON Merge</h1>

        <div className="content">
          <Card className={classes.root}>
            <CardContent className={classes.content}>
              <TextField
                error={this.state.baseDataError}
                label="Base"
                multiline={true}
                rows={25}
                value={this.state.baseData}
                variant="outlined"
                className={classes.fieldLeft}
                inputProps={{ className: classes.textarea }}
                onChange={this.baseDataChange}
                fullWidth={true}
              />

              <AddRoundedIcon />

              <TextField
                error={this.state.incrementalDataError}
                label="Incremental"
                multiline={true}
                rows={25}
                value={this.state.incrementalData}
                variant="outlined"
                className={classes.fieldMiddle}
                inputProps={{ className: classes.textarea }}
                onChange={this.incrementalDataChange}
                fullWidth={true}
              />

              <DoubleArrowRoundedIcon />

              <TextField
                label="Result"
                multiline={true}
                rows={25}
                value={this.state.resultData}
                variant="outlined"
                className={classes.fieldRight}
                inputProps={{ className: classes.textarea }}
                InputProps={{ readOnly: true }}
                fullWidth={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(App);
